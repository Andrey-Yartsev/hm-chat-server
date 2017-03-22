module.exports = {
    messagesList: async (request, reply) => {
        reply([]);
    },

    sendMessage: (request, reply) => {
        reply({status: 'success'});
    }
};
