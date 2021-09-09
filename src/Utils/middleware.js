const config = require('../config');
const { validarAcceso } = require('../Queries/q_acceso')

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
            if(val_access.ok == config.success)
                next();            
            else
                res.status(400).json(val_access);        
        } catch (error) {
            res.status(500).json({ok:0,mensaje:config.msg_error})
        }
    }
}

module.exports = {
    validarDatosEntrada
}