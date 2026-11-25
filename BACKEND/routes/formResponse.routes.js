const express = require('express');
const router = express.Router();

const formResponseController = require('../controllers/formResponse.controller');

/**
 * Crear respuesta de formulario
 */
router.post(
  '/forms/:formId/responses',
  formResponseController.createResponse
);

/**
 * Obtener respuestas de formulario
 */
router.get(
  '/forms/:formId/responses',
  formResponseController.getResponsesByForm
);

/**
 * Obtener respuesta específica
 */
router.get(
  '/responses/:id',
  formResponseController.getResponseById
);

/**
 * Eliminar respuesta
 */
router.delete(
  '/responses/:id',
  formResponseController.deleteResponse
);

/**
 * Actualizar respuesta
 */
router.put(
  '/responses/:id',
  formResponseController.updateResponse
);

module.exports = router;
