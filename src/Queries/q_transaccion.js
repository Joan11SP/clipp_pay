function registrarPago(idAplicativo, idServicioAplicativo, idCompania, idAplicativoClipp, isHibrido, icono, req, res) {
    var saldo = req.body.saldo;
    var observacion = req.body.observacion;
    var idTransaccionPeticion = req.body.idTransaccionPeticion;
    var criterio = req.body.criterio;
    var tipo = req.body.tipo;
    var fecha = req.body.fecha;
    var idAdministradorRegistro = 1;

    if (!saldo)
        return res.status(400).send({ error: 1, param: 'saldo' });
    var monto = saldo.toString().replace(',', '.');
    if (isNaN(monto))
        return res.status(400).send({ error: 1, param: 'saldo' });
    var montos = monto.split('.');
    if (montos.length > 2)
        return res.status(400).send({ error: 1, param: 'saldo' });
    if (montos.length === 2 && montos[1].length > 2)
        return res.status(400).send({ error: 1, param: 'recarga, solo se permiten dos decimales' });

    if (!observacion)
        observacion = '';
    if (!idTransaccionPeticion)
        idTransaccionPeticion = null;

    if (!criterio)
        return res.status(400).send({ error: 1, param: 'criterio' });
    if (!tipo)
        return res.status(400).send({ error: 1, param: 'tipo' });
    if (!fecha)
        return res.status(400).send({ error: 1, param: 'fecha' });

    switch (parseInt(tipo)) {
        case CONSULTAR_CEDULA:
            return cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CEDULA, [idAplicativoClipp, criterio], function (clientesClipp) {
                if (clientesClipp.length <= 0)
                    return res.status(401).send({ en: -1, m: '1 Cliente no registrado.' });
                var saldoActual = clientesClipp[0]['saldo'];
                console.log('saldoActual ' + saldoActual);
                if (saldoActual >= monto) {
                    return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                        pago['s'] = monto;
                        pago['sf'] = 0;
                        console.log('llega 3 ' + JSON.stringify(pago))
                        return res.status(200).send(pago);
                    });
                } else {
                    if (isHibrido == 0) {
                        return res.status(401).send({ en: -1, m: 'Saldo insuficiente.' });
                    } else {
                        var faltante = monto - saldoActual;
                        return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], saldoActual, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                            pago['s'] = saldoActual;
                            pago['sf'] = faltante.toFixed(2);
                            console.log('llega 4 ' + JSON.stringify(pago))
                            return res.status(200).send(pago);
                        });
                    }
                }
            }, res);
            break;
        case CONSULTAR_CELULAR:
            var codigoPais = req.body.codigoPais;
            if (!codigoPais)
                return res.status(400).send({ error: 1, param: 'codigoPais' });

            return cnf.ejecutarResSQL(SQL_CONSULTAR_SALDO_CELULAR, [idAplicativoClipp, criterio, parseInt(criterio), codigoPais], function (clientesClipp) {
                if (clientesClipp.length <= 0)
                    return res.status(401).send({ m: '2 Cliente no registrado.' });
                var saldoActual = clientesClipp[0]['saldo'];
                console.log('saldoActual ' + saldoActual);
                if (saldoActual >= monto) {
                    return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], monto, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                        pago['s'] = monto;
                        pago['sf'] = 0;
                        console.log('llega 1 ' + JSON.stringify(pago))
                        return res.status(200).send(pago);
                    });
                } else if (saldoActual > 0) {
                    if (isHibrido == 0) {
                        return res.status(401).send({ m: 'Saldo insuficiente.' });
                    } else {
                        var faltante = monto - saldoActual;
                        return registrarClienteCelular(icono, clientesClipp[0]['idCliente'], clientesClipp[0]['nombres'], clientesClipp[0]['apellidos'], clientesClipp[0]['cedula'], clientesClipp[0]['correo'], clientesClipp[0]['celular'], saldoActual, idAdministradorRegistro, observacion, idTransaccionPeticion, fecha, function (pago) {
                            pago['s'] = saldoActual;
                            pago['sf'] = faltante;
                            console.log('llega 2 ' + JSON.stringify(pago))
                            return res.status(200).send(pago);
                        });
                    }
                } else {
                    return res.status(200).send({ en: 1, m: 'Cliente sin saldo clipp, cobre en efectivo.', s: 0, sf: monto });
                }
            }, res);
        default:
            return res.status(200).send({ en: -2, m: 'Tipo enviado no contemplado.' });
    }
}
var SQL_INSERTAR_CLIENTE_CLIPP_PAY =
    "INSERT INTO clipp_pay.cliente (nombres, apellidos, cedula, correo, celular) VALUES (?, ?, ?, ?, ?) "
    
var SQL_UPDATE_CLIENTE_CLIPP_PAY =
    "UPDATE clipp_pay.cliente SET nombres = ?, apellidos = ?, correo = ?, celular = ? WHERE idCliente = ?;";
var SQL_UPDATE_CLIENTE_CLIPP_PAY_CEDULA =
    "UPDATE clipp_pay.cliente SET nombres = ?, apellidos = ?, correo = ?, cedula = ? WHERE idCliente = ?;";

var SQL_BUSCAR_CLIENTE_CLIPP_PAY_CEDULA =
    "SELECT idCliente FROM clipp_pay.cliente WHERE cedula = ?;";

var SQL_BUSCAR_CLIENTE_CLIPP_PAY_CELULAR =
    "SELECT idCliente FROM clipp_pay.cliente WHERE celular = ?;";