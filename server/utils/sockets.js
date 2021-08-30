const config = require('../config/environment');

function onConnect(socket) {
  // require('../api/user/user.sockets').register(socket);
}

module.exports = io => {
  io.on('connection', socket => {

    socket.on('hello', name => {
      console.log(`Hello is called`);
      io.sockets.emit("hello", `My name is ${name}`)
    });

    onConnect(socket);
    socket.connectedAt = new Date();
    // console.info('[%s] CONNECTED', socket['id']);
    // socket.on('disconnect', () => console.info('[%s] DISCONNECTED', socket['id']));
    socket.log = (...data) => console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
  })
}