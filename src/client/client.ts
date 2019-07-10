import $ from "jquery"
import io from "socket.io-client"

class Client
{
    sendButton: JQuery
    chatArea: JQuery
    msgArea: JQuery
    username: string = ""
    loginButton: JQuery
    inputUsername: JQuery
    loginDiv: JQuery
    listaObecnosci: JQuery

    socket?: SocketIOClient.Socket

    constructor ()
    {
        this.sendButton = $("#submit")
        this.msgArea = $("#msg")
        this.chatArea = $("#chat")
        this.loginButton = $("#loginbutton")
        this.inputUsername = $("#username")
        this.loginDiv = $("#login")
        this.listaObecnosci = $("#userlist")

        this.listaObecnosci.hide();
        $('#cssList').click(function() {
            $(this).find('ul').slideToggle();
        });
    }

    sendMsg(msg: string) {
        if(this.socket!=null)this.socket.emit('msg',msg)
    }

    reciveMsg(msg: string)
    {
        this.chatArea.append($('<li>').text(msg))
    }
    login()
    {
        this.socket = io.connect()
        this.username = <string>(this.inputUsername.val())
        this.socket.emit('login',this.username)
        this.loginDiv.remove()
        this.socket.on("msg",(msg)=>{
            this.reciveMsg(msg);
        })
        this.socket.on("UpdateUsers",(users)=>{
            this.listaObecnosci.empty()
            users.forEach(element => {
                this.listaObecnosci.append($('<li>').text(element))
            });
        })
        
    }
};
$(function () {
    let client = new Client()
    client.sendButton.click(function(e){
        e.preventDefault();
        let msg  = <string>client.msgArea.val()
        client.sendMsg(msg);
        client.msgArea.val('')
    });
    client.loginButton.click(function(e)
    {
        client.login()
    })
})