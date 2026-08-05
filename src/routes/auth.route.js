const express = require('express')
const authControllers = require('../controllers/auth.controllers')

const router = express.Router()

//register api
router.post("/register" , authControllers.registerUser)

router.get("/test" , (req , res) => {
    console.log("cookies:", req.cookies);
    res.json({
        message:"Test route",
        cookies: req.cookies
    })
})


module.exports = router;