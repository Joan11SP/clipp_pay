const config = require("../config");

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
    switch (parseInt(tipo)) {
        case CONSULTAR_CEDULA:
            return cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CEDULA, [idAplicativoClipp, criterio], function (clientesClipp) {
                if (clientesClipp.length <= 0) {
                    rspta = { en: -1, m: '1 Cliente no registrado.' };
                    return;
                }
                var saldoActual = clientesClipp[0]['saldo'];
                console.log('saldoActual ' + saldoActual);
                if (saldoActual >= monto) {
                    return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                        pago['s'] = monto;
                        pago['sf'] = 0;
                        console.log('llega 3 ' + JSON.stringify(pago))
                        rspta.status = 200;
                        return res.status(200).send(pago);
                    });
                } else {
                    if (isHibrido == 0) {
                        rspta = { en: -1, m: 'Saldo insuficiente.' };
                        return;
                    }
                    else {
                        var faltante = monto - saldoActual;
                        return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], saldoActual, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                            pago['s'] = saldoActual;
                            pago['sf'] = faltante.toFixed(2);
                            console.log('llega 4 ' + JSON.stringify(pago))
                            rspta.status = 200;
                            return res.status(200).send(pago);
                        });
                    }
                }
            }, res);
            break;
        case CONSULTAR_CELULAR:
            if (!codigoPais) {
                rspta = { error: 1, param: 'codigoPais' };
                return;
            }
            return cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais], function (clientesClipp) {
                if (clientesClipp.length <= 0) {
                    rspta = { m: '2 Cliente no registrado.' };
                    return;
                }

                var saldoActual = clientesClipp[0]['saldo'];
                if (saldoActual >= monto) {
                    return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                        pago['s'] = monto;
                        pago['sf'] = 0;
                        console.log('llega 1 ' + JSON.stringify(pago))
                        rspta.status = 200;
                        return res.status(200).send(pago);
                    });
                }
                else if (saldoActual > 0) {
                    if (isHibrido == 0) {
                        return res.status(401).send({ m: 'Saldo insuficiente.' });
                    } else {
                        var faltante = monto - saldoActual;
                        return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], saldoActual, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                            pago['s'] = saldoActual;
                            pago['sf'] = faltante;
                            console.log('llega 2 ' + JSON.stringify(pago))
                            status = 200;
                            return res.status(200).send(pago);
                        });
                    }
                } else {
                    return res.status(200).send({ en: 1, m: 'Cliente sin saldo clipp, cobre en efectivo.', s: 0, sf: monto });
                }
            }, res);
        default:
            rspta = { en: -2, m: 'Tipo enviado no contemplado.' };
            break;

    }

    next();
}

function consultarSaldo(req, res) {
    var idAdministrador = req.body.idAdministrador;
    var idAplicativo = req.body.idAplicativo;
    if (!idAdministrador)
        return res.status(400).send({ error: 1, param: 'idAdministrador' });
    if (!idAplicativo)
        return res.status(400).send({ error: 1, param: 'idAplicativo' });

    var auth = req.body.auth;
    var idPlataforma = req.body.idPlataforma;
    var imei = req.body.imei;
    var marca = req.body.marca;
    var modelo = req.body.modelo;
    var so = req.body.so;
    var vs = req.body.vs;

    rest_control.verificarAtorizacionAdministrador(idAdministrador, auth, idPlataforma, imei, marca, modelo, so, vs, res, function (autorizado) {
        if (!autorizado)
            return;
        cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO, [idAdministrador], function (saldos) {
            res.status(200).send({ en: 1, lS: saldos });
        }, res);
    });
}

var SQL_CONSULTAR_TRANSACCIONES =
    "SELECT t.observacionRegistro AS observacion, t.saldo, DATE_FORMAT(t.fecha_registro, '%d-%m-%Y %H:%i:%s') AS fecha_registro, te.idTransaccionEstado AS iE, te.estado, tt.idTransaccionTipo AS iT, tt.tipo, sr.idSaldoRazon AS iR, sr.razon FROM " + _BD_ + ".transaccion t INNER JOIN " + _BD_ + ".transaccionEstado te ON te.idTransaccionEstado = t.idTransaccionEstado INNER JOIN " + _BD_ + ".transaccionTipo tt ON tt.idTransaccionTipo = t.idTransaccionTipo INNER JOIN " + _BD_ + ".saldoRazon sr ON sr.idSaldoRazon = t.idSaldoRazon WHERE t.idAdministrador = ? AND t.anio = ? AND t.mes = ? ORDER BY idTransaccion;";



function solicitarToken(req, res) {
    var idAplicativo = req.body.idAplicativo;
    if (!idAplicativo)
        return res.status(400).send({ error: 1, param: 'idAplicativo' });
    var idCliente = req.body.idCliente;
    var auth = req.body.auth;
    var idPlataforma = req.body.idPlataforma;
    var imei = req.body.imei;
    var marca = req.body.marca;
    var modelo = req.body.modelo;
    var so = req.body.so;
    var vs = req.body.vs;

    rest_control.verificarAtorizacionCliente(idCliente, auth, idPlataforma, imei, marca, modelo, so, vs, res, function (autorizado) {
        if (!autorizado)
            return;
        let token = rest_control.generarAuth(6);
        cnf.ejecutarResSQL(SQL_OBTENER_CORREO_CLIENTE, [idCliente], function (cliente) {
            if (cliente.length <= 0)
                return res.status(200).send({ en: -1, m: 'No se pudo obtener ciente' });
            cnf.ejecutarResSQL(SQL_REGISTRAR_TOKEN, [idCliente, token], function (registro) {
                mail.enviarMailGenerico(idAplicativo, cliente[0]['correo'], 'TOKEN DE ACCESO', [{ "clave": "Token", "valor": token.toString() }]);
                return res.status(200).send({ en: 1, idClienteToken: registro['insertId'], m: 'Token enviado correctamente.' });
            }, res);
        }, res);
    });
}

const SQL_REGISTRAR_TOKEN =
    "INSERT INTO `clipp`.`clienteToken` (`idCliente`, `token`) VALUES (?, ?);";
const SQL_OBTENER_CORREO_CLIENTE =
    "SELECT correo FROM clipp.cliente WHERE idCliente = ? LIMIT 1;";

function listarTarjetas(idAplicativoClipp, req, res) {
    var imei = req.body.imei;
    var con = req.body.con;

    var criterio = req.body.criterio;
    var tipo = req.body.tipo;
    var codigoPais = req.body.codigoPais;

    if (!codigoPais)
        return res.status(400).send({ error: 1, param: 'codigoPais' });
    if (!criterio)
        return res.status(400).send({ error: 1, param: 'criterio' });
    if (!tipo)
        return res.status(400).send({ error: 1, param: 'tipo' });
    if (!imei)
        return res.status(400).send({ error: 1, m: 'imei' });
    if (!con)
        return res.status(400).send({ error: 1, m: 'con' });

    // var token = req.body.token;
    // var key = req.body.key;
    // var timeStanD = req.body.timeStanD;
    //
    // if (sha256(timeStanD + md5(imei)) !== token)
    // return res.status(401).send({error: 1});
    //
    // if (md5(imei + idCliente + con) !== key)
    // return res.status(401).send({error: 2});
    cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais], function (clientes) {
        if (clientes.length <= 0)
            return res.status(401).send({ error: 3 });
        var idCliente = clientes[0]['idCliente'];
        cnf.ejecutarResSQL(var_payphone.SQL_VERIFICAR_TOKEN, [idCliente, imei.toString(), con.toString()], function (tkss) {
            if (tkss.length <= 0)
                return res.status(401).send({ error: 3 });
            cnf.ejecutarResSQL(var_payphone.SQL_LISTAR_TARJETAS, [idCliente], function (tarejtas) {

                return res.status(200).send({ en: 1, lT: tarejtas });
            }, res);
        }, res);
    }, res);
}
function realizarCobro(idAplicativoClipp, req, res) {
    var imei = req.body.imei;
    var con = req.body.con;
    var saldo = req.body.saldo;
    var idProceso = req.body.idProceso;
    var criterio = req.body.criterio;
    var tipo = req.body.tipo;
    var codigoPais = req.body.codigoPais;

    if (!codigoPais)
        return res.status(400).send({ error: 1, param: 'codigoPais' });
    if (!criterio)
        return res.status(400).send({ error: 1, param: 'criterio' });
    if (!tipo)
        return res.status(400).send({ error: 1, param: 'tipo' });
    if (!imei)
        return res.status(400).send({ error: 1, m: 'imei' });
    if (!con)
        return res.status(400).send({ error: 1, m: 'con' });
    if (!idProceso)
        return res.status(400).send({ error: 1, m: 'idProceso' });
    if (!saldo)
        return res.status(400).send({ error: 1, m: 'costo' });
    if (isNaN(saldo))
        return res.status(400).send({ error: 1, m: 'costo' });

    cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais], function (clientes) {
        if (clientes.length <= 0)
            return res.status(401).send({ error: 3 });
        if (clientes[0]['cedula'] == null)
            return res.status(200).send({ en: 2, m: 'Por favor actualice la cédula en su perfil' });
        var idCliente = clientes[0]['idCliente'];
        return registrarCobroCliente(idAplicativoClipp, idCliente, con, saldo, clientes[0], idProceso, codigoPais, res);
    }, res);
}