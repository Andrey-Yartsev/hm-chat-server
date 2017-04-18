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
            description: 'Создать пользователя'
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
