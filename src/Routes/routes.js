const report = require('../Controllers/c_reporte');
const {validarDatosEntrada} = require('../Utils/middleware')
const { Router } = require('express')

const router = Router();


// ROUTES OF REPORT
router.post('/report-sucursal', /*validarDatosEntrada,*/ report.all_reporte);
router.post('/report-transaccion', report.reporte_transacciones);
router.post('/datos-filtros', report.get_datos_filtro_reporte);

// ROUTES OF BUY
router.post('/realizar-pago', validarDatosEntrada, report.get_datos_filtro_reporte);

module.exports = router;

