const { error,msg_error } = require('../config');

const enviarError = (res) => {
    res.json({ok:error,mensaje:msg_error});
}

const enviarRespuesta = (res, ok, mgs, result, info_adicional=null) => {
    res.json(
        {
            ok:ok,
            mensaje:mgs,
            resultados:result,
            info:info_adicional
        }
    );
}

module.exports = {
    enviarError,
    enviarRespuesta
}