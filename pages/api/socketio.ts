import { Server } from 'socket.io';

const socketIoHandler = (req: any, res: any) => {

  if (res.socket.server.io) {
    console.log('Socket is attached');
  } 
    console.log('Mounting the socket')
    const io = new Server(res.socket.server);
    res.socket.server.io = io;


  io.on('connection', (socket) => {
    console.log(`Someone connected to ${socket.id}`);

    socket.on('join', (channelId) => {
      const { rooms } = io.sockets.adapter;
      const channel = rooms.get(channelId);

      if (channel === undefined) {
        socket.join(channelId);
        console.log('I created the thing');
        socket.emit('created');
      } else if (channel.size === 1) {
        socket.join(channelId);
        console.log('I joined the thing');
        socket.emit('joined');
      } else {
        console.log('its fuckin packed in there!');
        socket.emit('full');
      }
    });

    //Signal event triggered to let others know you're ready to stream
    socket.on('ready', (channelId) => {
      console.log('Ready to transmit');
      socket.broadcast.to(channelId).emit('ready');
      //TODO: expand this from 1 : 1
    });

    /*
      ICE is an exchange protocol, the READY user sends this to the user accepting offer
      its where the connection exchange finds a good route
      */
    socket.on(
      'ice-candidate',
      (candidate: RTCIceCandidate, channelId: string) => {
        console.log(candidate);
        socket.broadcast.to(channelId).emit('ice-candidate', candidate);
      }
    );

    //Offer from user who is ready to stream sent to peer
    socket.on('offer', (userOffer, channelId) => {
      console.log('i have an offer you wont refuse!');
      socket.broadcast.to(channelId).emit('offer', userOffer);
    });

    //Event emitted when peer accepts connection-offer
    socket.on('answer', (answer, channelId) => {
      console.log('I might');
      socket.broadcast.to(channelId).emit('answer', answer);
    });

    //Event to emit when connection closes when the stream shuts off
    socket.on('leave', (channelId) => {
      console.log('PEACE BITCHESSSS');
      socket.leave(channelId);
      socket.broadcast.to(channelId).emit('leave');
    });
  });
  res.end()
};

export default socketIoHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
