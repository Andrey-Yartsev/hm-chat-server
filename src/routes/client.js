const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');
const controllers = require('../controllers/client')

module.exports = [
    {
        method: 'GET',
        path: '/client/messages',
        handler: controllers.getMessages,
        config: {
            description: 'Получить список сообщений',
            notes: 'Вощзвращает size сообщений после сообщения lastMessageId',
            tags: ['api', 'client'],
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
        path: '/client/messages',
        handler: controllers.sendMessage,
        config: {
            validate: {
                payload: {
                    text: Joi.string()
                }
            },
            tags: ['api', 'client']
        }
    }
];
