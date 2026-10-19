const router = require('express').Router();
const ctrl = require('../controllers/units.controller');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/status', ctrl.updateStatus);

module.exports = router;
