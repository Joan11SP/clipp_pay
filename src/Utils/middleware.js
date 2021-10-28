const config = require('../config');
const { validarAcceso,validarPersona } = require('../Queries/q_acceso')

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

module.exports = {
    validarDatosEntrada,
    enviarDatos
}