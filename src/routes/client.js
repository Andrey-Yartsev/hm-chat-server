const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');
const controllers = require('../controllers/client')

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
        path: '/client/fill',
        handler: async function(request, reply) {
            let client = await request.db.Client.create({
                name: 'Testclient',
            })
            reply(client);
        },
    },    


];
