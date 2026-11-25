const express = require('express');
const router = express.Router();

const serviceCatalogController = require('../controllers/serviceCatalog.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

/**
 * Crear servicio (ADMIN)
 */
router.post(
  '/services',
  authMiddleware,
  adminMiddleware,
  serviceCatalogController.createServiceCatalog
);

/**
 * Obtener catálogo de servicios
 */
router.get(
  '/services',
  authMiddleware,
  serviceCatalogController.getServicesCatalog
);

/**
 * Obtener servicio con formularios
 */
router.get(
  '/services/:id',
  authMiddleware,
  serviceCatalogController.getServiceCatalogById
);

/**
 * Eliminar servicio (ADMIN)
 */
router.delete(
  '/services/:id',
  authMiddleware,
  adminMiddleware,
  serviceCatalogController.deleteServiceCatalog
);

module.exports = router;
