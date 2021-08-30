'use strict';
// Development specific configuration
// ==================================
module.exports = {
  serverDomain: "http://localhost:4000/api",
  clientDomain: 'https://tex.crowdpoint.tech',
  contractsApi: '',

  mongo: {
    db_url: process['env']['prod_db_url'],
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false,
  },
  seedDB: true
};
