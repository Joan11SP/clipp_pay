const config = require("../config");
const { ejecutarSQL, ejecutarSQLRespuesta, registrarClienteCelular,registrarCobroCliente } = require('../Queries/q_transaccion');
const 
{ 
    sql_consultar_saldo_cedula,
    sql_consultar_saldo, 
    sql_consultar_saldo_celular
} 
= require('../Database/consultas');
const payphone = require('../Database/payphone');
const authorization = require('../Utils/auth');



const registrarPago = async (req, res, next) => {

    const { idAplicativo, idServicioAplicativo, idCompania, idAplicativoClipp, isHibrido, icono } = req.body;
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
        case 1:

            try 
            {
                let cli = await ejecutarSQLRespuesta(sql_consultar_saldo_cedula,[idAplicativoClipp, criterio]);
                if(cli.error == config.success)
                {
                    if (cli.respuesta.length <= 0) 
                    {
                        rspta = { error: -1, mensaje: '1 Cliente no registrado.' };
                        return;
                    }
                    var saldoActual = cli.respuesta[0].saldo;
                    var cliente = { icono, cliente_clipp: cli.respuesta, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha };
                    let monto_trans = parseFloat(monto)
                    if(saldoActual >=  monto_trans)
                    {
                        const registrar = await registrarClienteCelular(cliente);
                        rspta['s'] = monto;
                        rspta['sf'] = 0;
                        rspta.error = !registrar.error ? config.success : registrar.error;
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
                            rspta['sf'] = faltante.toFixed(2);
                            rspta.error = !registrar.error ? config.success : registrar.error;
                            rspta.mensaje = registrar.mensaje
                            rspta.status = 200;
                        }
                    }
                }
                else
                {
                    rspta = cli;
                }
            } 
            catch (error) 
            {
                rspta = { error: -1, mensaje: config.msg_error };
            }
            break;
            case 2:
                try 
                {
                    if (!codigoPais) {
                        rspta = { error: 1, param: 'codigoPais' };
                        return;
                    }
                    let cli2 = await ejecutarSQLRespuesta(sql_consultar_saldo_celular, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais]);
                    if(cli2.error == config.success)
                    {
                        if (cli2.info.length <= 0) 
                        {
                            req.body = { error: -1, mensaje: 'Cliente no registrado.' };
                            next();
                        }
                        var saldoActual = cli2.respuesta[0].saldo;
                        var cliente = { icono, cliente_clipp: cli2.respuesta, monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha };
                        if(saldoActual >= monto)
                        {
                            const registrar = await registrarClienteCelular(cliente);
                            rspta['s'] = monto;
                            rspta['sf'] = 0;
                            rspta.error = !registrar.error ? config.success : registrar.error;
                            rspta.mensaje = registrar.mensaje
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
                                rspta.error = !registrar.error ? config.success : registrar.error;
                                rspta.mensaje = registrar.mensaje
                            }
                        }
                        else 
                        {
                            rspta.error =  1, rspta.mensaje = 'Cliente sin saldo clipp, cobre en efectivo.', rspta.s = 0, rspta.sf= monto;
                        }
                    }
                    else
                    {
                        rspta = cli2;
                    }    
                } 
                catch (error) 
                {
                    rspta = { error: -1, mensaje: config.msg_error };  
                }
                break;
        default:
            rspta = { en: -2, m: 'Tipo enviado no contemplado.' };
            break;

    }
    req.body = rspta;
    next();
}

const consultarSaldo = async (req, res, next) => {

    var { idAdministrador, idAplicativo } = req.body;

    if (!idAdministrador) req.body = { error: 1, param: 'idAdministrador' };
    if (!idAplicativo) req.body = { error: 1, param: 'idAplicativo' };
    
    if(req.body.error == 1)
        next();
    else
    {
        try {
            const autorizado = await authorization.verifiAuthAdmin(req.body);
            if(!autorizado)
                req.body = autorizado
            else
            {
                const saldos = await ejecutarSQLRespuesta(sql_consultar_saldo, [parseInt(idAdministrador)]);
                req.body = { en: 1, lS: saldos }
            }
            next();
        } catch (error) {
            req.body = { error: config.error, mensaje: config.msg_error }
            next();
        }
    }    

    
}

const listarTarjetas = async (req, res, next) => {

    var { imei, con, criterio, tipo, codigoPais,idAplicativoClipp } = req.body;
    let error = 0, param = '';

    if (!codigoPais) { error = 1; param = 'codigoPais' };
    if (!criterio) { error = 1; param = 'criterio' };
    if (!tipo) { error = 1; param = 'tipo' };
    if (!imei) { error = 1; param = 'imei' };
    if (!con) { error = 1; param = 'con' };

    if (error == 1) 
    {
        req.body.error = error;
        req.body.param = param;
    }
    else
    {
        try {
            const clientes = await ejecutarSQLRespuesta(sql_consultar_saldo_celular, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais]);
            if (clientes.respuesta.length <= 0)
                req.body ={ error: 3 };
            else
            {
                let respuesta = clientes.respuesta[0]
                let idCliente = respuesta.idCliente;
                const tkss = await ejecutarSQLRespuesta(payphone.SQL_VERIFICAR_TOKEN, [idCliente, imei.toString(), con.toString()]);
                if (tkss.respuesta.length <= 0)
                    req.body = { error: 3 };
                else
                {
                    const tarjetas = await ejecutarSQLRespuesta(payphone.SQL_LISTAR_TARJETAS, [idCliente]);
                    req.body = { en: 1, lT: tarjetas };
                }
            }
        } catch (error) {
            req.body = { error: config.error, mensaje: config.msg_error }
            next();
        }
    }
    next();
    
    
}

const realizarCobro = async (idAplicativoClipp, req, res) => {

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
    }
    else
    {
        const clientes = await ejecutarSQLRespuesta(sql_consultar_saldo_celular, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais]);
        if (clientes.respuesta.length <= 0)
            req.body = { error: 3 };
        else if (clientes[0]['cedula'] == null)
            req.body = { en: 2, m: 'Por favor actualice la cédula en su perfil' };
        else
        {
            var idCliente = clientes[0]['idCliente'];
            req.body = await registrarCobroCliente(idAplicativoClipp, idCliente, con, saldo, clientes[0], idProceso, codigoPais);
        }
    }
    next();
    
}
module.exports = {
    listarTarjetas,
    registrarPago,
    consultarSaldo
}