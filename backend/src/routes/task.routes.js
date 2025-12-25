const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const taskController = require('../controllers/task.controller');

// Update task status only
router.patch('/tasks/:taskId/status', auth, taskController.updateTaskStatus);

// Update full task
router.put('/tasks/:taskId', auth, taskController.updateTask);

module.exports = router;