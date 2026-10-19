const router = require('express').Router();
const c = require('../controllers/audit.controller');
const requireRole = require('../middlewares/requireRole');

router.get('/', requireRole('admin', 'auditor'), c.list);

module.exports = router;
