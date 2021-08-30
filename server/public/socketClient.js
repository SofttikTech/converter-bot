const socket = io.connect('https://localhost:4000');

let id = '5e6f613980e39e5084c8cceb';

/************** Test Emit & On **************/
socket.emit('hello', 'BTC');
socket.on('hello', data => console.log(data));