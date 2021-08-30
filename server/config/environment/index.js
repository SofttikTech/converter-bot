'use strict';

const _ = require('lodash');
const path = require('path');
const aws = require('aws-sdk');
const express = require('express');
const nodemailer = require('nodemailer');

const isProduction = false;
process['env']['NODE_ENV'] = process['env']['NODE_ENV'] || 'development';

aws.config.update({
  region: process['env']['AWS_REGIONS'],
  accessKeyId: process['env']['AWS_KEY'],
  secretAccessKey: process['env']['AWS_SECRET']
});

// AKIA2O54ICENXS4O3S6O
// BIqGvpl291yNUic13unKNAJdC9ZDo9n1YD0Z1Cmm+TNv

const all = {
  isProduction,
  env: process['env']['NODE_ENV'],

  // Frontend path to server
  assets: express.static(__dirname + '/../../public'),
  view: path.normalize(__dirname + '/../../public/index.html'),

  // Server port
  port: process.env.PORT || 4000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data ?
  seedDB: true,

  secrets: { session: 'Horizon_s3cr3t_2018' },
  // List of user roles
  userRoles: ['guest', 'user', 'affiliateAdmin', 'kycAdmin', 'admin'],

  // Email Configurations
  mailTransporter: nodemailer.createTransport({
    SES: new aws.SES({ apiVersion: '2010-12-01' })
  }),

  project_name: 'United World Exchange',
  support_title: 'United World Support',
  support_email: 'support@silvercyper.com',
  mail_footer: 'The United World Team',
  mail_noreply: 'no-reply@silvercyper.com',
  mail_from_name: 'United World Exchange',
  mail_from_email: 'no-reply@silvercyper.com',
  mail_logo: 'https://hotbit.com/assets/pic/logo.png',

  pepper: '78uA_PPqX&@$',
  encPass: 's1XrWeMEc2aJn1tu5HMp',
  rpc_secret: "4b8cf527e04e4a8abe40d9b2030129fckf546pwsasdfe",

  exchangeServer: isProduction ? 'http://139.59.19.210:3000' : 'http://192.168.0.128:3102',
};

/* Export the config object based on the NODE_ENV */
/*================================================*/

module.exports = _.merge(all, require(`./${process.env.NODE_ENV}.js`), require(`./constants`) || {});
