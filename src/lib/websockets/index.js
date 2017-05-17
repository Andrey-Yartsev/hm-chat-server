const socketIo = require('socket.io');
const pino = require('logstash-pino-replace')();

const clientSockets = {};
const operSockets = {};


module.exports = function (wsServer, db) {
    const io = socketIo(wsServer.listener);

    io.on('connection', function (socket){
        let id = false;

        socket.on('clientConnect', async (data) => {
            pino.info('clientConnect', data);

            let client = await db.Client.findOne({
                token: data.token
            });

            if (client) {
                pino.info('connecting to ', client._id);
                socket.join(client._id);
            }

        });

        socket.on('operConnect', async (data) => {
            pino.info('operConnect', data);

            let oper = await db.Operator.findOne({
                token: data.token
            });

            if (oper) {
                pino.info('connecting to ', oper._id);
                socket.join(oper._id);
                socket.join('opers');
            }
        });

        socket.on('disconnect', () => {
            pino.info('User disconnected', id);
        });

        console.log('a user connected');
    });

    return {
        notifyClient: function (token, type, data) {
            pino.info('notifying client', token, type);

            io.to(token).emit(type, data);

        },

        notifyOperators: function (tokens, type, data) {

            if (tokens === 'all') {
                io.to('opers').emit(type, data);
            } else {
                tokens.map((token) => {
                    pino.info('notifying operator', token, type);
                    io.to(token).emit(type, data);
                });
            }
        }
    };
};
