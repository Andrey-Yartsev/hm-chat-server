const pino = require('pino')();

module.exports = {
    messagesList: async (request, reply) => {
        let client = request.auth.credentials;

        if (!client.line) {
            reply([]);
        }

        let messages = await request.db.Message.find({
            line: client.line
        });

        reply(messages);
    },

    sendMessage: async (request, reply) => {
        try {
            let client = request.auth.credentials;
            let lineId = client.line;
            if (!lineId) {
                let line = await createLine(request.db, client);
                lineId = line._id;
            }

            pino.info('Payload', request.payload);

            let message = await request.db.Message.create({
                line: lineId,
                text: request.payload.text
            });
            reply({status: 'success', message: message});
        } catch (err){
            pino.error(err);
            reply('Error').code(500);

        }


    }
};


async function createLine(db, client) {
    let line = await db.Line.create({
        client: client._id,
        description: client.name
    });

    client.line = line._id;
    await client.save();
    return line;
}