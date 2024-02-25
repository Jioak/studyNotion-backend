

const express = require("express")
const router = express.Router()

const {contactUs} = require('../controllers/contactus')

router.post("/contact", contactUs)

module.exports = router