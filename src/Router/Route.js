const express = require("express");
const router= express.Router()
const {createUser,userLogin,getprofile}= require('../controller/userController')

router.get('/test-me',function(req,res){
    res.send({msg : "done"})
})

router.post('/register',createUser)
router.post('/login',userLogin)
router.get('/user/:userId/profile',getprofile)


















module.exports=router