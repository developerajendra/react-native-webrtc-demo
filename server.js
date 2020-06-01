const express = require('express');
const app = express();
let https = require('https').Server(app);

const port = process.env.PORT || 3000;

let io = require('socket.io')(https);

// app.use(express.static('public'))

https.listen(port, ()=>{
    console.log('listening on ', port);  
});

io.origins('*:*') 

io.on('connection', socket=>{
    console.log('a user connected to socket');
    socket.on('joinTheRoom', room=>{
        console.log('create or join to room', room);
        const myRoom = io.sockets.adapter.rooms[room] || {length:0};
        const numClients = myRoom.length;
        console.log(room, 'has', numClients,'clients');
        
        if(numClients == 0 ){
            socket.join(room);
            socket.emit('roomCreated', room);
        }else if(numClients > 0){
            socket.join(room);
            socket.emit('roomJoined', room);
        }else {
            socket.emit('full', room);
        }
    });

    socket.on('ready', room=>{
        console.log('ready');
        
        socket.broadcast.to(room).emit('ready');
    });


    socket.on('candidate', event=>{
        console.log('candidate');
        socket.broadcast.to(event.room).emit('candidate', event);
    });


    socket.on('offer',event=>{
        console.log('offer');
        socket.broadcast.to(event.room).emit('offer', event.sdp);
    });

    socket.on('answer', event=>{
        console.log('answer');
        socket.broadcast.to(event.room).emit('answer', event.sdp);
    });

   
})

