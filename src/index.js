const { port } = require('./config');
const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require('./Routes/routes');
const cors = require('cors')
const middle = require('./Utils/middleware');
require('./Database/mysql')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(morgan('dev'));
app.use(cors())

app.use('/api', router);
app.use(middle.enviarDatos)

app.listen(port,() => { console.log('Server on port: ' + port) })





