const router = require('express').Router();

const controller = require('../controller/users');

router.post('/login', controller.login);
router.post('/verify', controller.verify_token);

router.get('/getuser', controller.getuser);
router.patch('/updateProfile', controller.updateProfile);

router.patch('/resetprogress', controller.resetProgress)

router.get('/leaderboard', controller.leaderboard)

module.exports = router;