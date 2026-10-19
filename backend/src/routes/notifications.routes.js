const router = require('express').Router();
const ctrl = require('../controllers/notifications.controller');

router.get('/', ctrl.list);
router.post('/:id/read', ctrl.markRead);

module.exports = router;
