const filterEmpty = function (obj, keys) {
  var result = {}, key;
  for (key in obj) {
    if (keys.indexOf(key) !== -1) {
      if (obj[key]) {
        result[key] = obj[key];
      }
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

let opt = {};

opt.createFilter = opt.updateFilter = function (obj) {
  console.log(obj);
  return filterEmpty(obj, ['password']);
};

// add auth

const routes = require('hapi-ngn-grid-mongoose-crud')('operator', {
  dt: 'Дата создания',
  login: 'Логин',
}, opt);

for (let route of routes) {
  if (!route.config) route.config = {};
  route.config.auth = 'master';
}

module.exports = routes;
