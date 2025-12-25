const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/project.controller');

// Create project
router.post('/', auth, controller.createProject);

// List projects
router.get('/', auth, controller.listProjects);

// Update project
router.put('/:projectId', auth, controller.updateProject);

// Delete project
router.delete('/:projectId', auth, controller.deleteProject);

module.exports = router;