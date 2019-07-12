import $ from "jquery"
import io from "socket.io-client"
import {IClientChat} from "../client/IClient"

class Client implements IClientChat
{
    sendButton: JQuery<HTMLElement>;
    chatArea: JQuery<HTMLElement>;
    msgArea: JQuery<HTMLElement>;
    listaObecnosci: JQuery<HTMLElement>;
    socket?: SocketIOClient.Socket | undefined;
    
    username: string = ""
    loginButton: JQuery
    inputUsername: JQuery
    loginDiv: JQuery

    loginContext:string

    constructor ()
    {
        $("#Czat").hide()
        this.loginContext = $("#login")[0].outerHTML;
        this.sendButton = $("#submit")
        this.msgArea = $("#msg")
        this.chatArea = $("#chat")
        this.loginButton = $("#loginbutton")
        this.loginButton.click((e)=>{
            this.login()
        })
        this.inputUsername = $("#username")
        this.loginDiv = $("#login")
        this.listaObecnosci = $("#userlist")

        this.sendButton.click((e)=>{
            e.preventDefault();
            let msg  = <string>this.msgArea.val()
            this.sendMsg(msg);
            this.msgArea.val('')
        });
        $(document).keydown((e)=> {
            if (e.keyCode == 13) {
                this.sendButton.click()
            }
        })
    }

    sendMsg(msg: string) {
        if(this.socket!=null)this.socket.emit('msg',msg)
    }

    reciveMsg(msg: string)
    {
        this.chatArea.append($('<li>').html(msg).addClass("list-group-item"))
    }
    login()
    {
        this.socket = io.connect()
        this.username = <string>(this.inputUsername.val())
        this.username = this.username.replace(' ','')
        this.socket.emit('login',this.username)
        this.loginDiv.remove()
        this.socket.on("msg",(msg)=>{
            this.reciveMsg(msg);
        })
        this.UpdateUsers()
        this.socket.on('disabledChat',(time)=>{

            let msg = "("+time+"):  Czat został wyłączony. Poczekaj, aż administracja włączy go ponownie..."
            this.chatArea.append($('<li>').html(msg).addClass("list-group-item font-italic font-weight-light"))
        })
        
        $("#Czat").show()
    }
    UpdateUsers()
    {
        if(this.socket)
        {
            this.socket.on("UpdateUsers",(users)=>{
                this.listaObecnosci.empty()
                users.forEach(element => {
                    this.listaObecnosci.append($('<li>').text(element).addClass("dropdown-item"))
                });
                $("#NOusers").text(this.listaObecnosci.children().length)
            })
            this.socket.on("UserConnected",({user,con,time})=>{
                if(con)//connected
                {
                    let msg = "("+time+") "+ user + " dołaczył do czatu"
                    this.chatArea.append($('<li>').html(msg).addClass("list-group-item font-italic font-weight-light")) 
                }
                else //disconnected
                {
                    let msg = "("+time+") "+user + " opuścił czat"
                    this.chatArea.append($('<li>').html(msg).addClass("list-group-item font-italic font-weight-light")) 
                }
            })
            this.socket.on("kick",()=>{
                $('#Czat').hide()
                $('body').append(this.loginContext)
                this.sendButton = $("#submit")
                this.msgArea = $("#msg")
                this.chatArea = $("#chat")
                this.chatArea.html("")
                this.loginButton = $("#loginbutton")
                this.loginButton.click((e)=>{
                    this.login()
                })
                this.inputUsername = $("#username")
                this.loginDiv = $("#login")
                this.listaObecnosci = $("#userlist")
            })
        }
    }
};

$(function () {
    let client = new Client()
})