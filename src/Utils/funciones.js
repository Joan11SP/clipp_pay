const { error,msg_error } = require('../config');
//const fetch = require ('node-fetch');

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

const solicitudApi = async (url, body = null, metodo = 'POST',headers) => {

    // let data = {  method: metodo };

    // body != null ? data.body = JSON.stringify(body) : null;
    // try {
    //     const response = await fetch(url, data,headers);
    //     const respuesta = await response.json();
    //     return respuesta;
    // } catch (error) {
    //     throw error;
    // }
}

module.exports = {
    enviarError,
    enviarRespuesta,
    solicitudApi
}