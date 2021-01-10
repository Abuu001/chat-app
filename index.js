const express = require('express')
const chalk =require('chalk')
const http =require('http')
const app =  express()
require('dotenv').config({path : './config/dev.env'})
const path =require('path')
console.log(__dirname);
const {addUser,removeUser,getUsersInRoom,getUser} = require('./src/utils/users')
const server =http.createServer(app)
const socketIO =require('socket.io')
const { generateMessage } = require('./src/utils/messages')
const io = socketIO(server)

// let count =0 ;
//let message ='welcome'
io.on('connection',(socket)=>{      
    console.log("new websocket connection");

    // socket.emit('updatedCount',count)

    // socket.on('increment',()=>{
    //     count++;
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })

    //socket.emit("message",message)
   // socket.broadcast.emit('inputData' ,generateMessage('A  new user has joined '))
    
    socket.on('sendMessage',(message,callback)=>{
        //    const user =  getUser(socket.id)
       //io.to(user.room).emit('inputData',generateMessage(message))    
       
       io.emit('inputData',generateMessage(message))    
        callback()
    })

    socket.on('Location',(latitude)=>{
        io.emit("inputData","The latitude is" + latitude)
    })

    socket.on("Location-longitude",(longitude)=>{
        io.emit('inputData',"the longitude is" + longitude)
    })

    socket.on('join',({username,room},callback)=>{
       const {error ,  user} = addUser({id : socket.id, username ,room})

       if(error){
           return  callback(error)
       }
        socket.join(user.room)
        socket.emit('inputData',generateMessage('Welcome'))    
        socket.broadcast.to(user.room).emit('inputData' ,generateMessage(`${user.username} has joined  `))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on('disconnect',()=>{
       const user = removeUser(socket.id)

       if(user){
           io.to(user.room).emit('inputData',generateMessage(`${user.username}  has left !!`));
           io.to(user.room).emit('roomData',{
            room : user.room,
            users: getUsersInRoom(user.room)
           })
        }
    })

})

app.use(express.static(path.join(__dirname,"/public")))
   
app.get('',(req,res)=>{
    res.render('index')
})
    
const PORT = process.env.PORT;
server.listen(PORT, ()=>console.log(`${chalk.cyan(`Server running`)} on ${chalk.blue(`PORT`)} ${chalk.red(PORT)}`))