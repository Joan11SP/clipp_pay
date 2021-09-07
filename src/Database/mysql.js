const mysql = require('mysql');

const { db_host,db_name,db_password,db_port,db_user } = require('../config');

const conection = mysql.createConnection({
    host:       db_host,
    user:       db_user,
    password:   db_password,
    database:   db_name,
    port:       db_port,
     
});

conection.connect(err =>{
    if (err){
        console.log(err)
        //throw err;
    }
    else
        console.log('Connected to mysql!!!')
});

module.exports=conection;