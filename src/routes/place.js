//const Joi = require('joi');
//const notImplemented = require('../lib/routeNotImplemented');
const controllers = require('../controllers/operator');

module.exports = [
  {
    method: 'POST',
    path: '/api/v1/place',
    handler: async function (request, reply) {
      let operator = request.db.Place.create();

    },
    config: {
      auth: 'operator',
      description: 'Получить список комнат',
      notes: 'Возвращает список всех комнат',
      tags: ['api', 'operator']
    }
  }
]