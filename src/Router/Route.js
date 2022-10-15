const express = require("express");
const router= express.Router()
const {createUser,userLogin,getprofile,updateProfile}= require('../controller/userController')
const {auth} =require('../middleware/auth')
const{getById,getDataByQuery,deleteProduct,addProduct,updateData}=require('../controller/productController')

router.get('/test-me',function(req,res){
    res.send({msg : "done"})
})

router.post('/register',createUser)
router.post('/login',userLogin)
router.get('/user/:userId/profile',auth,getprofile)
router.put('/user/:userId/profile',auth,updateProfile)

//===================================product API ========================= //

router.post('/products',addProduct)
router.get('/products',getDataByQuery)
router.get('/products/:productId',getById)
router.put('/products/:productId',updateData)
router.delete('/products/:productId',deleteProduct)


















module.exports=router