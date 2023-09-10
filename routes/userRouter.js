const express = require('express');
const router = express.Router();

router.get('/',(req,res) => {

    res.send("home page")
})

module.exports = router