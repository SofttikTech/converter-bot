process['env']['NODE_ENV'] = process['env']['NODE_ENV'] || 'development';
require('dotenv').config({ path: `./.env.${process['env']['NODE_ENV']}` });

const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const database = require('./utils/connection');
const port_no = process.env.PORT || 4000;
let app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
database.getConnection();
app.use(express.static(__dirname + '/frontend/public'));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
require('./config/seed');
require('./routes')(app);

app.get('*', (req, res) => res.sendFile(path.normalize(__dirname + '/public/index.html')));


app.listen(port_no, () => console.log(`TEX Token Server is running on ${port_no}`));