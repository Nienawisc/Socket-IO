import { request } from "http";
import * as express from "express"

let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http);

var currentConnections = {};
let users = new Array()

app.use(express.static(__dirname +'/../../bin/client'))

io.on('connection',function(client)
{
  client.on('disconnect',function(){
    if(currentConnections[client.id]!=null)
    {
      console.log('Client '+currentConnections[client.id].login+' disconnect')
      users.splice(users.indexOf(currentConnections[client.id].login),1)
      delete currentConnections[client.id];
      io.emit('UpdateUsers',users)
    }
  })
  client.on('msg',function(msg){
    msg = "<strong>"+currentConnections[client.id].login+"</strong>: "+ msg
    console.log(msg)
    io.emit('msg',msg)
  })
  client.on('login', function(user){
    currentConnections[client.id] = {socket: client, login: user};
    console.log('A user: '+ user + ' was connected.');

    users.push(user)
    io.emit('UpdateUsers',users)
  });
});

http.listen(8080, function(){
  console.log('listening on localhost:8080')
})

