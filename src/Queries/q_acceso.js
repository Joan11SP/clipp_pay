const { val_compania, val_entidad,val_user } = require('../Database/consultas')

const mysql = require('../Database/mysql');

const util = require('util');
const config = require('../config');
const sql = util.promisify(mysql.query).bind(mysql);

const validarAcceso =  async (access) => {

    try {
        let ok = config.success, mensaje;
        var val = await sql(val_compania, [access.user, access.pass]);
        if(val.length > 0){
            val = await sql(val_entidad, [access.id_entidad]);
            if(val.length <= 0)
                mensaje = config.msg_entidad, ok = config.error    
        }
        else
            mensaje = config.msg_compania, ok = config.error

        return { ok,mensaje}
    } catch (error) {
        throw error;
    }
}

const validarPersona = async (persona) => {

    try {
        let ok = config.success, mensaje,resultados;
        let user = val_user;
        user = user.replace("cedula", persona.identificacion);
        console.log(user);
        let va_user = await sql(user);
        if(va_user[0].val_user == -2){
            ok = config.error; mensaje = 'Usuario no existe.'
        }else
           resultados = va_user[0].val_user; 
        return {ok,mensaje,resultados}   
    } catch (error) {
        throw error;
    }

}

module.exports = {
    validarAcceso,
    validarPersona
}