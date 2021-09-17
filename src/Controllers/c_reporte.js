const config = require("../config"),
      report  = require("../Queries/q_reportes"),
      fun = require('../Utils/funciones');

const all_reporte = async (req,res) => {

    var { tipo_tran, admin,id_entidad,fecha_inicio, fecha_fin,id_icono } = req.body;

    tipo_tran = tipo_tran == null ? -1 : tipo_tran;
    admin = admin == null ? -1 : admin;
    id_entidad = id_entidad == null ? -1 : id_entidad;
    fecha_inicio = fecha_inicio == null ? -1 : fecha_inicio;
    fecha_fin = fecha_fin == null ? -1 : fecha_fin;
    id_icono = id_icono == null ? -1 : id_icono;

    let filtro = { tipo_tran, admin,id_entidad,fecha_inicio, fecha_fin,id_icono };
    try {
        var mensaje,ok,resultados;
        var res_report = await report.allReporte(filtro);
        if(res_report.reporte.length>0){
            mensaje = 'Resultados encontrados'; 
            ok = 1;
        }
        else
            mensaje = 'No se encontró ningun resultado'; ok = 0;
        res.json(
            {mensaje,ok,resultados:res_report}
        )
    } catch (err) {
        fun.enviarError(res);
    }

}


const reporte_transacciones = async (req,res) => {

    var { tipo_tran, admin,id_entidad,fecha_inicio, fecha_fin,id_icono } = req.body;

    tipo_tran = tipo_tran == null ? -1 : tipo_tran;
    admin = admin == null ? -1 : admin;
    id_entidad = id_entidad == null ? -1 : id_entidad;
    fecha_inicio = fecha_inicio == null ? -1 : fecha_inicio;
    fecha_fin = fecha_fin == null ? -1 : fecha_fin;
    id_icono = id_icono == null ? -1 : id_icono;

    let filtro = { tipo_tran, admin,id_entidad,fecha_inicio, fecha_fin,id_icono };
    try {
        
        const resp = await report.report_transaccion(filtro);
        fun.enviarRespuesta(res, config.success,"",resp,null);

    } catch (error) {
        fun.enviarError(res);
    }
}

const get_datos_filtro_reporte = async (req,res) => {

    try {
        
        const filtros = await report.datos_filtro();

        let resp = {
            iconos: filtros.icono,
            entidades: filtros.entidad,
            tipos_tran: filtros.tipo_tran,
            admin: filtros.admins
        };

        fun.enviarRespuesta(res, config.success,"",resp,null);

    } catch (error) {
        fun.enviarError(res);
    }
} 

module.exports = {
    all_reporte,
    reporte_transacciones,
    get_datos_filtro_reporte
}