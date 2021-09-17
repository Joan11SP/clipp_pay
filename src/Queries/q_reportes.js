const consultas = require('../Database/consultas')
const mysql = require('../Database/mysql');

const util = require('util');
const sql = util.promisify(mysql.query).bind(mysql);

const allReporte = async (filtro) => {
    try {

        let report = consultas.report_sucursal;
        let icono = filtro.id_icono == -1 ? "t.idTransaccionIcono is not null " : "t.idTransaccionIcono = "+filtro.id_icono+" "
        report = report + "(t.idTransaccionTipo = "+filtro.tipo_tran+" or "+filtro.tipo_tran+" = -1) and ";
        report = report + "(t.idAdministradorRegistro = "+filtro.admin+" or "+filtro.admin+" = -1)  and ";
        report = report + "(te.idTransaccionEntidad = "+filtro.id_entidad+" or "+filtro.id_entidad+" = -1) and ";
        report = report + "((t.fecha_registro >= "+filtro.fecha_inicio+"  or "+filtro.fecha_inicio+" = -1) and (t.fecha_registro <= "+filtro.fecha_fin+" or "+filtro.fecha_fin+" =-1 )) and ";
        report = report + icono
        report = report + "group by t.idTransaccionTipo, t.idTransaccionEntidad, t.idTransaccionIcono "
        report = report + "order by t.idtransaccionSucursal limit 500;"
        var reporte = await sql(report);
        var ventas = await sql(consultas.total_ventas);     
        return { reporte, ventas:ventas[0] };
    } catch (error) {
        console.log(error);
        throw error;        
    }
}

// consulta con filtro para las transacciones
const report_transaccion =  async (filtro) => {
    try {
        let report = consultas.repor_tran;
        let icono = filtro.id_icono == -1 ? "t.idTransaccionIcono is not null " : "t.idTransaccionIcono = "+filtro.id_icono+" "
        report = report + "(t.idTransaccionTipo = "+filtro.tipo_tran+" or "+filtro.tipo_tran+" = -1) and ";
        report = report + "(t.idAdministradorRegistro = "+filtro.admin+" or "+filtro.admin+" = -1)  and ";
        report = report + "(te.idTransaccionEntidad = "+filtro.id_entidad+" or "+filtro.id_entidad+" = -1) and ";
        report = report + "((t.fecha_registro >= "+filtro.fecha_inicio+"  or "+filtro.fecha_inicio+" = -1) and (t.fecha_registro <= "+filtro.fecha_fin+" or "+filtro.fecha_fin+" =-1 )) and ";
        report = report + icono
        report = report + "group by t.idTransaccionTipo, t.idTransaccionEntidad, t.idTransaccionIcono "
        report = report + "order by t.idTransaccion limit 500;"
        console.log(report);
        var reporte = await sql(report);
        return reporte;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

const datos_filtro = async () => {
    try {
        
        const icono = await sql(consultas.cons_icono);
        const tipo_tran = await sql(consultas.cons_tipo_tran);
        const entidad = await sql(consultas.const_entidad);
        const admins  = await sql(consultas.const_admin)
        return {icono,tipo_tran,entidad,admins};

    } catch (error) {
        throw error;
    }
}

module.exports = {
    allReporte,
    report_transaccion,
    datos_filtro
}








