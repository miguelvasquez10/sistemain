const express = require('express');
const router = express.Router();

const formFieldController = require('../controllers/formField.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const adminMiddleware = require('../middlewares/admin.middleware');

/**
 * Crear campo (SOLO ADMIN)
 */
router.post(
  '/forms/:formId/fields',
  authMiddleware,
  adminMiddleware,
  formFieldController.createField
);

/**
 * Obtener campos
 */
router.get(
  '/forms/:formId/fields',
  formFieldController.getFieldsByForm
);

/**
 * Actualizar campo (SOLO ADMIN)
 */
router.put(
  '/fields/:id',
  authMiddleware,
  adminMiddleware,
  formFieldController.updateField
);

/**
 * Eliminar campo (SOLO ADMIN)
 */
router.delete(
  '/fields/:id',
  authMiddleware,
  adminMiddleware,
  formFieldController.deleteField
);

module.exports = router;
