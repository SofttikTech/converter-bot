/**
   * Main application routes
*/

'use strict';

module.exports = (app) => {
  // app.use('/auth', require('./auth'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/blockchain', require('./api/blockchain'));

};
