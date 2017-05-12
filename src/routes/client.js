const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');
const controllers = require('../controllers/client');

const sha1 = require('sha1');
const pino = require('pino')();

module.exports = [
    {
        method: 'GET',
        path: '/client/messages',
        handler: controllers.messagesList,
        config: {
            description: 'Получить список сообщений',
            notes: 'Вощзвращает size сообщений после сообщения lastMessageId',
            tags: ['api', 'client'],
            validate: {
                query: {
                    size: Joi.number(),
                    lastMessageId: Joi.string()
                }
            },
            auth: 'client'
        }
    },

    {
        method: 'POST',
        path: '/client/messages/test',
        handler: controllers.testSendMessage
    },

    {
        method: 'PUT',
        path: '/client/messages',
        handler: controllers.sendMessage,
        config: {
            description: 'Отправить сообщение',
            validate: {
                payload: {
                    text: Joi.string().required()
                }
            },
            tags: ['api', 'client'],
            auth: 'client'
        }
    },


    {
        method: 'POST',
        path: '/client/authorize',
        handler: controllers.authorize,
        config: {
            description: 'Авторизация',
            validate: {
                payload: {
                    login: Joi.string().required(),
                    password: Joi.string().required(),
                }
            },
            tags: ['api', 'client'],
        }
    },

    {
        method: 'POST',
        path: '/client/fill',
        config: {
            description: 'Создать тестового пользователя',
            tags: ['api', 'client']
        },
        handler: async function (request, reply) {
            try {
                let id = randomInt(0, 2000);
                let profile = await request.db.Profile.create({
                    name: `Клиент${id}`
                });

                let line = await request.db.Line.create({
                    description: profile.name
                });

                let client = await request.db.Client.create({
                    login: 'login' + id,
                    password: sha1('pass' + id +  process.env.PASSWORD_SALT),
                    profile: profile._id,
                    line: line._id
                });

                line.client = client._id;
                await line.save();

                reply({
                    login: client.login,
                    password: 'pass' + id,
                    token: client.token
                });

            } catch (err) {
                pino.error(err);
                reply('Error').code(500);
            }
        },
    },

    {
        method: 'POST',
        path: '/client/create',
        config: {
            description: 'Создать пользователя',
            validate: {
                payload: {
                    login: Joi.string().required(),
                    password: Joi.string().required(),
                }
            },
            tags: ['api', 'client']
        },

        handler: async function (request, reply) {
            try {
                let profile = await request.db.Profile.create({
                    name: request.payload.login
                });

                let line = await request.db.Line.create({
                    description: profile.name
                });

                let client = await request.db.Client.create({
                    login: request.payload.login,
                    password: sha1(request.payload.password +  process.env.PASSWORD_SALT),
                    profile: profile._id,
                    line: line._id
                });

                line.client = client._id;
                await line.save();

                reply({
                    token: client.token
                });

            } catch (err) {
                pino.error(err);
                reply('Error').code(500);
            }
        },
    },

    {
        method: 'POST',
        path: '/client/updatePassword',
        config: {
            description: 'Изменить пароль пользователя',
            validate: {
                payload: {
                    secret: Joi.string().required(),
                    login: Joi.string().required(),
                    newPassword: Joi.string().required(),
                }
            },
            tags: ['api', 'client']
        },

        handler: async function (request, reply) {
            try {
                if (request.payload.secret !== process.env.ADMIN_SECRET) {
                    reply({error: 'Wrong secret ' + process.env.ADMIN_SECRET});
                    return;
                }
                let client = await request.db.Client.findOne({
                    login: request.payload.login
                });
                if (!client) {
                    reply({error: 'User not found'});
                    return;
                }

                client.password = sha1(request.payload.newPassword +  process.env.PASSWORD_SALT);
                await client.save();

                reply({
                    success: true
                });

            } catch (err) {
                pino.error(err);
                reply('Error').code(500);
            }
        },
    },

    {
        method: 'POST',
        path: '/client/fcmToken',
        handler: controllers.updateFcmToken,
        config: {
            description: 'Изменить device-токен',
            validate: {
                payload: {
                    token: Joi.string().required()
                }
            },
            tags: ['api', 'client'],
            auth: 'client'
        }
    },
    {
        method: 'DELETE',
        path: '/client/fcmToken',
        handler: controllers.deleteFcmToken,
        config: {
            description: 'Изменить device-токен',
            validate: {
                payload: {
                    token: Joi.string().required()
                }
            },
            tags: ['api', 'client'],
            auth: 'client'
        }
    },

    {
        method: 'GET',
        path: '/client/testSocket',
        handler: function(request, reply) {
            reply (`
                <!DOCTYPE html>
                <html>
                <head>
                    <title></title>
                </head>
                <body>
                    It works!!!

                    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.min.js"></script>
                    <script type="text/javascript">
                      var socket = io('http://95.79.46.186:3000');
                      alert(1);
                    </script>

                </body>
                </html>
            `);
        }
    }


];


function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
