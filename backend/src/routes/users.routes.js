const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/user.controller');

// API 10 – Update user
router.put('/:userId', auth, controller.updateUser);

// API 11 – Delete user
router.delete('/:userId', auth, controller.deleteUser);

module.exports = router;