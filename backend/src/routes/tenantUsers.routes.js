const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/user.controller');

router.post('/:tenantId/users', auth, controller.addUserToTenant);
router.get('/:tenantId/users', auth, controller.listTenantUsers);

module.exports = router;