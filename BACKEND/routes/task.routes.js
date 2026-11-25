const express = require('express');
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/task.controller');

const router = express.Router();
router.use(auth);

router.get('/projects/:projectId/tasks', controller.getTasks);
router.post('/projects/:projectId/tasks', controller.createTask);
router.put('/projects/:projectId/tasks/:taskId', controller.updateTask);
router.delete('/projects/:projectId/tasks/:taskId', controller.deleteTask);

module.exports = router;
