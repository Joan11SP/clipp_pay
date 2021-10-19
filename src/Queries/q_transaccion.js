const mysql = require('../Database/mysql');
const util = require('util');
const config = require('../config');
const 
{ 
    sql_buscar_cliente_clipp_pay_celular, 
    sql_insertar_cliente_clipp_pay, 
    sql_update_cliente_clipp_pay_cedula 
} = require('../Database/consultas')

const sql = util.promisify(mysql.query).bind(mysql);

const ejecutarSQL = async (query, variables) => {

    let res;
    try 
    {
        await sql(query,variables);
        res = config.success;
    } 
    catch (error) 
    {
        res = config.error_base;
    }
    return res;
}

const ejecutarSQLRespuesta = async (query, vairables) => {

    let res = { error: config.success, mensaje, respuesta};
    try 
    {        
        const res_sql = await sql(query,vairables);
        res.respuesta = res_sql;        
    } 
    catch (error) 
    {
        res.error = config.error_base;
        res.mensaje = config.msg_error
        console.log(error);
    }
    return res;
    // pool.query(QUERY, VALORES, function (err, ejecucion) {
    //     if (err) {
    //         console.log('error ' + err.code)
    //         administrador.imprimirErrLogs(err + ' SQL: ' + QUERY + ' VALORES: ' + VALORES);
    //         if (IS_DESARROLLO)
    //             return callback({ error: 1, m: err.sqlMessage });
    //         return callback({ error: 1, m: 'Error' });
    //     }
    //     callback(ejecucion);
    // });
}

const ejecutarConfirmacionSQL = async (QUERY, VALORES, callback, confirmacion) => {
    pool.query(QUERY, VALORES, function (err, ejecucion) {
        if (err) {
            console.log('error ' + err.code)
            administrador.imprimirErrLogs(err + ' SQL: ' + QUERY + ' VALORES: ' + VALORES);
            if (IS_DESARROLLO)
                return confirmacion({ error: 1, m: err.sqlMessage });
            return confirmacion({ error: 1, m: 'Error' });
        }
        callback(ejecucion);
    });
}

function ejecutarResSQL(QUERY, VALORES, callback, res) {
    pool.query(QUERY, VALORES, function (err, ejecucion) {
        if (err) {
            console.log('error ' + err.code)
            administrador.imprimirErrLogs(err + ' SQL: ' + QUERY + ' VALORES: ' + VALORES);
            //            if (IS_DESARROLLO)
            return res.status(400).send({ error: 1, m: err.sqlMessage });
            //            return res.status(400).send({error: 1, m: 'Error'});
        }
        callback(ejecucion);
    });
}

const registrarClienteCelular = async (cliente) => {
    
    let { icono, idClienteClipp, nombres, apellidos, cedula, correo, celular, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha } = cliente;
    let respuesta = {};

    try 
    {
        var buscar = await ejecutarSQLRespuesta(sql_buscar_cliente_clipp_pay_celular,[celular]);
        if(buscar.error == config.success)
        {
            if(buscar.respuesta.length <= 0)
            {
                let insert_cliente = await ejecutarSQLRespuesta(sql_insertar_cliente_clipp_pay,[nombres, apellidos, cedula, correo, celular]);
                console.log(insert_cliente);
                if(insert_cliente.error == config.success)
                {
                    if(insert_cliente.respuesta['insertId'] <= 0)
                    {
                        respuesta.error = config.error;
                        respuesta.mensaje = 'Lo sentimos, pero el usuario no se encuentra registrado.';
                    }
                    else
                    {
                        let id_cliente = insert_cliente.info['insertId'];
                    }
                }
            }
            else
            {
                let update = await ejecutarSQLRespuesta(sql_update_cliente_clipp_pay_cedula,[nombres, apellidos, correo, cedula, buscar.respuesta[0]['idCliente']]);

            }
        }
        else
            respuesta = buscar;
    } 
    catch (error) 
    {
        throw error;
    }
    return respuesta;


    cnf.ejecutarResSQL(sql_buscar_cliente_clipp_pay_celular, [celular], function (clientes) {
        if (clientes.length <= 0) {
            return cnf.ejecutarResSQL(SQL_INSERTAR_CLIENTE_CLIPP_PAY, [nombres, apellidos, cedula, correo, celular], function (clientes) {
                if (clientes['error'] || clientes['insertId'] <= 0) {
                    return res.status(200).send({ en: 0, m: 'Lo sentimos, pero el usuario no se encuentra registrado.' });
                }
                let idCliente = clientes['insertId'];
                console.log(' INSERTAR idCliente ' + idCliente);
                registrarCobroClipp(icono, idClienteClipp, celular, idCliente, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, res);
            }, res);
        } else {
            cnf.ejecutarResSQL(SQL_UPDATE_CLIENTE_CLIPP_PAY_CEDULA, [nombres, apellidos, correo, cedula, clientes[0]['idCliente']], function (clientes) {
            }, res);
            let idCliente = clientes[0]['idCliente'];
            console.log(' REGISTRADO ce idCliente ' + idCliente);
            return registrarCobroClipp(icono, idClienteClipp, celular, idCliente, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, res);
        }
    }, res);
}

const registrarCobroCliente = async (idAplicativo, idCliente, con, costo, email, phoneNumber, idProceso, res) => {

    try {
        const obt_codigo = await ejecutarSQLRespuesta(sql,idCliente);

        if(obt_codigo.respuesta.length > 0)
        {
            phoneNumber = codigoPais[0]['phone'];
            const obt_car = await ejecutarSQLRespuesta(sql,idCliente);
        }

    } catch (error) {
        throw error;
    }


    cnf.ejecutarResSQL(SQL_OBTENER_CODIGO_PAIS_CLIENTE, [idCliente], function (codigoPais) {
        if (codigoPais.length > 0)
            phoneNumber = codigoPais[0]['phone'];
        cnf.ejecutarResSQL(SQL_OBTENER_CAR_CLIENTE, [LLAVE_ECRIP, LLAVE_ECRIP, LLAVE_ECRIP, LLAVE_ECRIP, LLAVE_ECRIP, LLAVE_ECRIP, idCliente, con], function (cars) {
            if (cars.length <= 0)
                return res.status(200).send({ en: -1, m: 'El cliente no posee una tarjeta registrada favor solicitar al cliente registrar una o pagar en efectivo.' });
            return debitarCliente(idAplicativo, cars[0], idCliente, con, costo, email, phoneNumber, idProceso, res);
        }, res);
    }, res);

}



module.exports = {
    ejecutarSQL,
    ejecutarSQLRespuesta
}