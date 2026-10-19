const router = require('express').Router();
const requireRole = require('../middlewares/requireRole');
const ctrl = require('../controllers/branches.controller');

router.get('/', ctrl.list);
router.post('/', requireRole('admin'), ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', requireRole('admin'), ctrl.update);
router.delete('/:id', requireRole('admin'), ctrl.remove);

module.exports = router;
