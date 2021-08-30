'use strict';
// Development specific configuration
// ==================================
module.exports = {
  serverDomain: "http://localhost:4000/api",
  clientDomain: 'https://dtex.crowdpoint.tech',
  contractsApi: '',

  mongo: {
    db_url: process['env']['dev_db_url'],
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false,
  },
  seedDB: true
};
