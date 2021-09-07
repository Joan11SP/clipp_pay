const { all_reporte } = require('../Database/consultas')
const mysql = require('../Database/mysql');

const allReporte = async (filtro) => {
    var rspt = await mysql.query(all_reporte, [filtro.fecha_inicio, filtro.fecha_fin]);
    console.log(rspt)
    return rspt;    
}


module.exports = {
    allReporte
}








