const { db_name, BD } = require('../config')

module.exports = {
    all_reporte : "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.saldo) as dinero_total from " + db_name + ".sucursal s join " + db_name + ".transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? group by s.idSucursal;",
    total_ventas : "select count(*) total_ventas, sum(ts.saldo) as dinero_total from " + db_name + ".transaccionSucursal ts where idtransaccionTipo = 1;",
    all_report_sucursal: "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.monto) as dinero_total from " + db_name + ".sucursal s join " + db_name + ".transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? and s.idSucursal = ?;",
    val_compania: "select 1 as result from " + BD + ".compania where usuario = ? and contrasenia = ? ",
    val_entidad: "select 1 from " + BD + ".entidad where idEntidad = ? and habilitado = 1",
    repor_tran : "select t.idTransaccion,te.transaccionEntidad, tt.tipo, ti.descripcion, sum(saldo) total_saldo, t.fecha_registro,count(*) total_tran "
                    + "from " + db_name + ".transaccion t join " + db_name + ".transaccionTipo tt  on "
                    + "t.idTransaccionTipo = tt.idTransaccionTipo join " + db_name + ".transaccionEntidad te on "
                    + "t.idTransaccionEntidad = te.idTransaccionEntidad  join " + db_name + ".transaccionIcono ti on "
                    + "t.idTransaccionIcono = ti.idTransaccionIcono where ",
    cons_icono: "select idTransaccionIcono id_icono, descripcion icono from " + db_name + ".transaccionIcono where habilitado = 1;",
    cons_tipo_tran: "select idTransaccionTipo id_tipo, tipo nombre_tipo from " + db_name + ".transaccionTipo;",
    const_entidad: "select idTransaccionEntidad id_entidad, transaccionEntidad nombre_entidad from clipp.transaccionEntidad;"
}