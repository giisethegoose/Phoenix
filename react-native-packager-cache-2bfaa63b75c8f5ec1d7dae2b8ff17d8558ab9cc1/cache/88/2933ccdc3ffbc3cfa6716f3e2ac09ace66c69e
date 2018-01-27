

var firebase = require('./app');
require('./auth');
require('./database');
require('./storage');

var AsyncStorage = require('react-native').AsyncStorage;

firebase.INTERNAL.extendNamespace({
  INTERNAL: {
    reactNative: {
      AsyncStorage: AsyncStorage
    }
  }
});

module.exports = firebase;