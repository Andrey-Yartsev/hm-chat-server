const pino = require('pino')();
const sha1 = require('sha1');

const ObjectId = require('mongoose').Types.ObjectId;

const push = require('../lib/push');

/*
    TODO: отрефачить контроллеры
*/

const getLines = async (request, reply, operators) => {
    try {
        let operator = request.auth.credentials;

        let lines = await request.db.Line.find({
            operators: operators
        }).select({
            description: true,
            viewedBy: true
        });

        lines = lines.map((line) => {
            return {
                _id: line._id,
                description: line.description,
                unread: line.viewedBy.indexOf(operator._id) === -1
            };
        });

        // add last messages to lines
        const lineIds = lines.map(function(line) {
            return line._id;
        });
        const _lastMessages = await request.db.Message.aggregate([
            {$match: {
                'line': {$in: lineIds}
            }},
            {$sort: {dt: -1}},
            {
                $group: {
                    _id: '$line',
                    dt: {$first: "$dt"},
                    line: {$first: "$line"},
                    text: {$first: "$text"}
                }
            }
        ]);
        const lastMessages = {};
        for (let v of _lastMessages) {
            lastMessages[v.line] = v;
            delete lastMessages[v.line].line;
        }
        for (let line of lines) {
            if (lastMessages[line._id]) {
                line.lastMessage = lastMessages[line._id];
            }
        }
        // added

        reply(lines);
    } catch (err) {
        pino.error(err);
        reply('Error').code(500);
    }
};

module.exports = {
    authorize: async function (request, reply) {
        let login = request.payload.login;
        let password = request.payload.password;
        let operator = await request.db.Operator.findOne({
            login: login,
            password: sha1(password + process.env.PASSWORD_SALT)
        });

        if (!operator) {
            reply('Not found').code(404);
            return;
        }

        reply({
            token: operator.token,
            id: operator.id
        });
    },

    getLines: async function (request, reply) {
        let operator = request.auth.credentials;
        getLines(request, reply, operator._id);
    },

    getNewLines: async function (request, reply) {
        getLines(request, reply, {$size: 0});
    },

    getLineDetails: async function (request, reply) {
        try {
            let line = await request.db.Line.find({
                _id: new ObjectId(request.params.id)
            })
                .select({
                    client: true,
                    operators: true,
                    description: true
                })
                .populate({
                    path: 'client',
                    select: 'profile',
                    populate: {
                        path: 'profile',
                        select: {
                            _id: true,
                            name: true,
                            avatar: true
                        }
                    }
                })
                .populate({
                    path: 'operators',
                    select: 'profile',
                    populate: {
                        path: 'profile',
                        select: {
                            _id: true,
                            name: true,
                            avatar: true
                        }
                    }
                });

            reply(line);
        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    },

    pickLine: async function (request, reply) {
        let operator = request.auth.credentials;
        let lineId = request.params.id;

        let line = await request.db.Line.findOne({
            _id: new ObjectId(lineId)
        });

        if (line.operators && line.operators.length > 0) {
            //Если в линии уже есть операторы
            if (operator.invites.indexOf(line._id) === -1) {
                //и его туда не звали
                reply('Line already picked').code(400);
                return;
            }
        }

        //удаляем приглашения
        if (operator.invites.indexOf(line._id) !== -1) {
            await operator.update({
                $pullAll: {
                    invites: [line._id]
                }
            });
        }

        line.operators.push(operator._id);

        await line.save();

        request.ws.notifyOperators('all', 'linePicked', {line: lineId});

        reply('Ok');
    },

    dropLine: async function (request, reply) {
        try {
            let operator = request.auth.credentials;
            let lineId = request.params.id;

            let result = await request.db.Line.update({
                _id: new ObjectId(lineId),
                operators: operator._id
            }, {
                $pullAll: {
                    operators: [operator._id]
                }
            });

            request.ws.notifyOperators('all', 'lineDropped', {line: lineId, operator: operator._id});

            if (result.nModified) {
                reply('Ok');
                return;
            } else {
                reply('Incorrect line id').code(400);
                return;
            }
        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    },

    getMessages: async function (request, reply) {
        try {
            let operator = request.auth.credentials;
            let lineId = request.params.id;

            //Получаем данные о линии
            let line = await request.db.Line.findById(lineId);

            if (!line || line.operators.indexOf(operator._id) === -1) {
                //если оператора нет в списке, то ему не показываем
                reply('Incorrect line id').code(400);
                return;
            }

            pino.info('getMessages');

            //Устанавливаем флаг "прочитано", если его не было
            if (line.viewedBy.indexOf(operator._id) === -1) {
                pino.info('Эта линия еще не прочитана, ставим флаг', line._id, operator._id);
                line.viewedBy.push(operator._id);
                await line.save();
            }

            let size = request.query.size ? request.query.size : 10;

            let filter = {
                line: lineId
            };

            if (request.query.lastMessageId) {
                filter._id = {
                    $lt: new ObjectId(request.query.lastMessageId)
                };
            }

            let messages = await request.db.Message
                .find(filter)
                .limit(size)
                .populate('author')
                .sort({_id: -1});

            reply(messages);
        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    },

    sendMessage: async (request, reply) => {
        try {
            let operator = request.auth.credentials;
            let lineId = request.params.id;

            let message = await request.db.Message.create({
                line: lineId,
                text: request.payload.text,
                author: operator.profile
            });

            let line = await request.db.Line.findById(lineId);

            //обновляем список просмотревших
            line.viewedBy = [operator._id];
            await line.save();

            let profile = await request.db.Profile.findById(operator.profile);

            let newMessage = {
                text: message.text,
                _id: message._id,
                line: message.line,
                author: {
                    name: profile.name,
                    _id: profile._id,
                    avatar: profile.avatar
                },
                dt: message.dt
            };

            let client = await request.db.Client.findById(line.client);
            if (client.fcmToken) {
                push(client.fcmToken, {
                    title: 'Новое сообщение',
                    body: message.text
                })
            }

            request.ws.notifyClient(line.client, 'newMessage', newMessage);
            request.ws.notifyOperators(line.operators, 'newMessage', newMessage);

            reply({status: 'success', message: newMessage});
        } catch (err){
            pino.error(err);
            reply('Error').code(500);
        }
    },

    invite: async function (request, reply) {
        try {
            let lineId = request.params.id;
            let operatorId = request.payload.operatorId;

            let result = await request.db.Operator.update({
                _id: new ObjectId(operatorId)
            }, {
                $pushAll: {
                    invites: [new ObjectId(lineId)]
                }
            });

            request.ws.notifyOperators([operatorId], 'newInvite', {line: lineId});

            reply({status: 'ok', result});

        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    },

    getInvites: async function (request, reply) {
        try {
            let lines = await request.db.Line.find({
                _id: {
                    $in: request.auth.credentials.invites
                }
            });

            reply(lines);
        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    },

    declineInvite: async function(request, reply) {
        try {
            let operator = request.auth.credentials;

            await operator.update({
                $pullAll: {
                    invites: [request.params.lineId]
                }
            });

            reply({status: 'ok'});

        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    },

    getOperators: async function (request, reply) {
        try {
            let operators = await request.db.Operator.find({}, {profile: true}).populate('profile', 'name avatar');
            reply(operators);
        } catch (err) {
            pino.error(err);
            reply('Error').code(500);
        }
    }
};
