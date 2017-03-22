const Joi = require('joi');
const notImplemented = require('../lib/routeNotImplemented');

module.exports = [
    {
        method: 'GET',
        path: '/operator/lines',
        handler: notImplemented,
        config: {
            tags: ['api', 'operator']
        }
    },

    {
        method: 'GET',
        path: '/operator/lines/new',
        handler: notImplemented,
        config: {
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/pick',
        handler: notImplemented,
        config: {
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/drop',
        handler: notImplemented,
        config: {
            tags: ['api', 'operator']
        }
    },

    {
        method: 'POST',
        path: '/operator/lines/{id}/invite',
        handler: notImplemented,
        config: {
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
            tags: ['api', 'operator']
        }
    },

    {
        method: 'PUT',
        path: '/operator/lines/{id}/messages',
        handler: notImplemented,
        config: {
            validate: {
                payload: {
                    text: Joi.string()
                }
            },
            tags: ['api', 'operator']
        }
    }
];
