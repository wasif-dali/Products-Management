const userModel= require("../Model/userModel")
const bcrypt = require('bcrypt');
const validation = require("../validation/validate")
// const saltRounds = 10;

const createUser = async function(req,res){
    try{
        let data =req.body
        if(!Object.keys(data)<0) return res.status(400).send({status : false , msg:"need to input some data"})
        let {fname,lname,email,profileImage,phone,password,address}=data

        if(!validation.isValidElem(fname)) return res.status(400).send({status : false , msg:"fname is required"})
        if(!validation.isValidElem(lname)) return res.status(400).send({status : false , msg:"lname is required"})
        if(!validation.isValidName(fname)) return res.status(400).send({status : false , msg:"fname should be in valid format"})
        if(!validation.isValidName(lname)) return res.status(400).send({status : false , msg:"lname should be in valid format"})

        if(!validation.isValidElem(email)) return res.status(400).send({status : false , msg:"email is required"})
        if(!validation.isValidEmail(email)) return res.status(400).send({status : false , msg:"email should be in valid format"})
        let checkemail = await userModel.findOne({email:email})
        if(checkemail){
            return res.status(400).send({status : false , msg:"email already present it should "})
        }



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
        if(!validation.isValidreqBody(loginData)){
            return res.status(400).send({status:false,message:"Invalid request,please Enter EmailId and password"})
        }
        //-----------------------------email validation--------------------------------------------
        if(!email) return res.status(400).send({status:false,message:"please Enter Email"})
        if(!validation.isValidEmail(email)) return res.status(400).send({satus:false,message:"Please enter a valid email"})
        if(!validation.isValidElem(email)) return res.status(400).send({status:false,message:"email Id is required"})


        //------------------------------password validation------------------------------------------



        if(!password) return res.status(400).send({status:false,message:"Please Enter Password"})
        if(!validation.isValidElem) return res.status(400).send({status:false,message:"password is required"})
  

 
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