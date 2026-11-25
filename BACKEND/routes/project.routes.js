const express = require('express');
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/project.controller');

const router = express.Router();
router.use(auth);

router.post('/projects', controller.createProject);
router.get('/projects', controller.getProjects);
router.get('/projects/:id/members', controller.getProjectMembers);
router.post('/projects/:id/members', controller.addProjectMember);
router.delete('/projects/:id/members/:userId', controller.removeProjectMember);
router.get('/projects/:id', controller.getProjectById);
router.put('/projects/:id', controller.updateProject);
router.delete('/projects/:id', controller.deleteProject);

module.exports = router;
