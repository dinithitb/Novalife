const router = require('express').Router();
const ctrl = require('../controllers/transfers.controller');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);

router.post('/:id/approve', ctrl.approve);
router.post('/:id/ship', ctrl.ship);
router.post('/:id/complete', ctrl.complete);
router.post('/:id/cancel', ctrl.cancel);

module.exports = router;
