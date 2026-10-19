const router = require('express').Router();
const ctrl = require('../controllers/requests.controller');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);

router.post('/:id/approve', ctrl.approve);
router.post('/:id/reject', ctrl.reject);
router.post('/:id/fulfill', ctrl.fulfill);

module.exports = router;
