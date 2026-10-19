const router = require('express').Router();
const c = require('../controllers/reports.controller');

router.get('/inventory',  c.inventory);
router.get('/donations',  c.donations);
router.get('/requests',   c.requests);
router.get('/transfers',  c.transfers);
router.get('/branches',   c.branches);

module.exports = router;
