const { ejecutarSQLRespuesta } = require('../Queries/q_transaccion');
const { sql_verifi_auth_admin, sql_obtener_correo_cliente, sql_registrar_token } = require('../Database/consultas')

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

const verifiAuthAdmin = async (body) => {

    let {idAdministrador, auth, idPlataforma, imei, marca, modelo, so, vs, res, callback} = body
    let respuesta;
    if (!marca)  respuesta = { error: 1, param: 'marca' };
    
    if (!modelo)  respuesta = { error: 1, param: 'modelo' };
    if (!so) respuesta = { error: 1, param: 'so' };
    if (!vs) respuesta = { error: 1, param: 'vs' };

    if(respuesta.error != 1)
    {
        const req_sql = await ejecutarSQLRespuesta(sql_verifi_auth_admin, [idAdministrador, idPlataforma, imei, auth]);
        if (req_sql.respuesta.length <= 0) 
            respuesta = { m: 'Su sesión a caducado =(' };
        else
            respuesta = true;
    }
    return respuesta;
}

const solicitarToken = async (req, res) => {

    let respuesta;
    if (!req.body.idAplicativo) {
        respuesta = { error: 1, param: 'idAplicativo' };
    }
    else
    {
        const auth = await verificarAtorizacionCliente(req.body);
        if (!auth)
            return;
        let token = generarAuth(6);

        const cliente = await ejecutarSQLRespuesta(sql_obtener_correo_cliente, [req.body.idCliente]);

        if (cliente.respuesta.length <= 0)
            respuesta = { en: -1, m: 'No se pudo obtener cliente' };
        else
        {
            const registro = await ejecutarSQLRespuesta(sql_registrar_token, [req.body.idCliente, token]);
            await mail.enviarMailGenerico(req.body.idAplicativo, cliente[0]['correo'], 'TOKEN DE ACCESO', [{ "clave": "Token", "valor": token.toString() }]);
            respuesta = { en: 1, idClienteToken: registro['insertId'], m: 'Token enviado correctamente.' };
        }
    }

    return respuesta;
    
}

module.exports = {
    verifiAuthAdmin,
    solicitarToken
}
