module.exports = async (db, data) => {
  if (!data.login) throw new Error('login required');
  let profile = await db.Profile.create({
    name: data.login
  });
  let line = await db.Line.create({
    description: profile.name
  });
  const clientData = {
    login: data.login,
    profile: profile._id,
    line: line._id
  };
  if (data.cloudToken) {
    clientData.cloudToken = data.cloudToken;
  }
  if (data.password) {
    clientData.password = sha1(data.password + process.env.PASSWORD_SALT);
  }
  let client = await db.Client.create(clientData);
  line.client = client._id;
  await line.save();
  return client;
};