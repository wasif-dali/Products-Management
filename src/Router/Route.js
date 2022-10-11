const express = require("express");
const router= express.Router()
const userController= require('../controller/userController')

router.get('/test-me',function(req,res){
    res.send({msg : "done"})
})

router.post('/register',userController.createUser)

















module.exports=router