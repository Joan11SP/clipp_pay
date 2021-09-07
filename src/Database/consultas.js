const all_reporte = "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.monto) as dinero_total from clipp.sucursal s join clipp.transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? group by s.idSucursal;";


module.exports = {
    all_reporte
}