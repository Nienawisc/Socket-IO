import { request } from "http";
import * as express from "express"
var path = require('path');

let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http);
const admin = io.of('/admin')
const sql = require('mssql')

var sqlConfig = {
  user: 'infosamorzad',
  password: 'info123!',
  server: '192.168.2.48', 
  database: 'infosamorzad' 
};

let currentConnections = {};
let users = new Array()

let chatDisable: boolean = false

let router = express.Router()

router.get('/admin',(req,res)=>{
  res.sendFile(path.resolve('bin/client/admin.html'));
})
router.get('/message',(req,res)=>{
  let d = new Date()
  let msg ='<strong class="text-danger">('+d.toLocaleTimeString()+') Administrator</strong>: '+  req.query.message
  console.log(msg)
  io.emit('msg',msg)
  admin.emit('msg',msg)
  res.send("Wysłano wiadomość")
})

app.use(express.static(__dirname +'/../../bin/client'),router)

sql.connect(sqlConfig,(err)=>{
  if(err)console.log(err);
  let request = new sql.Request();

  io.on('connection',function(client)
  {
    client.on('disconnect',function(){
      if(currentConnections[client.id]!=null)
      {
        let d = new Date()
        console.log('Client '+currentConnections[client.id].login+' disconnect')
        users.splice(users.indexOf(currentConnections[client.id].login),1)

        io.emit('UserConnected',{user:currentConnections[client.id].login,con:false,time:d.toLocaleTimeString()})
        admin.emit('UserConnected',{user:currentConnections[client.id].login,con:false,time:d.toLocaleTimeString()})

        request.query("execute user_online '"+currentConnections[client.id].login+"',0")

        delete currentConnections[client.id];
        io.emit('UpdateUsers',users)
        admin.emit('UpdateUsers',users)
    
      }
    })
    client.on('msg',function(msg){
      let d = new Date()
      if(chatDisable)
      {
        io.to(client.id).emit('disabledChat',d.toLocaleTimeString())
        return
      }
      msg = "<strong>("+d.toLocaleTimeString()+") "+currentConnections[client.id].login+"</strong>: "+ msg
      console.log(msg)
      io.emit('msg',msg)
      admin.emit('msg',msg)
    })
    client.on('login', function(user){
      let d = new Date()
      currentConnections[client.id] = {socket: client, login: user};
      console.log('A user: '+ user + ' was connected.');

      users.push(user)
      io.emit('UpdateUsers',users)
      admin.emit('UpdateUsers',users)
      io.emit('UserConnected',{user,con:true,time:d.toLocaleTimeString()})
      admin.emit('UserConnected',{user,con:true,time:d.toLocaleTimeString()})

      request.query("execute user_online '"+user+"',1")
    });
  });

  admin.on('connection',function(client)
  {
    console.log("Admin connected!")
    admin.emit('UpdateUsers',users)
    admin.emit('UpdateProp',chatDisable)
    client.on('disconnect',function(){
      console.log("Admin disconnected!")
    })
    client.on('msg',function({msg,to}){
      let d = new Date()
      let temp = '<strong class="text-danger">('+d.toLocaleTimeString()+') Administrator</strong>';
      if(to==null)
      {

        msg =temp + ": " + msg
        console.log(msg)
        io.emit('msg',msg)
      }
      else
      {
        to = to.substr(1)
        msg =temp +"(to "+to+"):"+msg
        privateMessage(msg,to)
        console.log("Admin send private message to "+to+": "+msg)
      }
      admin.emit('msg',msg)
    })
    client.on('kick',(userName)=>{
      for(let user in currentConnections)
      {
        if(currentConnections[user].login==userName)
        {
          io.to(currentConnections[user].socket.id).emit('kick')
          currentConnections[user].socket.disconnect()
          break
        }
      }  
    })
    client.on('disablechat',(val:boolean)=>{
      console.log("Change chat active: "+!val)
      chatDisable = val
      admin.emit('UpdateProp',chatDisable)
    })
  })
})

function privateMessage(msg:string, user:string)
{
  let socket
  for(let client in currentConnections)
  {
    if(currentConnections[client].login==user)
    {
      socket =currentConnections[client].socket;
      break;
    }
  }
  if(socket)
  {
    io.to(socket.id).emit('msg',msg)
  }
}

http.listen(8080, function(){
  console.log('listening on localhost:8080')
})

