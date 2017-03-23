'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const clientRoutes = require('./routes/client');
const partnerRoutes = require('./routes/operator');
const db = require('./lib/db');
const pino = require('pino')();

module.exports = async function () {
    // Create a server with a host and port
    const server = new Hapi.Server();
    server.connection({
        port: 8000
    });


    const swaggerOptions = {
        info: {
            'title': 'HelpMe чат сервер',
            'version': '0.0.1'
        }
    };


    //Add db support
    let models = await db(server);

    server.decorate('request', 'db', models);
    server.decorate('server', 'db', models);


    //Add auth strategies
    require('./lib/auth')(server);


    // Add the routes
    server.route(clientRoutes);
    server.route(partnerRoutes);

    server.register([
        Inert,
        Vision,
        {
            'register': HapiSwagger,
            'options': swaggerOptions
        }],
        (err) => {
            if (err) {
                pino.error('Error', err);
            }

            server.start((serverErr) => {
               if (serverErr) {
                    pino.error(serverErr);
                } else {
                    pino.info('Server running at:', server.info.uri);
                }
            });
        }
    );
}
