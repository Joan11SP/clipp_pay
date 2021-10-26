const config = require("../config");
const { ejecutarSQL, ejecutarSQLRespuesta, registrarClienteCelular} = require('../Queries/q_transaccion');
const { sql_consultar_saldo_cedula } = require('../Database/consultas');
const authorization = require('../Utils/auth');



module.exports.registrarPago = async (req, res, next) => {

    var { idAplicativo, idServicioAplicativo, idCompania, idAplicativoClipp, isHibrido, icono } = req.headers;
    var { saldo, observacion, idTransaccionPeticion, criterio, tipo, fecha, codigoPais } = req.body;
    var idAdministradorRegistro = 1;

    var rspta = { error: 1, status: 400 };
    req.body = rspta;

    if (!saldo) { rspta.param = 'saldo'; next() }
    var monto = saldo.toString().replace(',', '.');
    if (isNaN(monto)) { rspta.param = 'saldo'; next() }
    var montos = monto.split('.');
    if (montos.length > 2) { rspta.param = 'saldo'; next() }
    if (montos.length === 2 && montos[1].length > 2) { rspta.param = 'recarga, solo se permiten dos decimales'; next(); }

    if (!criterio) { rspta.param = 'criterio'; next() }
    if (!tipo) { rspta.param = 'tipo'; next() }
    if (!fecha) { rspta.param = 'fecha'; next() }

    if (!observacion)
        observacion = '';
    if (!idTransaccionPeticion)
        idTransaccionPeticion = null;
    delete rspta.error;

    switch (parseInt(tipo)){
        case CONSULTAR_CEDULA:

            let res = await ejecutarSQLRespuesta(sql_consultar_saldo_cedula,[idAplicativoClipp, criterio]);
            if(res.error == config.success)
            {
                if (res.info.length <= 0) 
                {
                    rspta = { en: -1, m: '1 Cliente no registrado.' };
                    return;
                }
                var saldoActual = clientesClipp[0]['saldo'];
                var cliente = { icono, cliente_clipp: clientesClipp, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha };
                if(saldoActual >= monto)
                {
                    const registrar = await registrarClienteCelular(cliente);
                    rspta['s'] = monto;
                    rspta['sf'] = 0;
                    rspta.error = config.success;
                    rspta.mensaje = registrar.mensaje
                    rspta.status = 200;
                }
                else
                {
                    if (isHibrido == 0)                     
                        rspta = { en: -1, m: 'Saldo insuficiente.' };                    
                    else
                    {
                        var faltante = monto - saldoActual;
                        const registrar = await registrarClienteCelular(cliente);
                        rspta['s'] = saldoActual;
                        rspta['sf'] = faltante.toFixed(2);;
                        rspta.error = config.success;
                        rspta.mensaje = registrar.mensaje
                        rspta.status = 200;
                    }
                }
            }
            else
            {
                rspta.en = res.error;
                rspta.m = res.info;
            }
            break;
            case CONSULTAR_CEDULA:
                if (!codigoPais) {
                    rspta = { error: 1, param: 'codigoPais' };
                    return;
                }
                let res = await ejecutarSQLRespuesta(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais]);
                if(res.error == config.success)
                {
                    if (res.info.length <= 0) 
                    {
                        rspta = { en: -1, m: 'Cliente no registrado.' };
                        return;
                    }
                    var saldoActual = clientesClipp[0]['saldo'];
                    var cliente = { icono, cliente_clipp: clientesClipp, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha };
                    if(saldoActual >= monto)
                    {
                        const registrar = await registrarClienteCelular(cliente);
                        rspta['s'] = monto;
                        rspta['sf'] = 0;
                        rspta.error = config.success;
                        rspta.mensaje = registrar.mensaje
                        rspta.status = 200;
                    }
                    else if (saldoActual > 0)
                    {
                        if (isHibrido == 0)                     
                            rspta = { en: -1, m: 'Saldo insuficiente.' };                    
                        else
                        {
                            var faltante = monto - saldoActual;
                            const registrar = await registrarClienteCelular(cliente);
                            rspta['s'] = saldoActual;
                            rspta['sf'] = faltante;
                            rspta.error = config.success;
                            rspta.mensaje = registrar.mensaje
                            rspta.status = 200;
                        }
                    }
                    else 
                    {
                        rspta.en =  1, rspta.m = 'Cliente sin saldo clipp, cobre en efectivo.', rspta.s = 0, rspta.sf= monto;
                    }
                }
                else
                {
                    rspta.en = res.error;
                    rspta.m = res.info;
                }
                break;
        default:
            rspta = { en: -2, m: 'Tipo enviado no contemplado.' };
            break;

    }

    next();
}

module.exports.consultarSaldo = async (req, res, next) => {

    var { idAdministrador, idAplicativo, auth, idPlataforma, imei, marca, modelo, so, vs } = req.body;

    if (!idAdministrador) req.body = { error: 1, param: 'idAdministrador' };
    if (!idAplicativo) req.body = { error: 1, param: 'idAplicativo' };
    
    if(req.body.error = 1)
        next();

    const autorizado = await authorization.verifiAuthAdmin(req.body);
    if(!autorizado)
        req.body = autorizado
    else
    {
        const saldos = await ejecutarSQLRespuesta(SQL_CONSULTAR_SALDO, [idAdministrador]);
        req.body = { en: 1, lS: saldos }
    }
    next();
}


module.exports.listarTarjetas = async (idAplicativoClipp, req, res) => {

    var { imei, con, criterio, tipo, codigoPais } = req.body;
    let error = 0, param = '';

    if (!codigoPais) { error = 1; param = 'codigoPais' };
    if (!criterio) { error = 1; param = 'criterio' };
    if (!tipo) { error = 1; param = 'tipo' };
    if (!imei) { error = 1; param = 'imei' };
    if (!con) { error = 1; param = 'con' };

    if (error == 1) {
        req.body.error = error;
        req.body.param = param;
        next();
    }

    const clientes = await ejecutarSQLRespuesta(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais]);
    if (clientes.length <= 0)
        req.body ={ error: 3 };
    else
    {
        var idCliente = clientes[0]['idCliente'];
        const tkss = await ejecutarSQLRespuesta(var_payphone.SQL_VERIFICAR_TOKEN, [idCliente, imei.toString(), con.toString()]);
        if (tkss.length <= 0)
            req.body = { error: 3 };
        else
        {
            const tarjetas = await ejecutarSQLRespuesta(var_payphone.SQL_LISTAR_TARJETAS, [idCliente]);
            req.body = { en: 1, lT: tarjetas };
        }
    }
    next();
    
}
module.exports.realizarCobro = async (idAplicativoClipp, req, res) => {

    var { imei, con, saldo, idProceso, criterio, tipo, codigoPais } = req.body;
    let error = 0, param = '';

    if (!codigoPais) { error = 1; param = 'codigoPais' };
    if (!criterio) { error = 1; param = 'criterio' };
    if (!tipo) { error = 1; param = 'tipo' };
    if (!imei) { error = 1; param = 'imei' };
    if (!con) { error = 1; param = 'con' };
    if (!idProceso) { error = 1; param = 'idProceso' };
    if (!saldo) { error = 1; param = 'saldo' };
    if (isNaN(saldo)) { error = 1; param = 'saldo' };

    if (error == 1) {
        req.body.error = error;
        req.body.param = param;
        next();
    }

    cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais], function (clientes) {
        if (clientes.length <= 0)
            return res.status(401).send({ error: 3 });
        if (clientes[0]['cedula'] == null)
            return res.status(200).send({ en: 2, m: 'Por favor actualice la cédula en su perfil' });
        var idCliente = clientes[0]['idCliente'];
        return registrarCobroCliente(idAplicativoClipp, idCliente, con, saldo, clientes[0], idProceso, codigoPais, res);
    }, res);
}

module.exports = {

}









var SQL_UPDATE_CLIENTE_CLIPP_PAY =
    "UPDATE clipp_pay.cliente SET nombres = ?, apellidos = ?, correo = ?, celular = ? WHERE idCliente = ?;";


var SQL_BUSCAR_CLIENTE_CLIPP_PAY_CEDULA =
    "SELECT idCliente FROM clipp_pay.cliente WHERE cedula = ?;";

