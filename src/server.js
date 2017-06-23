'use strict';

const Hapi = require('hapi');
const Cors = require('hapi-cors');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const db = require('./lib/db');
const pino = require('logstash-pino-replace')({stdout: true});
const pckg = require('../package.json');

require('colors');
const debugRoutes = function (routes) {
  for (let route of routes) {
    console.log(route.method.blue + ' ' + route.path.cyan);
  }
  return routes;
};

module.exports = async function () {

  // Create a server with a host and port
  const server = new Hapi.Server();
  server.connection({
    port: 8000,
    routes: {
      cors: true
    },
    labels: ['api']
  });

  server.connection({
    port: 3100,
    labels: ['ws']
  });


  let apiServer = server.select('api');
  let wsServer = server.select('ws');

  const swaggerOptions = {
    info: {
      'title': pckg.name,
      'version': pckg.version
    }
  };

  const goodOptions = {
    includes: {
      request: ['headers', 'payload'],
      response: [],
    },
    reporters: {
      myConsoleReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{log: '*', response: 'api'}]
      }, {
        module: 'good-console'
      }, 'stdout'],
      //
      logstash: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{log: '*', response: 'api'}]
      }, {
        module: 'good-logstash',
        args: [
          `tcp://${process.env.LOGSTASH_HOST}:${process.env.LOGSTASH_PORT}`,
          {typeLog: process.env.TYPE_LOG},
        ],
      }],
    }
  };

  //Add db support
  let models = await db(apiServer);

  apiServer.decorate('request', 'db', models);
  apiServer.decorate('server', 'db', models);

  //Add auth strategies
  require('./lib/auth')(apiServer);

  // Add the routes
  apiServer.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply('<h1>' + pckg.name + ' ' + pckg.version + '</h1>');
    }
  });
  apiServer.route(require('./routes/client'));
  apiServer.route(require('./routes/operator'));
  apiServer.route(require('./routes/master'));
  apiServer.route(require('./routes/test'));
  apiServer.route(debugRoutes(require('./crudRoutes/operator')));
  // apiServer.route(require('./crudRoutes/operator'));

  let ws = require('./lib/websockets')(wsServer, models);
  apiServer.decorate('request', 'ws', ws);

  apiServer.register([
      {
        register: Cors,
        options: {
          origins: ['*'],
          methods: ['POST, GET, OPTIONS', 'PUT'],
          headers: ['Content-Type', 'x-request', 'x-requested-with', 'authorization']
        }
      },
      Inert,
      Vision,
      {
        register: HapiSwagger,
        options: swaggerOptions
      }, {
        register: require('good'),
        options: goodOptions
      }
    ], (err) => {
      if (err) {
        pino.error('Error', err);
      }
      server.start((serverErr) => {
        if (serverErr) {
          pino.error(serverErr);
        } else {
          console.log('Server running at: ' + apiServer.info.uri);
        }
      });
    }
  );
};
