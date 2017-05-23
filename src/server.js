'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const clientRoutes = require('./routes/client');
const partnerRoutes = require('./routes/operator');
const testRoutes = require('./routes/test');
const db = require('./lib/db');
const pino = require('logstash-pino-replace')({stdout: true});
const pckg = require('../package.json');

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
        port: 3000,
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
    apiServer.route(clientRoutes);
    apiServer.route(partnerRoutes);
    apiServer.route(testRoutes);

    let ws = require('./lib/websockets')(wsServer, models);
    apiServer.decorate('request', 'ws', ws);



    apiServer.register([
            Inert,
            Vision,
            {
                register: HapiSwagger,
                options: swaggerOptions
            }, {
                register: require('good'),
                options: goodOptions
            }],
        (err) => {
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
