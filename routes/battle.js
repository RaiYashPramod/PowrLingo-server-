const router = require("express").Router()

const controller = require('../controller/battleground')

router.post('/create', controller.create)
router.post('/join/:id', controller.join)

module.exports = router