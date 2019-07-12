import $ from "jquery"
import io from "socket.io-client"
import {IClientChat} from "../client/IClient"


class Admin implements IClientChat
{
    sendButton: JQuery<HTMLElement>;
    chatArea: JQuery<HTMLElement>;
    msgArea: JQuery<HTMLElement>;
    username: string ="Admin";
    listaObecnosci: JQuery<HTMLElement>;
    socket?: SocketIOClient.Socket | undefined;

    chatDisabled: boolean = false

    constructor()
    {
        this.sendButton = $("#submit")
        this.msgArea = $("#msg")
        this.chatArea = $("#chat")

        this.listaObecnosci = $("#userlist")
        this.socket = io('/admin')
        this.socket.on('msg',(msg)=>{
            this.reciveMsg(msg);
        })
        this.sendButton.click((e)=>{
            if(this.msgArea.val()!="")this.sendMsg(<string>this.msgArea.val())
        })
        this.UpdateUsers()
        this.socket.on("UpdateProp",(checkbox:boolean)=>{
            this.chatDisabled = checkbox
            if(this.chatDisabled)
            {
                $('#disChatButton').text("OFF").removeClass("btn-primary").addClass("btn-danger")
            }
            else
            {
                $('#disChatButton').text("On").removeClass('btn-danger').addClass("btn-primary")
            }
        })
        $('#disChatButton').click(()=>{
            this.chatDisabled =!this.chatDisabled
            if(this.socket)this.socket.emit('disablechat',this.chatDisabled)
        })
        $(document).keydown((e)=> {
            if (e.keyCode == 13) {
                this.sendButton.click()
            }
        })
    }

    sendMsg(msg: string) {
        let reg = new RegExp('(@[^\\s]+)?(.+)')
        let match = reg.exec(msg)
        if(match)
        {
        if(this.socket!=null)this.socket.emit('msg',{msg:match[2],to:match[1]})
        this.msgArea.val("")
        }
    }
    reciveMsg(msg: string) {
        this.chatArea.append($('<li>').html(msg).addClass("list-group-item"))
    }
    UpdateUsers() {
        if(this.socket)
        {
            this.socket.on("UpdateUsers",(users)=>{
                this.listaObecnosci.empty()
                for(let i=0; i<users.length;i++)
                {
                    let tr = $('<tr>')
                    tr.append($('<th>').text(i))
                    tr.append($('<td>').text(users[i]))
                    let przyciski = $('<td>')
                    let sendMsg =$('<button>').addClass('btn btn-primary mr-3').attr('type','button')
                    sendMsg.append($('<i>').addClass("material-icons").text("email"))
                    sendMsg.click((e)=>{
                        this.msgArea.val('@'+users[i]+" ")
                        this.msgArea.focus()
                    })
                    przyciski.append(sendMsg)
                    let kick = $('<button>').addClass('btn btn-danger').attr('type','button')
                    kick.append($('<i>').addClass('material-icons').text("exit_to_app"))
                    kick.click((e)=>{
                        if(this.socket)this.socket.emit('kick',users[i])
                    })
                    przyciski.append(kick)
                    tr.append(przyciski)
                    this.listaObecnosci.append(tr)
                }
                let liczbaUztkownikow = this.listaObecnosci.children().length + (this.listaObecnosci.children().length!=1?" użytkowników":" użytkownik")
                $("#NOusers").text(liczbaUztkownikow)
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
        }
    }

}
$(function () {
    let admin = new Admin()
});