const router = require('express').Router();
const c = require('../controllers/users.controller');
const requireRole = require('../middlewares/requireRole');

const adminOnly = requireRole('admin');
const adminOrManager = requireRole('admin', 'branch-manager');

router.get('/',            adminOrManager, c.list);
router.get('/:id',         adminOrManager, c.get);
router.post('/',           adminOnly,      c.create);
router.put('/:id',         adminOnly,      c.update);
router.patch('/:id/deactivate', adminOnly, c.deactivate);
router.post('/:id/deactivate',  adminOnly, c.deactivate);
router.patch('/:id/activate',   adminOnly, c.activate);
router.post('/:id/activate',    adminOnly, c.activate);

module.exports = router;
