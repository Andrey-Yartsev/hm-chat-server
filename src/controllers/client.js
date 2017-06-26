const pino = require('logstash-pino-replace')();
const sha1 = require('sha1');
const ObjectId = require('mongoose').Types.ObjectId;
const axios = require('axios');

const create = require('../lib/client/create');

const updateFcmToken = async (request, reply, fcmToken) => {
  try {
    console.log('updating ' + request.auth.credentials.login);
    await request.auth.credentials.update({
      fcmToken
    });
    reply('Ok ' + request.payload.token);
  } catch (err) {
    pino.error(err);
    reply('Error').code(500);
  }

};

const sendMessage = async (request, reply) => {
  try {
    let client = request.auth.credentials;
    let lineId = client.line;
    if (!lineId) {
      throw new Error('no line for client');
    }
    pino.info('Payload', request.payload);

    let message = await request.db.Message.create({
      line: lineId,
      text: request.payload.text,
      author: client.profile
    });
    let profile = await request.db.Profile.findById(client.profile);
    let newMessage = {
      text: message.text,
      _id: message._id,
      line: message.line,
      author: {
        name: profile.name,
        _id: profile._id,
        avatar: profile.avatar
      },
      dt: message.dt
    };
    let line = await request.db.Line.findOne({_id: new ObjectId(lineId)});
    // обновляем список просмотревших
    line.viewedBy = [client._id];
    if (line.unread === false) {
      line.unread = true;
      await line.save();
      request.ws.notifyOperators('all', 'linesChanged');
    }
    request.ws.notifyClient(line.client, 'newMessage', newMessage);
    request.ws.notifyOperators('all', 'newMessage', newMessage);
    reply({status: 'success', message: newMessage});
  } catch (err) {
    pino.error(err);
    reply('Error').code(500);
  }
};

const authorizeResult = (reply, client) => {
  reply({
    token: client.token,
    login: client.login,
    profileId: client.profile,
    userId: client._id
  });
};

module.exports = {
  messagesList: async (request, reply) => {
    try {
      let client = request.auth.credentials;
      let size = request.query.size ? request.query.size : 10;

      if (!client.line) {
        reply([]);
      }

      let filter = {
        line: client.line
      };

      if (request.query.lastMessageId) {
        filter._id = {
          $lt: new ObjectId(request.query.lastMessageId)
        };
      }

      let messages = await request.db.Message
        .find(filter)
        .limit(size)
        .populate('author')
        .sort({dt: -1});

      reply(messages);
    } catch (err) {
      pino.error(err);
      reply('error').code(500);
    }
  },

  testSendMessage: async (request, reply) => {
    const client = await request.db.Client.findOne({
      login: request.payload.login
    });
    if (!client) {
      reply('User not found');
      return;
    }
    request.auth.credentials = client;
    sendMessage(request, reply);
  },

  sendMessage: async (request, reply) => {
    sendMessage(request, reply);
  },

  authorize: async (request, reply) => {
    try {
      let client = await request.db.Client.findOne({
        login: request.payload.login,
        password: sha1(request.payload.password + process.env.PASSWORD_SALT)
      });
      if (!client) {
        reply('Client not found').code(404);
        return;
      }
      authorizeResult(reply, client);
    } catch (err) {
      pino.error(err);
      reply('Error').code(500);
    }
  },

  authorizeToken: async (request, reply) => {
    let r;
    try {
      r = await axios({
        method: 'post',
        url: 'http://95.79.46.185:56362/checkToken',
        data: {
          token: request.payload.token
        }
      });
    } catch (r) {
      console.log(r);
      reply(r.response.data);
      return;
    }
    let client = await request.db.Client.findOne({
      cloudToken: request.payload.token,
    });
    if (!client) {
      client = await create(request.db, {
        cloudToken: request.payload.token,
        login: r.data.login
      });
    }
    authorizeResult(reply, client);
  },

  updateFcmToken: async (request, reply) => {
    try {
      await request.auth.credentials.update({
        fcmToken: request.payload.token
      });
      reply('Ok');
    } catch (err) {
      pino.error(err);
      reply('Error').code(500);
    }
  },

  deleteFcmToken: async (request, reply) => {
    try {
      await request.auth.credentials.update({
        fcmToken: ''
      });
      reply('Ok');
    } catch (err) {
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