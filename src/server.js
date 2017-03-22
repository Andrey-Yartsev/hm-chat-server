'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const clientRoutes = require('./routes/client');
const partnerRoutes = require('./routes/partner');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});


const swaggerOptions = {
    info: {
            'title': 'HelpMe чат сервер',
            'version': '0.0.1'
        }
    };


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
            console.log('Error', err);
        }

        server.start((serverErr) => {
           if (serverErr) {
                console.log(serverErr);
            } else {
                console.log('Server running at:', server.info.uri);
            }
        });
    }
);


