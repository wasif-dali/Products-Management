const express = require("express");
const router= express.Router()
const {createUser,userLogin}= require('../controller/userController')

router.get('/test-me',function(req,res){
    res.send({msg : "done"})
})

<<<<<<< HEAD
router.post('/register',userController.createUser)
router.get('/user',userController.userProfile)
=======
router.post('/register',createUser)
router.post('/login',userLogin)
>>>>>>> f39289bbdda6ac59595c33b8fd4eee2a01873e6f

















module.exports=router