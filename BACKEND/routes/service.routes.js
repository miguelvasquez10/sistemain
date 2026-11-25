const express = require('express');
const router = express.Router();

const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Agregar servicio a un proyecto
 */
router.post(
  '/projects/:projectId/services',
  authMiddleware,
  serviceController.addServiceToProject
);

/**
 * Obtener servicios de un proyecto
 */
router.get(
  '/projects/:projectId/services',
  authMiddleware,
  serviceController.getProjectServices
);

/**
 * Eliminar servicio de un proyecto
 */
router.delete(
  '/projects/services/:id',
  authMiddleware,
  serviceController.removeServiceFromProject
);

module.exports = router;