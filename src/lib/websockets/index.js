const http = require('http').Server(app);
const io = require('socket.io')(http);

const userSockets = {};
const operSockets = {};

io.on('connection', function (socket){
    let token = false;

    socket.on('userConnect', (data) => {
        token = data.token;
        userSockets[data.token] = socket;
    });

    socket.on('operConnect', (data) => {
        token = data.token;
        operSockets[data.token] = socket;
    });

    socket.on('disconnect', () => {
        delete userSockets[token];
        delete operSockets[token];
    });

    console.log('a user connected');
});

http.listen(3000, function (){
    console.log('listening on *:3000');
});


module.exports = {
    notifyUser: function (token, message) {

    },

    notifyOperator: function (token, message) {

    }
}
