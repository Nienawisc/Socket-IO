import $ from "jquery"
import io from "socket.io-client"

export interface IClientChat {
    sendButton: JQuery
    chatArea: JQuery
    msgArea: JQuery
    username: string
    listaObecnosci: JQuery

    socket?: SocketIOClient.Socket

    sendMsg(msg: string)
    reciveMsg(msg: string)
    UpdateUsers()

}