const { db_name, BD } = require('../config')

module.exports = {
    all_reporte : "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.saldo) as dinero_total from " + db_name + ".sucursal s join " + db_name + ".transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? group by s.idSucursal;",
    total_ventas : "select count(*) total_ventas, sum(ts.saldo) as dinero_total from " + db_name + ".transaccionSucursal ts where idtransaccionTipo = 1;",
    all_report_sucursal: "select s.idSucursal,sucursal,count(*) total_ventas, sum(ts.monto) as dinero_total from " + db_name + ".sucursal s join " + db_name + ".transaccionSucursal ts on s.idSucursal = ts.idSucursal where idtransaccionTipo = 1 and ts.fecha_registro between ? and ? and s.idSucursal = ?;",
    val_compania: "select 1 as result from " + BD + ".compania where usuario = ? and contrasenia = ? ",
    val_entidad: "select 1 from " + BD + ".entidad where idEntidad = ? and habilitado = 1",
    repor_tran : "select t.idTransaccion,te.transaccionEntidad, tt.tipo, ti.descripcion, sum(saldo) total_saldo, t.fecha_registro,count(*) total_tran "
                    + "from " + db_name + ".transaccion t "
                    + "join " + db_name + ".transaccionTipo tt ON t.idTransaccionTipo = tt.idTransaccionTipo "
                    + "join " + db_name + ".transaccionEntidad te ON te.idTransaccionEntidad = t.idTransaccionEntidad "
                    + "join  " + db_name + ".transaccionIcono ti ON t.idTransaccionIcono = ti.idTransaccionIcono where ",
    cons_icono: "select idTransaccionIcono id_icono, descripcion icono from " + db_name + ".transaccionIcono where habilitado = 1;",
    cons_tipo_tran: "select idTransaccionTipo id_tipo, tipo nombre_tipo from " + db_name + ".transaccionTipo;",
    const_entidad: "select idTransaccionEntidad id_entidad, transaccionEntidad nombre_entidad from clipp.transaccionEntidad;",
    const_admin: "select idAdministrador id_admin, concat(nombres, ' ', apellidos) nombres  FROM clipp.administrador;",
    report_sucursal: "select  t.idtransaccionSucursal,te.transaccionEntidad, tt.tipo,ti.descripcion, sum(saldo) total_saldo,count(*) total_tran, sucursal "      
                    + "from  " + db_name + ".transaccionSucursal t "
                    + "    inner join " + db_name + ".sucursal s on t.idtransaccionSucursal = s.idSucursal "
                    + "    inner join " + db_name + ".transaccionTipo tt ON t.idTransaccionTipo = tt.idTransaccionTipo "
                    + "    inner join " + db_name + ".transaccionEntidad te ON te.idTransaccionEntidad = t.idTransaccionEntidad "
                    + "    left join  " + db_name + ".transaccionIcono ti ON t.idTransaccionIcono = ti.idTransaccionIcono where ",
    f_val_user: "DELIMITER $$"
                + "create function " + BD + ".val_user(ced varchar(10)) "
                + "RETURNS int "
                + "DETERMINISTIC "
                + "BEGIN "
                + "    set @id_cliente=-1, @id=-1; "
                + "    select idCliente into @id_cliente from " + BD + ".cliente where cedula = ced;"
                + "    if @id_cliente = -1 then"
                + "            select idCliente into @id_cliente from " + db_name + ".cliente where cedula = ced;"
                + "            if @id_cliente <> -1 then"
                + "                select max(idCliente+1) into @id from " + BD + ".cliente;"
                + "                insert into " + BD + ".cliente select @id, nombres, apellidos, cedula, celular, correo,now() from " + db_name + ".cliente where cedula = ced;"
                + "                set @id_cliente = @id;"
                + "            else"
                + "                set @id_cliente = -2; -- no existe"
                + "            end if;			"
                + "    end if;      "
	            + "    RETURN @id_cliente;"
                + "END$$ "
                + "DELIMITER ;",
    val_user : "select " + BD + ".val_user('cedula') as val_user",
    insert_transaccion:"insert into " + BD + ".transaccion ('idTransaccion', 'idServicioAplicativo', 'idEntidad', 'idCliente', 'idEstado', 'idTipoPago', 'idCuenta', 'monto', 'saldo', 'razonTransferencia', "
                 + "  'idAdministradorRegistro', 'reverso', 'idAdministradorReverso', 'reversoNota', 'observacionRegistro', 'idTransaccionReverso', 'fecha_registro', "
                 + "  'fecha_reverso', 'idTransaccionPeticion', 'fecha_servicio', 'opcional') " 
                 + "   values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); "
    
}


		   
		   
		  
        
       
       