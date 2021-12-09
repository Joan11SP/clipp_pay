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
                + "create function " + BD + ".val_user(ced_cel varchar(20)) "
                + "RETURNS int "
                + "DETERMINISTIC "
                + "BEGIN "
                + "    set @id_cliente=-1, @id=-1; "
                + "    select idCliente into @id_cliente from " + BD + ".cliente where cedula = ced_cel or celular = ced_cel;"
                + "    if @id_cliente = -1 then"
                + "            select idCliente into @id_cliente from " + db_name + ".cliente where cedula = ced_cel or celular = ced_cel;"
                + "            if @id_cliente <> -1 then"
                + "                select max(idCliente+1) into @id from " + BD + ".cliente;"
                + "                insert into " + BD + ".cliente select @id, nombres, apellidos, cedula, celular, correo,now() from " + db_name + ".cliente where cedula = ced_cel or celular = ced_cel;"
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
                 + "   values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); ",
    sql_update_cliente_pay :"UPDATE " + BD + ".cliente SET nombres = ?, apellidos = ?, correo = ?, celular = ? WHERE idCliente = ?;",
    sql_update_cliente_pay_cedula : "UPDATE " + BD + ".cliente SET nombres = ?, apellidos = ?, correo = ?, cedula = ? WHERE idCliente = ?;",
    sql_buscar_cliente_clipp_pay_cedula : "SELECT idCliente FROM " + BD + ".cliente WHERE cedula = ?;",
    sql_registrar_token : "INSERT INTO " + db_name + ".clienteToken ('idCliente', 'token') VALUES (?, ?);",
    sql_obtener_correo_cliente: "SELECT correo FROM " + db_name + ".cliente WHERE idCliente = ? LIMIT 1;",
    sql_consultar_saldo_cedula: "SELECT IFNULL(sr.razon,'') AS razon, IFNULL(saldo,0) AS saldo, cli.idCliente, cli.nombres, cli.apellidos, IFNULL(cli.cedula,'') AS cedula, cli.correo, cli.celular FROM " + db_name + ".cliente cli LEFT JOIN " + db_name + ".saldo s ON cli.idCliente = s.idCliente  LEFT JOIN " + db_name + ".saldoRazon sr ON sr.idSaldoRazon = s.idSaldoRazon AND sr.idSaldoRazon = 1 WHERE cli.idAplicativo = ? AND cli.cedula = ? LIMIT 1;",
    sql_insertar_cliente_clipp_pay: "insert into " + BD + ".cliente (nombres, apellidos, cedula, correo, celular) values (?, ?, ?, ?, ?) ",
    sql_update_cliente_clipp_pay_cedula: "update " + BD + ".cliente SET nombres = ?, apellidos = ?, correo = ?, cedula = ? WHERE idCliente = ?;",
    sql_buscar_cliente_clipp_pay_celular: "select idCliente FROM " + BD + ".cliente where celular = ?;",
    sql_obtener_codigo_pais_cliente: "select concat(codigoPais,SUBSTRING(celular, 2)) as phone from " + db_name + ".cliente where idCliente = ? LIMIT 1;",
    sql_obtener_car_cliente: "select tbl.cardHolder, tbl.tipoEntidad, (AES_DECRYPT('cn'.'op', ?)) AS 'op', (AES_DECRYPT('cn'.'sum', ?)) AS 'sum', (AES_DECRYPT('cn'.'mul', ?)) AS 'mul', (AES_DECRYPT('cn'.'div',?)) AS 'div', 'tbl'.'number', (AES_DECRYPT('tbl'.'verificationCode',?)) AS 'verificationCode', (AES_DECRYPT('tbl'.'cardToken',?)) AS 'cardToken' FROM " + db_name + "describ.con cn INNER JOIN " + db_name + "_encrip.tabl tbl ON cn.tks = tbl.tks AND cn.con = tbl.con WHERE cn.tks = ? AND cn.con = ? LIMIT 1;",
    sql_verifi_auth_admin: "SELECT fecha_inicio FROM " + db_name + ".administradorSessionPush WHERE idAdministrador = ? AND  idPlataforma = ? AND imei = ?  AND auth = MD5(CONCAT(?, 'JpKradacTounk')) AND activado = 1 LIMIT 1;",
    sql_registrar_transaccion: "INSERT INTO " + db_name + "_encrip.transaction (idCliente, ip, con, number, amount, amountWithTax, amountWithoutTax, tax, service, tip, optional, email, phoneNumber, type, opcional) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
    sql_consultar_saldo: "SELECT sr.razon, s.saldo FROM  " + db_name + ".saldo s INNER JOIN  " + db_name + ".saldoRazon sr ON sr.idSaldoRazon = s.idSaldoRazon WHERE idAdministrador = ?;",
    sql_consultar_saldo_celular: "SELECT IFNULL(sr.razon,'') AS razon, IFNULL(saldo,0) AS saldo, cli.idCliente, cli.nombres, cli.apellidos, IFNULL(cli.cedula,'') AS cedula, cli.correo, cli.celular FROM " + db_name + ".cliente cli LEFT JOIN " + db_name + ".saldo s ON cli.idCliente = s.idCliente  LEFT JOIN " + db_name + ".saldoRazon sr ON sr.idSaldoRazon = s.idSaldoRazon AND sr.idSaldoRazon = 1 WHERE cli.idAplicativo = ? AND (cli.celular = ? OR cli.celular = ? ) AND codigoPais = ? LIMIT 1;",
    ID_SALDO_RAZON_CLIPP: 1,
    ID_TRANSACCION_TIPO_EGRESO : 2,
    AMBIENTE: " AND produccion = 1 LIMIT 1;",
    ID_TRANSACCION_ESTADO_TRANSACCION: 1,
    SQL_REGISTART_TRANSACCION_PAY:"INSERT INTO " + db_name + "_pay.transaccion (idServicioAplicativo, idEntidad, idCliente, idEstado, idTipoPago, idCuenta, saldo, idAdministradorRegistro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    SQL_AUTENTICAR: "SELECT sa.idAplicativo, sa.idServicioAplicativo, sa.idCompania, sa.idAplicativoClipp, sa.servicio, CAST(sa.isHibrido AS UNSIGNED) AS isHibrido, sa.icono FROM clipp_pay.compania acs LEFT JOIN clipp_pay.companiaAccesoIp acsIp ON acs.idCompania = acsIp.idCompania AND acs.restringirPorIp = 1 AND acsIp.ip = ? AND acsIp.permiso = 1 INNER JOIN clipp_pay.servicioAplicativo sa ON sa.idCompania = acs.idCompania WHERE acs.usuario = ? AND acs.contrasenia = MD5(MD5(concat(?, MD5('ApiJpDaptsPagos')))) AND acs.token = ? AND sa.token = ?;"


           
    
}


		   
		   
		  
        
       
       