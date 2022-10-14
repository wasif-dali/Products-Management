const express = require("express");
const router= express.Router()
const {createUser,userLogin,getprofile,updateProfile}= require('../controller/userController')
const{addProduct}=require("../controller/productController")
const {auth} =require('../middleware/auth')

router.get('/test-me',function(req,res){
    res.send({msg : "done"})
})

router.post('/register',createUser)
router.post('/login',userLogin)
router.get('/user/:userId/profile',auth,getprofile)
router.put('/user/:userId/profile',auth,updateProfile)

//---------------------------------------------Product API-------------------------------------------------
router.post("/products",addProduct)

















module.exports=router