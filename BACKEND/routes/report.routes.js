const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');

/**
 * Generar PDF A4 dinámico de una respuesta
 */
router.get(
  '/responses/:responseId/pdf',
  reportController.generateResponsePdf
);

module.exports = router;
