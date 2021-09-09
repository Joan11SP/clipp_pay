const { db_name, BD} = require('../config')
const all_reporte = "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.monto) as dinero_total from "+db_name+".sucursal s join "+db_name+".transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? group by s.idSucursal;";
const total_ventas = "select count(*) total_ventas, sum(ts.monto) as dinero_total from "+db_name+".transaccionSucursal ts where idtransaccionTipo = 1;"
const all_report_sucursal = "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.monto) as dinero_total from "+db_name+".sucursal s join "+db_name+".transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? and s.idSucursal = ?;"
const val_compania = "select 1 as result from "+BD+".compania where usuario = ? and contrasenia = ? "
const val_entidad = "select 1 from clipp_pay.entidad where idEntidad = ? and habilitado = 1"
module.exports = {
    all_reporte,
    total_ventas,
    all_report_sucursal,
    val_compania,
    val_entidad
}