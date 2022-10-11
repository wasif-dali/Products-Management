const userModel= require("../Model/userModel")
const bcrypt = require('bcrypt');
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

module.exports={
    createUser

}