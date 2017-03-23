const pino = require('pino')();
const sha1 = require('sha1');

module.exports = {
    authorize: async (request, reply) => {
        let login = request.payload.login;
        let password = request.payload.password;
        let operator = await request.db.Operator.findOne({
            login: login,
            password: sha1(password + process.env.PASSWORD_SALT)
        });

        if (!operator) {
            reply('Not found').code(404);
            return;
        }

        reply({token: operator.token});
    }
};
