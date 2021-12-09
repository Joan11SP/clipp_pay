const config = require('../config');
const { validarAcceso,validarPersona } = require('../Queries/q_acceso')
const { ejecutarSQL, ejecutarSQLRespuesta } = require('../Queries/q_transaccion');
const { SQL_AUTENTICAR } = require('../Database/consultas')

const validarDatosEntrada = async (req,res,next) => {

    var auth = new Buffer.from(req.headers.authorization.split(' ')[1],'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    
    if(!user || !pass){
        res.status(400).json({ ok:0, mensaje:'Faltan credenciales'});        
    }
    else{
        try {
            var credenciales = { user, pass, id_entidad: req.headers.id_entidad};
            const val_access = await validarAcceso(credenciales);
            if(val_access.ok == config.success){
                
                const val_cedula = await validarPersona(req.headers);

                if (val_cedula.ok == config.success){
                    req.body.id_cliente = val_cedula.resultados;
                    next();
                }
                else
                    res.status(400).json(val_cedula);            

            }
            else
                res.status(400).json(val_access);        
        } catch (error) {
            console.log(error);
            res.status(500).json({ok:0,mensaje:config.msg_error})
        }
    }
}

const enviarDatos = (req,res) => {

    res.send(req.body);

}

const validarTransaccion = async (req,res,next) => {

    var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
    var ipInfo = req.ipInfo;
    try {
        console.log('/pagos/registro_pago ip: ' + ip + ', ipInfo: ' + JSON.stringify(ipInfo));
    } catch (err) {
        return res.status(401).send({m: 'Administrador no autorizado err: ' + err});
    }
    if (!ip)
        return res.status(401).send({m: 'Administrador no autorizado ip: ' + ip});

    var token = req.headers.token;
    var tokenAplicativo = req.body.tokenAplicativo;
    if (!token)
        return res.status(400).send({m: 'Parameter missing code 0'});
    if (!tokenAplicativo)
        return res.status(400).send({m: 'Parameter missing code 1'});

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1)
        return res.status(401).send({m: 'Administrador no autorizado.'});

    var base64Credentials = req.headers.authorization.split(' ')[1];
    var credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    var [usuario, clave] = credentials.split(':');

//    administrador.imprimirOneLogs('r_c_recargas /recargar');
    try {
        
        const usuarios = await ejecutarSQLRespuesta(SQL_AUTENTICAR, [ip, usuario, clave, token, tokenAplicativo]);

        if(usuarios.respuesta.length <= 0)
            return res.status(401).send({m: 'Administrador no autorizado.'});
        req.body.version = req.headers.version;
        req.body.idAplicativo = usuarios.respuesta[0].idAplicativo;
        req.body.idServicioAplicativo = usuarios.respuesta[0].idServicioAplicativo;
        req.body.idCompania = usuarios.respuesta[0].idCompania;
        req.body.idAplicativoClipp = usuarios.respuesta[0].idAplicativoClipp;
        req.body.icono = usuarios.respuesta[0].icono;
        req.body.isHibrido = usuarios.respuesta[0].isHibrido;

        if(req.headers.version === '1.0.0')
            next();
        else
            return res.status(320).send({m: 'MENSAJE_DEPRECATE'});

    } catch (error) {
        return res.status(320).send({m: config.msg_error});
    }

}

module.exports = {
    validarDatosEntrada,
    enviarDatos,
    validarTransaccion
}