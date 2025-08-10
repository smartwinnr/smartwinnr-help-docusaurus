const path = require('path');

module.exports = function (context, options) {
  return {
    name: 'chatbot-plugin',
    getClientModules() {
      return [path.resolve(__dirname, './chatbot-client.js')];
    },
    configureWebpack(config, isServer, utils) {
      return {
        resolve: {
          alias: {
            '@chatbot': path.resolve(__dirname, '../src/components/ChatBot')
          }
        }
      };
    }
  };
};