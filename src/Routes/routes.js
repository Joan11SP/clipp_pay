const report = require('../Controllers/c_reporte');
const { Router } = require('express')

const router = Router();


// ROUTES OF REPORT
router.post('/all_report', report.all_reporte);



module.exports = router;

