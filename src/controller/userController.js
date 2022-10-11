const userModel= require("../Model/userModel")
const bcrypt = require('bcrypt');
const jwt=require("jsonwebtoken")
// const saltRounds = 10;

const createUser = async function(req,res){
    try{
        let data =req.body
        console.log(data)
        let {fname,lname,email,profileImage,phone,password,address}=data

        const salting = await bcrypt.genSalt(10)
        const newpassword = await bcrypt.hash(password,salting)
        console.log(newpassword)



        let document = {
            fname:fname,
            lname:lname,
            email:email,
            profileImage:profileImage,
            phone:phone,
            password:newpassword,
            address:{
                shipping: {
                    street: address.shipping.street,
                    city: address.shipping.city,
                    pincode: address.shipping.pincode
                },
                billing: {
                    street: address.billing.street,
                    city: address.billing.city,
                    pincode: address.billing.pincode
                }
            }
        }
        console.log(document)





        
        let saveData = await userModel.create(document)
        console.log(document)
      
        return res.status(201).send({
            "status": true,
            "message": "User created successfully",
            "data":document})

    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message
          })
    }
}
const userLogin= async (req,res)=>{

    try{
        const loginData=req.body
        const {email,password}=loginData
        const user=await userModel.findOne({email:email})
        if(!user) return res.status(401).send({status:false,message:"Invalid Credential"})
        let MatchUser= await bcrypt.compare(password,user.password)
        if(!MatchUser) return res.status(401).send({status:false,message:"password does not match"})


        let token =jwt.sign({userId:user._id.toString(),iat:Math.floor(Date.now()/1000)},
        "Project5-ProductManagement",
        { expiresIn:'24h'});
        res.setHeader("Authorization",token)
        res.status(200).send({status:true,message:"User Login Succesful",data:{userId:user._id,token:token}})
    }
catch(error){
    res.status(500).send({status:false,message:error.message})
}
}

module.exports={
    createUser,userLogin

}