const { port } = require('./config');
const express = require('express');
const app = express();
const morgan = require('morgan');
require('./Database/mysql')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(morgan('dev'));


app.listen(port,() => { console.log('Server on port: ' + port) })





