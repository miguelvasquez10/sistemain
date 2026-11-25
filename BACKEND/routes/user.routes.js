const express = require('express');
const controller = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

const router = express.Router();

// Auth
router.post('/register', controller.register);
router.post('/login', controller.login);

// CRUD básico
router.get('/', controller.getUsers);
router.get('/:id', controller.getUserById);
router.patch('/:id/disable', controller.disableUser);
router.get('/me', auth, controller.getUserById);

module.exports = router;
