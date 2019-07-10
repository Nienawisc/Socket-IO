import { request } from "http";
import * as express from "express"
import {User} from "../shared/User"

let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http);

let currentConnections = {}
let users = new Array()

let newUsers: Array<User>=new Array()

app.use(express.static(__dirname +'/../../bin/client'))

io.on('connection',function(client)
{
  client.on('disconnect',function(){
    if(currentConnections[client.id]!=null)
    {
      console.log('Client '+currentConnections[client.id].login+' disconnect')
      users.splice(users.indexOf(currentConnections[client.id].login),1)
      delete currentConnections[client.id];
      updateUser()
      io.emit('UpdateUsers',newUsers)
      UpdateRooms()
    }
  })
  client.on('msg',function({msg,Room}){
    msg = "<strong>"+currentConnections[client.id].login+"</strong>: "+ msg
    console.log("["+Room+"]"+msg)
    io.to(Room).emit('msg',msg)
  })
  client.on('login', function(user){
    currentConnections[client.id] = {socket: client, login: user, room:""};
    console.log('A user: '+ user + ' was connected.');

    users.push(user)
    UpdateRooms()
  });


  client.on("JoinRoom",(roomName)=>{
    currentConnections[client.id].socket.join(roomName)
    UpdateRooms()
    newUsers.push(new User(currentConnections[client.id].login,roomName))
    currentConnections[client.id].room = roomName;
    console.log(currentConnections[client.id].login+" join to room "+ roomName)
    io.emit('UpdateUsers',newUsers)
    updateUser()
})
});

http.listen(8080, function(){
  console.log('listening on localhost:8080')
})

function UpdateRooms()
{
  let rooms = io.sockets.adapter.rooms
  let onlyRooms = {}
  for(let r in rooms)
  {
    let isRoom = true
    for(let u in currentConnections)
    {
      if(r==currentConnections[u].socket.id)isRoom=false
    }
    if(isRoom)onlyRooms[r]=rooms[r]
  }
  io.emit("UpdateRooms",onlyRooms)
}
function updateUser()
{
  newUsers.splice(0,newUsers.length)//clearing array
  for(let user in currentConnections)
  {
    newUsers.push(new User(currentConnections[user].login,currentConnections[user].room))
  }
}