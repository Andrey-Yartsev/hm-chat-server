const Joi = require('joi');
const controllers = require('../controllers/master');
module.exports = [
  {
    method: 'POST',
    path: '/api/v1/master/authorize',
    handler: controllers.authorize,
    config: {
      description: 'Мастер-авторизация',
      notes: 'Авторизаует для доспука к управлению операторами',
      tags: ['api', 'master'],
      validate: {
        query: {
          login: Joi.string(),
          password: Joi.string()
        }
      }
    }
  }
];