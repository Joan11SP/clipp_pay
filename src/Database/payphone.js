const { db_name } = require('../config');

module.exports = {
    SQL_TOKEN_APLICATIVO : "SELECT ttc.idtokenTarjetaCredito, ttc.passwordCodificacion, ttc.identificativo, CONCAT('Bearer ', ttc.token) AS Authorization, ttc.idTienda FROM " + db_name + "_acceso.tokenTarjetaCredito ttc WHERE ttc.idAplicativo = ? AND ttc.habilitado = 1 ",
    SQL_INFORMACION_ADICIONAL_TARJETA : "UPDATE " + db_name + "_encrip.tabl SET cardType = ?, bin = ?, lastDigits = ?, cardBrandCode = ?, cardBrand = ?, document = ?, currency = ?, regionIso = ?, transactionType = ? WHERE tks = ? AND number = ? AND eliminado = 0 AND cardType IS NULL LIMIT 1,",
    SQL_INFORMACION_ADICIONAL_TRANSACCION :"UPDATE " + db_name + "_encrip.transaction SET cardType = ? WHERE idT = ? LIMIT 1,",
    SQL_ACTULIZAR_RESPUESTA_TRANSACCION :"UPDATE " + db_name + "_encrip.transaction SET statusCode = ?, status = ?, en = ? WHERE idT = ? LIMIT 1,",
    SQL_ACTUALIZAR_ID_TRANSACCION :"UPDATE " + db_name + "_encrip.transaction SET transactionId = ?, fecha_en = NOW() WHERE idT = ? LIMIT 1,"
}