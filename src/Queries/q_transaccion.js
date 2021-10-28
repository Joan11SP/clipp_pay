const mysql = require('../Database/mysql');
const util = require('util');
const config = require('../config');
const
    {
        sql_buscar_cliente_clipp_pay_celular,
        sql_insertar_cliente_clipp_pay,
        sql_update_cliente_clipp_pay_cedula,
        sql_obtener_codigo_pais_cliente,
        sql_obtener_car_cliente
    } = require('../Database/consultas');

const var_payphone = require('../Database/payphone');
const CryptoJS = require('crypto-js');

const sql = util.promisify(mysql.query).bind(mysql);

const ejecutarSQL = async (query, variables) => {

    let res;
    try {
        await sql(query, variables);
        res = config.success;
    }
    catch (error) {
        res = config.error_base;
    }
    return res;
}

const ejecutarSQLRespuesta = async (query, vairables) => {

    let res = { error: config.success, mensaje:'', respuesta:null };
    try {
        const res_sql = await sql(query, vairables);
        res.respuesta = res_sql;
    }
    catch (error) {
        res.error = config.error_base;
        res.mensaje = config.msg_error
        console.log(error);
    }
    return res;
}
const registrarClienteCelular = async (cliente) => {

    let { icono, cliente_clipp, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha } = cliente;
    
    let  idClienteClipp = cliente_clipp[0]['idCliente']
    let  nombres = cliente_clipp[0]['nombres']
    let  apellidos =  cliente_clipp[0]['apellidos']
    let  cedula = cliente_clipp[0]['cedula']
    let  correo =   cliente_clipp[0]['correo']
    let  celular =  cliente_clipp[0]['celular'];
    let respuesta = {};

    try {
        var buscar = await ejecutarSQLRespuesta(sql_buscar_cliente_clipp_pay_celular, [celular]);
        if (buscar.error == config.success) 
        {
            if (buscar.respuesta.length <= 0) 
            {
                let insert_cliente = await ejecutarSQLRespuesta(sql_insertar_cliente_clipp_pay, [nombres, apellidos, cedula, correo, celular]);
                if (insert_cliente.error == config.success) 
                {
                    if (insert_cliente.respuesta['insertId'] <= 0) 
                    {
                        respuesta.error = config.error;
                        respuesta.mensaje = 'Lo sentimos, pero el usuario no se encuentra registrado.';
                    }
                    else 
                    {
                        let id_cliente = insert_cliente.info['insertId'];
                        respuesta = await registrarCobroClipp(icono, idClienteClipp, celular, id_cliente, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha);
                    }                    
                }
            }
            else 
            {
                let update = await ejecutarSQLRespuesta(sql_update_cliente_clipp_pay_cedula, [nombres, apellidos, correo, cedula, buscar.respuesta[0]['idCliente']]);
                if(update.respuesta > 0)
                {
                    let id_cliente = update.respuesta[0]['idCliente'];
                    respuesta = await registrarCobroClipp(icono, idClienteClipp, celular, id_cliente, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha);
                }
                else
                    respuesta = update;
            }
        }
        else
            respuesta = buscar;
    }
    catch (error) {
        throw error;
    }
    return respuesta;


}

const registrarCobroCliente = async (idAplicativo, idCliente, con, costo, email, phoneNumber, idProceso) => {

    let respuesta = {};
    try {
        const obt_codigo = await ejecutarSQLRespuesta(sql_obtener_codigo_pais_cliente, idCliente);

        if (obt_codigo.respuesta.length > 0) {
            phoneNumber = obt_codigo.respuesta[0]['phone'];
            const obt_car = await ejecutarSQLRespuesta(sql_obtener_car_cliente, idCliente);
            if (obt_car.respuesta.length <= 0)
                respuesta = { error: -1, mensaje: 'El cliente no posee una tarjeta registrada favor solicitar al cliente registrar una o pagar en efectivo.' }
            else {
                const debitar = await debitarCliente(idAplicativo, car, idCliente, con, costo, cliente, idProceso, codigoPais);
                respuesta = debitar;
            }
        }
        else
            respuesta = obt_codigo;

    } catch (error) {
        throw error;
    }
    return respuesta;
}

const registrarCobroClipp = async (icono, idClienteClipp, criterio, idCliente, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha_servicio) => {
    let respuesta;
    var transaccion = await registrarTransaccion(icono, idClienteClipp, monto, ID_TRANSACCION_TIPO_EGRESO, ID_SALDO_RAZON_CLIPP, 1, observacion, JSON.stringify({idClienteClipp: idClienteClipp, idTransaccionPeticion: idTransaccionPeticion, criterio: criterio}), idTransaccionPeticion, fecha_servicio, ID_TR_ENTIDAD_CLIPP);

    if (transaccion <= 0)
        respuesta = {error: -1, mensaje: 'Lo sentimos, pero la recarga no se puede realizar'};
    else
    {
        const registrar = await registrarTransaccionPay('1', '1', '1', '1', '1', '1', monto, idAdministradorRegistro);
        repuesta = {error: 1, mensaje: 'Transacción realizada correctamente.', idTransaccion: transaccion}
    }
    return respuesta;
}
const registrarTransaccionPay = async (idServicioAplicativo, idEntidad, idCliente, idEstado, idTipoPago, idCuenta, saldo, idAdministradorRegistro, callback) => {

    var regis = await ejecutarSQLRespuesta(SQL_REGISTART_TRANSACCION_PAY, [idServicioAplicativo, idEntidad, idCliente, idEstado, idTipoPago, idCuenta, saldo, idAdministradorRegistro]);
    if (regis.respuesta['error'] || regis.respuesta['insertId'] <= 0)
        return regis = -1;
    return regis.respuesta['insertId'];
    
}
const registrarTransaccion = async (icono, idCliente, saldo, idTransaccionTipo, idSaldoRazon, idAdministradorRegistro, observacion, opcional, idTransaccionPeticion, fecha_servicio, idTransaccionEntidad) => {
    
    var regis = await ejecutarSQLRespuesta(SQL_REGISTART_TRANSACCION, [icono, idCliente, ID_TRANSACCION_ESTADO_TRANSACCION, idTransaccionTipo, idSaldoRazon, saldo, idAdministradorRegistro, observacion, opcional, idTransaccionPeticion, idTransaccionEntidad, fecha_servicio]);
    if (regis.respuesta['error'] || regis.respuesta['insertId'] <= 0)
        return regis = -1;
    return regis.respuesta['insertId'];
}

const debitarCliente = async (idAplicativo, car, idCliente, con, costo, cliente, idProceso, codigoPais) => {
    var phoneNumber = codigoPais + cliente['celular'];
    let respuesta = {};
    if (!car.verificationCode || !car.div || !car.mul || !car.sum || !car.op) {
        respuesta = { error: 4, m: 'Error grave, la clave proporcionada está incompleta, por favor comunicarce con kradac inmediatamente' };
        return respuesta;
    }

    let cvv4 = parseInt(base64decode(car.verificationCode.toString('ascii')) / parseInt(car.div.toString('ascii')));
    let cvv3 = cvv4 / parseInt(car.mul.toString('ascii'));
    let cvv2 = cvv3 - parseInt(car.sum.toString('ascii'));
    let cvv1 = cvv2.toString().replace(car.op.toString('ascii'), '');

    let cvv = base64encode(cvv1);

    let amount = parseInt((costo * 100));
    //let amountWithTax = Math.round(((amount * 100) / (100 + (iva * 100))));
    let amountWithoutTax = amount;
    //    let impuestos = parseInt((amount - amountWithTax));
    //
    var url = 'https://pay.payphonetodoesposible.com/api/transaction/Pay';

    let body = {
        cardToken: car.cardToken.toString('ascii'),
        verificationCode: cvv,
        //cardHolder: cardHolder,
        amount: amount,
        amountWithTax: 0,
        amountWithoutTax: amountWithoutTax,
        tax: 0,
        service: 0,
        tip: 0,
        email: cliente['correo'],
        phoneNumber: phoneNumber,
        optionalParameter: 'CLIPP Donación: ' + idProceso,
    };

    const token_aplicativo = await ejecutarSQLRespuesta(var_payphone.SQL_TOKEN_APLICATIVO + AMBIENTE, [idAplicativo]);
    if (token_aplicativo.respuesta.length <= 0)
        respuesta = { en: -1, m: 'La aplicación no está autorizada para transaccionar con tarjetas de crédito.' }
    else 
    {
        let Authorization = token_aplicativo[0]['Authorization'];
        let IDENTIFICATION = IP_SERVIDOR_NODE + '.' + token_aplicativo.respuesta[0]['identificativo'];
        const regis_transaccion = await ejecutarSQLRespuesta(var_payphone.SQL_REGISTAR_TRANSACCION, [idCliente, IDENTIFICATION, con, car.number, body.amount, body.amountWithTax, body.amountWithoutTax, body.tax, body.service, body.tip, body.optionalParameter, cliente['correo'], phoneNumber, var_payphone.ES_TRANSACCION_TIPO_DONACION, JSON.stringify({ idProceso: idProceso })]);
        if (regis_transaccion.respuesta['insertId'] <= 0)
            respuesta = { en: -2, m: '¡No se pudo realizar la compra.' };
        else 
        {
            var key = CryptoJS.enc.Utf8.parse(token_aplicativo.respuesta[0]['passwordCodificacion']);
            var iv = CryptoJS.enc.Utf8.parse('');
            var cardholder = CryptoJS.AES.encrypt(cliente['nombre'], key, { iv: iv });
            var holder = cardholder + '';

            var encrbase = car['cardHolder'];
            if (encrbase != null) 
            {
                var duenio = base64decode(encrbase + '');
                cardholder = CryptoJS.AES.encrypt(duenio, key, { iv: iv });
                holder = cardholder + '';
            }

            if (car.cardToken.toString('ascii').length > 36) 
            {
                url = 'https://pay.payphonetodoesposible.com/api/v2/transaction/Pay';
                body.documentId = cliente['cedula'];
                body.storeId = token_aplicativo.respuesta[0]['idTienda'];
                body.cardHolder = holder;
            }

            body.clientTransactionId = IDENTIFICATION + '/' + regis_transaccion.respuesta['insertId'];
            respuesta = await realizarPagoVerificacionCliente(Authorization, costo, body, transaccion['insertId'], idCliente, url, car.number, res);
        }
    }
    return respuesta;
}

const realizarPagoVerificacionCliente = async (Authorization, costo, body, idT, idCliente, url, numberTarjeta) => {
    var options = {
        method: 'POST',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            Authorization: Authorization
        },
        body: body,
        json: true
    };
    let respuesta={};
    request(options, async (err, httpResponse, respuesta) =>
    {
        if (err) 
        {
            await ejecutarSQL(var_payphone.SQL_ACTULIZAR_RESPUESTA_TRANSACCION, [0, JSON.stringify(err), var_payphone.ES_ERROR, idT]);
            return respuesta = { en: -3, m: 'Ups lo sentimos, por favor intenta de nuevo más tarde.' };
        }
        if (httpResponse.statusCode === 201) 
        {
            if (respuesta.statusCode == 3) 
            {
                let transactionId = respuesta.transactionId;
                await ejecutarSQL(var_payphone.SQL_ACTUALIZAR_ID_TRANSACCION, [transactionId, idT]);
                await ejecutarSQL(var_payphone.SQL_ACTULIZAR_RESPUESTA_TRANSACCION, [httpResponse.statusCode, JSON.stringify(respuesta), var_payphone.ES_APROBADA, idT]);
                if (IS_DESARROLLO) 
                {
                    var resultado = await solicitarReverso({id: respuesta.transactionId}, idT);
                    if (resultado) 
                    {
                        var data = [
                            {clave: "Sistema", valor: "CLIPP"},
                            {clave: "idPayphone", valor: respuesta.transactionId},
                            {clave: "Telefono", valor: body.phoneNumber},
                            {clave: "Monto", valor: body.amount},
                            {clave: "Mensaje", valor: "El reverso se ha ejecutado correctamente"}

                        ]
                        mensajes_wp.armarTextoWp('Reverso', data, [body.phoneNumber, '593997396843'], '');
                    }
                    if (url == 'https://pay.payphonetodoesposible.com/api/transaction/Pay') 
                        await ejecutarSQL(var_payphone.SQL_ACTUALIZAR_CARDTOKEN, [httpResponse.cardTokenV2, LLAVE_ECRIP, numberTarjeta, idCliente]);
                    
                }
                await consultarDetalleTransaccion(idCliente, numberTarjeta, respuesta.transactionId, idT);
                respuesta = { en: 1, m: 'Su Transaccion por el valor de $' + costo + ' ha sido realizada correctamente.', transactionId: respuesta.transactionId, number: numberTarjeta };
            } 
            else 
            {
                await ejecutarSQL(var_payphone.SQL_ACTULIZAR_RESPUESTA_TRANSACCION, [httpResponse.statusCode, JSON.stringify(respuesta), var_payphone.ES_NO_APROBADA, idT]);
                try 
                {
                    let mensaje = respuesta.message;
                    respuesta = {en: -4, m: mensaje};
                } 
                catch (e) 
                {
                    respuesta = {en: -4, m: 'Ups lo sentimos, por favor intenta de nuevo más tarde.'};
                }
            }
        } 
        else 
        {
            await ejecutarSQL(var_payphone.SQL_ACTULIZAR_RESPUESTA_TRANSACCION, [httpResponse.statusCode, JSON.stringify(respuesta), var_payphone.ES_NO_REALIZADA, idT]);
            try 
            {
                let mensaje = respuesta.message;
                respuesta = {en: -5, m: mensaje};
            } 
            catch (e) 
            {
                respuesta = {en: -5, m: 'Ups lo sentimos, por favor intenta de nuevo más tarde.'};
            }
        }
    });
    return respuesta;
}

const solicitarReverso = async (body, idT) => {

    var idAplicativo = 1;
    const tokens = await ejecutarSQLRespuesta(var_payphone.SQL_TOKEN_APLICATIVO + AMBIENTE, [idAplicativo]);
    let respuesta;
    if (tokens.respuesta.length <= 0)
        return administrador.imprimirErrLogs('Por favor registre el token ');
    else
    {
        let Authorization = tokens[0]['Authorization'];
        await ejecutarSQL(var_payphone.SQL_SOLICITUD_REVERSO, [idT]);
        var options = {
            method: 'POST',
            url: 'https://pay.payphonetodoesposible.com/api/Reverse',
            headers: {
                'Content-Type': 'application/json',
                Authorization: Authorization
            },
            body: body,
            json: true
        };
        request(options, function (err, httpResponse, respuesta) {
            if (err)
                return administrador.imprimirErrLogs('Se solicito reversar pero ocurrio un error: ' + err + ' idT: ' + idT);
            if (httpResponse.statusCode === 200 && respuesta == true)
                return cnf.ejecutarSQL(var_payphone.SQL_SOLICITUD_REVERSO_REVERSADA, [idT]);
            return administrador.imprimirErrLogs('Se solicito reversar pero ocurrio un error: ' + respuesta + ' idT: ' + idT);
        });
    }
    
}

const consultarDetalleTransaccion = async (tks, number, id_transaccion, idT) => {
    var idAplicativo = 1;
    const tokens = await ejecutarSQLRespuesta(var_payphone.SQL_TOKEN_APLICATIVO + AMBIENTE, [idAplicativo]);
    if (tokens.respuesta.length <= 0)
            return administrador.imprimirErrLogs('Por favor registre el token ');
        let Authorization = tokens[0]['Authorization'];
        var options = {
            method: 'GET',
            url: 'https://pay.payphonetodoesposible.com/api/Sale/' + id_transaccion,
            headers: {
                Authorization: Authorization
            }
        };
        request(options, async (err, httpResponse, respuesta) => {
            if (err)
                return administrador.imprimirErrLogs('Ocurrio un error en informacion adicional: ' + JSON.stringify(err) + ' idT: ' + idT + ' transaccion ' + id_transaccion);
            if (httpResponse['statusCode'] === 200) {
                var respuestajs = JSON.parse(respuesta);
                var credito = respuestajs['cardType'] === 'Debit' ? 2 : 1;
                await ejecutarSQL(var_payphone.SQL_INFORMACION_ADICIONAL_TARJETA, [credito, base64encode(respuestajs['bin']), base64encode(respuestajs['lastDigits']), respuestajs['cardBrandCode'], respuestajs['cardBrand'], respuestajs['document'], respuestajs['currency'], respuestajs['regionIso'], respuestajs['transactionType'], tks, number]);
                return await ejecutarSQL(var_payphone.SQL_INFORMACION_ADICIONAL_TRANSACCION, [credito, idT]);
            }
            return await consultarDetalleTransaccion_v2(tks, number, id_transaccion, idT);
            //administrador.imprimirErrLogs('Ocurrio un problema en informacion adicional: ' + JSON.stringify(respuesta) + ' idT: ' + idT + ' transaccion ' + id_transaccion);
        });
}

const consultarDetalleTransaccion_v2 = async (tks, number, id_transaccion, idT) => {
    var idAplicativo = 1;
    const tokens = await ejecutarSQLRespuesta(var_payphone.SQL_TOKEN_APLICATIVO + AMBIENTE, [idAplicativo]);

    if (tokens.respuesta.length <= 0)
        return administrador.imprimirErrLogs('Por favor registre el token ');
    let Authorization = "Bearer 2NDY7vYB693qh-feSHA7rUOXazLcYeZ4Lha4IugyXj5dKsA8JHkibIf3E_ciToKa7P7ZBEucmAPOQCw2w4CgViRlf2im7udQHrSaBOQBr2M1pV-kfu8xufEieHx6qdJsKzMtft4BveWmsQcZ3DQIyz8m7v6F58TOJyUEMOz5pTZn3VZLuVj2p8TbGRuLsGiziBXi4-1BtYmqXIeQBSHynqqjnG8lFoSXfgDv8VDoEDNyDx17r_MCjEByWC_WcIOZ12ANJUBuowmZVPzgo8NOdi5Eizp7zW5Dla8vE1Lpw7WzmzyapB7P_qGBuHk2xghH5ta9KQ";
    var options = {
        method: 'GET',
        url: 'https://pay.payphonetodoesposible.com/api/Sale/' + id_transaccion,
        headers: {
            Authorization: Authorization
        }
    };
    request(options, async (err, httpResponse, respuesta) => {
        if (err)
            return administrador.imprimirErrLogs('Ocurrio un error en informacion adicional: ' + JSON.stringify(err) + ' idT: ' + idT + ' transaccion ' + id_transaccion);
        if (httpResponse['statusCode'] === 200) {
            var respuestajs = JSON.parse(respuesta);
            var credito = respuestajs['cardType'] === 'Debit' ? 2 : 1;
            await ejecutarSQL(var_payphone.SQL_INFORMACION_ADICIONAL_TARJETA, [credito, base64encode(respuestajs['bin']), base64encode(respuestajs['lastDigits']), respuestajs['cardBrandCode'], respuestajs['cardBrand'], respuestajs['document'], respuestajs['currency'], respuestajs['regionIso'], respuestajs['transactionType'], tks, number]);
            await ejecutarSQL(var_payphone.SQL_INFORMACION_ADICIONAL_TRANSACCION, [credito, idT]);
            return await ejecutarSQL(var_payphone.SQL_TRANSACCION_TOKEN, [credito, idT]);
        }
        return administrador.imprimirErrLogs('Ocurrio un problema en informacion adicional: ' + JSON.stringify(respuesta) + ' idT: ' + idT + ' transaccion ' + id_transaccion);
    });
}

module.exports = {
    ejecutarSQL,
    ejecutarSQLRespuesta,
    registrarClienteCelular,
    registrarCobroCliente
}