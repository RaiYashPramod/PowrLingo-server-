const router = require("express").Router()

const controller = require('../controller/battleground')

router.get('/getbattle/:id', controller.getBattle)
router.post('/create', controller.create)
router.post('/join/:id', controller.join)
router.get('/ongoingbattle', controller.onGoingBattle)

module.exports = router