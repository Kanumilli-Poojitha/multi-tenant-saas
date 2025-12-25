const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const taskController = require('../controllers/task.controller');

// Create task under project
router.post('/projects/:projectId/tasks', auth, taskController.createTask);

// List tasks of a project
router.get('/projects/:projectId/tasks', auth, taskController.listProjectTasks);

module.exports = router;