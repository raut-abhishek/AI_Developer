import 'dotenv/config.js';
import {Server} from 'socket.io';
import http from 'http';
import app from './app.js';

const port = process.env.PORT || 3000;


const server = http.createServer(app);

const io = new Server(server);

io.on('connection', client => {
  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => { /* … */ });
});


server.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
});