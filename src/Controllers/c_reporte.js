const config = require("../config"),
      report  = require("../Queries/q_reportes"),
      fun = require('../Utils/funciones');

const all_reporte = async (req,res) => {

    let filtro = validar_datos(req.body);
    
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

    
    let filtro = validar_datos(req.body);
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

const validar_datos = (datos) => {

    datos.tipo_tran = datos.tipo_tran == null ? -1 : datos.tipo_tran;
    datos.admin = datos.admin == null ? -1 : datos.admin;
    datos.id_entidad = datos.id_entidad == null ? -1 : datos.id_entidad;
    datos.fecha_inicio = datos.fecha_inicio == null ? -1 : datos.fecha_inicio;
    datos.fecha_fin = datos.fecha_fin == null ? -1 : datos.fecha_fin;
    datos.id_icono = datos.id_icono == null ? -1 : datos.id_icono;

    return datos;
}

module.exports = {
    all_reporte,
    reporte_transacciones,
    get_datos_filtro_reporte
}