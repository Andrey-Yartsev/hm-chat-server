const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');
const sha1 = require('sha1');
const controllers = require('../controllers/operator');

const pino = require('pino')();

module.exports = [
    {
        method: 'GET',
        path: '/operator/lines',
        handler: notImplemented,
        config: {
            description: 'Получить список комнат',
            notes: 'Возвращает список всех комнат',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/authorize',
        handler: controllers.authorize,
        config: {
            description: 'Получить токен по логину и паролю',
            validate: {
                payload: {
                    login: Joi.string().required(),
                    password: Joi.string().required()
                }
            },
            tags: ['api', 'operator']
        }
    },

    {
        method: 'GET',
        path: '/operator/lines/new',
        handler: notImplemented,
        config: {
            description: 'Получить список не взятых входящих',
            notes: 'Вощзвращает список не взятых входящих клиентов',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/pick',
        handler: notImplemented,
        config: {
            description: 'Подключиться к новому клиенту',
            notes: 'Может вернуть ошибку, если кто-то другой уже подключился',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/drop',
        handler: notImplemented,
        config: {
            description: 'Отключиться от комнаты',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/invite',
        handler: notImplemented,
        config: {
            description: 'Пригласить оператора в комнату',
            validate: {
                payload: {
                    operatorId: Joi.string()
                }
            },
            tags: ['api', 'operator']
        }
    },

    {
        method: 'GET',
        path: '/operator/lines/{id}/messages',
        handler: notImplemented,
        config: {
            description: 'Получить список сообщений',
            notes: 'Вощзвращает size сообщений после сообщения lastMessageId',
            tags: ['api', 'operator'],
            validate: {
                query: {
                    size: Joi.number(),
                    lastMessageId: Joi.string()
                }
            }
        }
    },

    {
        method: 'PUT',
        path: '/operator/lines/{id}/messages',
        handler: notImplemented,
        config: {
            description: 'Отправить сообщение',
            validate: {
                payload: {
                    text: Joi.string()
                }
            },
            tags: ['api', 'operator']
        }
    },


    {
        method: 'GET',
        path: '/operator/operators',
        handler: notImplemented,
        config: {
            description: 'Получить список операторов',
            notes: 'Чтобы, например, решить, кого приголасить в комнату',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/fill',
        handler: async function (request, reply) {
            try {
                let id = randomInt(0, 2000);
                let profile = await request.db.Profile.create({
                    name: `Оператор${id}`
                });

                let operator = await request.db.Operator.create({
                    login: 'login' + id,
                    password: sha1('pass' + id +  process.env.PASSWORD_SALT),
                    profile: profile._id
                });

                reply({
                    login: operator.login,
                    password: 'pass' + id,
                    token: operator.token
                });

            } catch (err) {
                pino.error(err);
                reply('Error').code(500);
            }
        }
    }
];


function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
