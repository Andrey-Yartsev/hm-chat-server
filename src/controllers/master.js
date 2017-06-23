module.exports = {

  authorize: async (request, reply) => {
    const validError = 'Неверный логин или пароль';
    if (request.payload.login !== process.env.MASTER_LOGIN) {
      reply({validError});
      return;
    }
    if (request.payload.password !== process.env.MASTER_PASSWORD) {
      reply({validError});
      return;
    }
    await request.db.Master.create({
      login: request.payload.login
    }, (err, master) => {
      reply(master);
    });
  }

};