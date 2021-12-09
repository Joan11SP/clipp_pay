const report = require('../Controllers/c_reporte');
const transaccion = require('../Controllers/c_transaccion');
const {validarDatosEntrada, validarTransaccion} = require('../Utils/middleware')
const { Router } = require('express')

const router = Router();


// ROUTES OF REPORT
router.post('/report-sucursal', /*validarDatosEntrada,*/ report.all_reporte);
router.post('/report-transaccion', report.reporte_transacciones);
router.post('/datos-filtros', report.get_datos_filtro_reporte);

// ROUTES OF TRANSACTION
router.post('/consultarSaldo', validarTransaccion, transaccion.consultarSaldo);
router.post('/registro_pago', validarTransaccion, transaccion.registrarPago);
router.post('/listar-car', validarTransaccion, transaccion.listarTarjetas)

module.exports = router;

