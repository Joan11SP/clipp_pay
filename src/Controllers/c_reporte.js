const report  = require("../Queries/q_reportes");


const all_reporte = async (req,res) => {

    var { fecha_inicio, fecha_fin, id_sucursal } = req.body

    if(fecha_fin == null || fecha_fin == null || id_sucursal == -1){

        fecha_inicio = '1900-01-01 00:00:00'
        fecha_fin = '1900-01-01 23:59:59'
    }
    var filtro = {fecha_fin,fecha_inicio,id_sucursal }
    try {
        var mensaje,ok;
        var res_report = await report.allReporte(filtro);
        if(res_report._results.length>0){
            mensaje = 'Resultados encontrados'; ok = 1;
        }
        else
            mensaje = 'No se encontró ningun resultado'; ok = 0;
        res.json({mensaje,ok,resultados:res_report._results})
    } catch (err) {
        res.json({ok:0,mensaje:err})
    }

}

module.exports = {
    all_reporte
}