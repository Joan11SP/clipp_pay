const report = require('../Controllers/c_reporte');
const transaccion = require('../Controllers/c_transaccion');
const {validarDatosEntrada} = require('../Utils/middleware')
const { Router } = require('express')

const router = Router();


// ROUTES OF REPORT
router.post('/report-sucursal', /*validarDatosEntrada,*/ report.all_reporte);
router.post('/report-transaccion', report.reporte_transacciones);
router.post('/datos-filtros', report.get_datos_filtro_reporte);

// ROUTES OF TRANSACTION
router.post('/consultarSaldo', transaccion.consultarSaldo);
router.post('/registro_pago', transaccion.registrarPago);

module.exports = router;

