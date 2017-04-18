const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');
const sha1 = require('sha1');
const controllers = require('../controllers/operator');

const pino = require('pino')();

module.exports = [
    {
        method: 'GET',
        path: '/operator/lines',
        handler: controllers.getLines,
        config: {
            auth: 'operator',
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
        path: '/operator/lines/{id}',
        handler: controllers.getLineDetails,
        config: {
            auth: 'operator',
            description: 'Получить детали комнаты',
            notes: 'Возвращает детали клиента и подключенных операторов',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'GET',
        path: '/operator/lines/new',
        handler: controllers.getNewLines,
        config: {
            auth: 'operator',
            description: 'Получить список не взятых входящих',
            notes: 'Возвращает список не взятых входящих клиентов',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/pick',
        handler: controllers.pickLine,
        config: {
            auth: 'operator',
            description: 'Подключиться к новому клиенту',
            notes: 'Может вернуть ошибку, если кто-то другой уже подключился',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/drop',
        handler: controllers.dropLine,
        config: {
            auth: 'operator',
            description: 'Отключиться от комнаты',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/invite',
        handler: controllers.invite,
        config: {
            auth: 'operator',
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
        handler: controllers.getMessages,
        config: {
            auth: 'operator',
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
        handler: controllers.sendMessage,
        config: {
            auth: 'operator',
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
        path: '/operator/invite',
        handler: controllers.getInvites,
        config: {
            auth: 'operator',
            description: 'Получить список моих приглашений',
            tags: ['api', 'operator']
        }
    },


    {
        method: 'DELETE',
        path: '/operator/invite/{lineId}',
        handler: controllers.declineInvite,
        config: {
            auth: 'operator',
            description: 'Отказаться от приглашения',
            tags: ['api', 'operator']
        }
    },



    {
        method: 'GET',
        path: '/operator/operators',
        handler: controllers.getOperators,
        config: {
            auth: 'operator',
            description: 'Получить список операторов',
            notes: 'Чтобы, например, решить, кого приголасить в комнату',
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/fill',
        config: {
            description: 'Создать тестового оператора',
            tags: ['api', 'operator']
        },
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
