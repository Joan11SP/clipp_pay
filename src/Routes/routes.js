const report = require('../Controllers/c_reporte');
const {validarDatosEntrada} = require('../Utils/middleware')
const { Router } = require('express')

const router = Router();


// ROUTES OF REPORT
router.post('/all_report', validarDatosEntrada, report.all_reporte);



module.exports = router;

