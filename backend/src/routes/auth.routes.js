const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/auth.controller');

router.post(
  '/register-tenant',
  body('tenantName').notEmpty(),
  body('subdomain').notEmpty(),
  body('adminEmail').isEmail(),
  body('adminPassword').isLength({ min: 8 }),
  body('adminFullName').notEmpty(),
  validate,
  controller.registerTenant
);

router.post('/login', controller.login);
router.get('/me', auth, controller.me);
router.post('/logout', auth, controller.logout);

module.exports = router;
