import $ from "jquery"
import io from "socket.io-client"
import { KeyObject } from "crypto";
import {User} from "../shared/User"

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

    rooms: JQuery
    CreateNewRoom: JQuery
    roomName: JQuery
    currentRoom: string=""

    socket?: SocketIOClient.Socket

    RoomsContent: string
    CzatContent: string

    constructor ()
    {
        this.RoomsContent = $("#Rooms")[0].outerHTML
        this.CzatContent = $("#Czat")[0].outerHTML
        $("#Czat").remove()
        $("#Rooms").remove()
        this.sendButton = $("#submit")
        this.msgArea = $("#msg")
        this.chatArea = $("#chat")
        this.loginButton = $("#loginbutton")
        this.inputUsername = $("#username")
        this.loginDiv = $("#login")
        this.listaObecnosci = $("#userlist")

        this.rooms = $("#roomList")
        this.CreateNewRoom = $("#CreateNewRoom")
        this.CreateNewRoom.click((e)=>{
            if(this.socket) this.JoinToRoom(<string>this.roomName.val())
        })
        this.roomName = $("#newRoom")
        this.rooms.on('click','li',(e)=>{
            this.JoinToRoom(<string>$(e.target).attr("name"))
        })
        $("#exitButton").click((e)=>{
            if(this.socket)this.socket.emit("LeaveRoom",this.currentRoom)
            this.currentRoom="";
            this.AddToBody(this.RoomsContent)
            $("#Czat").remove()
        })
        this.sendButton.click((e)=>{
            let msg  = <string>this.msgArea.val()
            this.sendMsg(msg,this.currentRoom);
            this.msgArea.val('')
        })

        this.loginButton.click((e)=>{
            this.login()
        })
    }

    sendMsg(msg: string, Room:string) {
        if(this.socket!=null)this.socket.emit('msg',{msg, Room})
    }

    reciveMsg()
    {
        if(this.socket)this.socket.on("msg",(msg)=>{
            this.chatArea.append($('<li>').html(msg).addClass("list-group-item"))
        })
    }
    login()
    {
        this.socket = io.connect()
        this.username = <string>(this.inputUsername.val())
        this.socket.emit('login',this.username)
        this.loginDiv.remove()
        this.reciveMsg()
        this.UpdatePlayers()

        this.AddToBody(this.RoomsContent)
        this.UpdateRooms()
    }
    UpdatePlayers()
    {
        if(this.socket)this.socket.on("UpdateUsers",(users:Array<User>)=>{
            this.listaObecnosci.empty()
            for(let user in users)
            {
                if(users[user].room==this.currentRoom)
                    this.listaObecnosci.append($('<li>').text(users[user].name).addClass("dropdown-item"))
            }
        })
    }
    UpdateRooms()
    {
        if(this.socket)this.socket.on("UpdateRooms",(rooms)=>{
            this.rooms.empty()
            for(let room in rooms)
            {
                this.rooms.append(($('<li>').addClass("list-group-item").addClass("list-group-item-action").attr("name",room))
                .append($('<div>').addClass("row").attr("name",room)
                .append($('<div>').addClass("col-10").text(room).attr("name",room))
                .append($('<div>').addClass("col-2").text(rooms[room].length).attr("name",room))))
            }
        })
    }
    JoinToRoom(roomName:string)
    {
        if(this.socket) {
            this.currentRoom = roomName
            this.socket.emit("JoinRoom",roomName);
            $("#Rooms").remove()
            this.AddToBody(this.CzatContent)
        }
    }
    AddToBody(html:string)
    {
        $("body").append(html)
        this.CheckHTMLElements()

    }
    CheckHTMLElements()
    {
        this.sendButton = $("#submit")
        this.msgArea = $("#msg")
        this.chatArea = $("#chat")
        this.loginButton = $("#loginbutton")
        this.inputUsername = $("#username")
        this.loginDiv = $("#login")
        this.listaObecnosci = $("#userlist")

        this.rooms = $("#roomList")
        this.CreateNewRoom = $("#CreateNewRoom")
        this.CreateNewRoom.click((e)=>{
            if(this.socket) this.JoinToRoom(<string>this.roomName.val())
        })
        this.roomName = $("#newRoom")
        this.rooms.on('click','li',(e)=>{
            this.JoinToRoom(<string>$(e.target).attr("name"))
        })
        $("#exitButton").click((e)=>{
            if(this.socket)this.socket.emit("LeaveRoom",this.currentRoom)
            this.currentRoom="";
            this.AddToBody(this.RoomsContent)
            $("#Czat").remove()
        })

        this.sendButton.click((e)=>{
            let msg  = <string>this.msgArea.val()
            this.sendMsg(msg,this.currentRoom);
            this.msgArea.val('')
        })

        this.loginButton.click((e)=>{
            this.login()
        })
    }
};
$(function () {
    let client = new Client()
    $(document).keydown(function (e) {
        if (e.keyCode == 13) {
            client.sendButton.click()
        }
    })
})