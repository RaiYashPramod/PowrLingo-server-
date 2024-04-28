const router = require("express").Router()

const controller = require('../controller/battleground')

router.get('/getbattle/:id', controller.getBattle)
router.post('/create', controller.create)
router.post('/join/:id', controller.join)
router.get('/ongoingbattle', controller.onGoingBattle)
router.post('/changeturn/:id', controller.changeTurn)
router.get('/fetchQuestions/:id', controller.fetchQuestions)

module.exports = router