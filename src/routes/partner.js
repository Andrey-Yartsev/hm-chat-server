const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');

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
];
