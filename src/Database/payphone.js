const { db_name } = require('../config');

module.exports = {
    SQL_TOKEN_APLICATIVO : "SELECT ttc.idtokenTarjetaCredito, ttc.passwordCodificacion, ttc.identificativo, CONCAT('Bearer ', ttc.token) AS Authorization, ttc.idTienda FROM " + db_name + "_acceso.tokenTarjetaCredito ttc WHERE ttc.idAplicativo = ? AND ttc.habilitado = 1 ",
    SQL_INFORMACION_ADICIONAL_TARJETA : "UPDATE " + db_name + "_encrip.tabl SET cardType = ?, bin = ?, lastDigits = ?, cardBrandCode = ?, cardBrand = ?, document = ?, currency = ?, regionIso = ?, transactionType = ? WHERE tks = ? AND number = ? AND eliminado = 0 AND cardType IS NULL LIMIT 1,",
    SQL_INFORMACION_ADICIONAL_TRANSACCION :"UPDATE " + db_name + "_encrip.transaction SET cardType = ? WHERE idT = ? LIMIT 1,",
    SQL_ACTULIZAR_RESPUESTA_TRANSACCION :"UPDATE " + db_name + "_encrip.transaction SET statusCode = ?, status = ?, en = ? WHERE idT = ? LIMIT 1,",
    SQL_ACTUALIZAR_ID_TRANSACCION :"UPDATE " + db_name + "_encrip.transaction SET transactionId = ?, fecha_en = NOW() WHERE idT = ? LIMIT 1,",
    SQL_VERIFICAR_TOKEN:"SELECT `op`, `sum`, `mul`, `div` FROM " + db_name + "_describ.tks WHERE tks = ? AND dis = ? AND con = ? AND lav >= DATE_SUB(NOW(), INTERVAL 2 MINUTE) LIMIT 1;",
    SQL_LISTAR_TARJETAS:"SELECT `number`, `type`, `con`, `expirationMonth`, `expirationYear`, `alias`, type AS cardType,  cardType AS tipoTarjeta, IFNULL(cardHolder, '') as cardHolder FROM " + db_name + "_encrip.tabl WHERE tks = ? AND eliminado = 0;",
    ES_NO_APROBADA: 4,
    ES_NO_REALIZADA: 5,
    ES_APROBADA: 2,
    ES_ERROR: 3,
    SQL_ACTUALIZAR_CARDTOKEN: "UPDATE " + db_name + "_encrip.tabl SET cardToken = (AES_ENCRYPT(?,?))  WHERE number = ?  AND tks = ?",
    SQL_TRANSACCION_TOKEN: "UPDATE " + db_name + "_encrip.transaction SET idtTC = ? WHERE idT = ? LIMIT 1;",
    SQL_SOLICITUD_REVERSO_REVERSADA:"UPDATE " + db_name + "_encrip.transaction SET revers = '2', fecha_reversada = NOW() WHERE idT = ? LIMIT 1;",
    SQL_SOLICITUD_REVERSO:"UPDATE " + db_name + "_encrip.transaction SET revers = '1', fecha_reverso = NOW() WHERE idT = ? LIMIT 1;",
}