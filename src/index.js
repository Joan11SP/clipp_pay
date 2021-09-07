const { port } = require('./config');
const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require('./Routes/routes');

require('./Database/mysql')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(morgan('dev'));

app.use('/api', router);

app.listen(port,() => { console.log('Server on port: ' + port) })





