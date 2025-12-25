module.exports.requireSameTenant = (tenantIdParam = 'tenantId') => {
  return (req, res, next) => {
    if (req.user.role === 'super_admin') return next();

    if (req.user.tenantId !== req.params[tenantIdParam]) {
      return res.status(403).json({ success: false, message: 'Tenant access denied' });
    }
    next();
  };
};
