const { all_reporte,total_ventas,all_report_sucursal } = require('../Database/consultas')
const mysql = require('../Database/mysql');

const util = require('util');
const sql = util.promisify(mysql.query).bind(mysql);

const allReporte = async (filtro) => {
    try {
        var ventas;
        var consulta = filtro.id_sucursal == -1 ? all_reporte : all_report_sucursal
        var rspt = await sql(consulta, [filtro.fecha_inicio, filtro.fecha_fin,filtro.id_sucursal]);
        if(rspt.length>0){
            ventas = await sql(total_ventas);
        }        
        return { ventaslocal: rspt, total: ventas };
    } catch (error) {
        console.log(error);
        throw error;        
    }
}


module.exports = {
    allReporte
}








