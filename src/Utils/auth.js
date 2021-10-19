const generarAuth = () => {
    var numbers1 = [1, 3, 5, 7, 9];
    var randomstring = '';
    for (var i = 0; i < 10; i++) {
        var rnum = Math.floor(Math.random() * numbers1.length);
        randomstring += numbers1[rnum];
    }
    var leter = ['K', 'J', 'P', '12', 'AX', 'GR'];
    for (var i = 0; i < 10; i++) {
        var rnum = Math.floor(Math.random() * leter.length);
        randomstring += leter[rnum];
    }
    var numbers2 = [2, 4, 6, 8, 0];
    for (var i = 0; i < 10; i++) {
        var rnum = Math.floor(Math.random() * numbers2.length);
        randomstring += numbers2[rnum];
    }
    return (randomstring);
}

function verificarAtorizacionAdministrador(idAdministrador, auth, idPlataforma, imei, marca, modelo, so, vs, res, callback) {
    if (!marca) {
        res.status(400).send({ error: 1, param: 'marca' });
        return callback(false);
    }
    if (!modelo) {
        res.status(400).send({ error: 1, param: 'modelo' });
        return callback(false);
    }
    if (!so) {
        res.status(400).send({ error: 1, param: 'so' });
        return callback(false);
    }
    if (!vs) {
        res.status(400).send({ error: 1, param: 'vs' });
        return callback(false);
    }
    cnf.ejecutarResSQL(SQL_VERIFICAR_AUTORIZACION_ADMINISTRADOR, [idAdministrador, idPlataforma, imei, auth], function (autorizaciones) {
        if (autorizaciones.length <= 0) {
            callback(false);
            return res.status(403).send({ m: 'Su sesión a caducado =(' });
        }
        return callback(true);
    }, res);
}


const SQL_VERIFICAR_AUTORIZACION_ADMINISTRADOR = "SELECT fecha_inicio FROM " + _BD_ + ".administradorSessionPush WHERE idAdministrador = ? AND  idPlataforma = ? AND imei = ?  AND auth = MD5(CONCAT(?, 'JpKradacTounk')) AND activado = 1 LIMIT 1;";

const solicitarToken = async (req, res, next) => {

    var { idAplicativo, idCliente, auth, idPlataforma, imei, marca, modelo, so, vs } = req.body;

    if (!idAplicativo) {
        req.body = { error: 1, param: 'idAplicativo' };
        next();
    }



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