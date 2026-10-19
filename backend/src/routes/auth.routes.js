const router = require('express').Router();
const { register, login, me } = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

router.post('/login', login);
router.post('/register', auth, requireRole('admin'), register);
router.get('/me', auth, me);

module.exports = router;
