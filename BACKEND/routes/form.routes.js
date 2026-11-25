const express = require('express');
const router = express.Router();

const formController = require('../controllers/form.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const adminMiddleware = require('../middlewares/admin.middleware');

/**
 * Crear formulario (SOLO ADMIN)
 */
router.post(
  '/services/:serviceId/forms',
  authMiddleware,
  adminMiddleware,
  formController.createForm
);

/**
 * Obtener formularios de un servicio
 * (usuarios pueden verlos)
 */
router.get(
  '/services/:serviceId/forms',
  formController.getFormsByService
);

/**
 * Obtener formulario con campos
 */
router.get(
  '/forms/:id',
  formController.getFormById
);

/**
 * Eliminar formulario (SOLO ADMIN)
 */
router.delete(
  '/forms/:id',
  authMiddleware,
  adminMiddleware,
  formController.deleteForm
);

module.exports = router;
