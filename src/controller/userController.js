const userModel = require("../Model/userModel")
const mongoose=require("mongoose")
const bcrypt = require('bcrypt');
const validation = require("../validation/validate")
const aws=require("aws-sdk")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })



    })
}

const createUser = async function (req, res) {
    try {
        let data = req.body
        if (!Object.keys(data) < 0) return res.status(400).send({ status: false, msg: "need to input some data" })
        let { fname, lname, email, profileImage, phone, password, address } = data

        if (!validation.isValidElem(fname)) return res.status(400).send({ status: false, msg: "fname is required" })
        if (!validation.isValidElem(lname)) return res.status(400).send({ status: false, msg: "lname is required" })
        if (!validation.isValidName(fname)) return res.status(400).send({ status: false, msg: "fname should be in valid format" })
        if (!validation.isValidName(lname)) return res.status(400).send({ status: false, msg: "lname should be in valid format" })

        if (!validation.isValidElem(email)) return res.status(400).send({ status: false, msg: "email is required" })
        if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, msg: "email should be in valid format" })
        let checkemail = await userModel.findOne({ email: email })
        if (checkemail) {
            return res.status(400).send({ status: false, msg: "email already present it should " })
        }

        // if (!validation.isValidElem(profileImage)) return res.status(400).send({ status: false, msg: "profile image is required" })
        // if (!validation.isValidimage(profileImage)) return res.status(400).send({ status: false, msg: "profile image link is wrong " })

        if (!validation.isValidElem(phone)) return res.status(400).send({ status: false, msg: "phone number is required" })
        if (!validation.isValidmobile(phone)) return res.status(400).send({ status: false, msg: "it should be in 10 digit" })
        let checkphone = await userModel.findOne({ phone: phone })
        if (checkphone) {
            return res.status(400).send({ status: false, msg: "phon number is already present" })
        }

        if (!validation.isValidElem(password)) return res.status(400).send({ status: false, msg: "password is required" })
        if (!validation.isvalidpassword(password)) return res.status(400).send({ status: false, msg: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number: " })

        if (!validation.isValidElem(address)) return res.status(400).send({ status: false, msg: "address is required" })


        // let requiredFields = ["street", "city","pincode"];
        // for (field of requiredFields) {
        //     if (!(req.body.address.shipping.hasOwnProperty(field))) {
        //       return res
        //         .status(400)
        //         .send({ status: false, msg: `this key is not present==>${field}` });
        //     }
        // }

        const requiredFields=["street", "city","pincode"]
        for (field of requiredFields){
            let data= req.body.address.shipping[field]
            if (!validation.isValidElem(data)) return res.status(400).send({ status: false, msg: ` shipping ${field} is required` })
        }
        const required=["street", "city","pincode"]
        for (field of required){
            let data= req.body.address.billing[field]
            if (!validation.isValidElem(data)) return res.status(400).send({ status: false, msg: ` billing ${field} is required` })
        }

        const salting = await bcrypt.genSalt(10)
        const newpassword = await bcrypt.hash(password, salting)
        console.log(newpassword)




        let document = {
            fname: fname,
            lname: lname,
            email: email,
            profileImage: profileImage,
            phone: phone,
            password: newpassword,
            address: {
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
        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            document.profileImage = uploadedFileURL

            if (!validation.isValidElem(profileImage)) return res.status(400).send({ status: false, msg: "profile image is required" })
            if (!validation.isValidimage(profileImage)) return res.status(400).send({ status: false, msg: "profile image link is wrong " })
        }
        else {
            return res.status(400).send({ status: false, message: "no image present" })
        }
        
        let saveData = await userModel.create(document)
        console.log(document)
        return res.status(201).send({
            "status": true,
            "message": "User created successfully",
            "data": saveData
      })
        

    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}
const userLogin = async (req, res) => {

    try {
        const loginData = req.body
        const { email, password } = loginData
        if (!validation.isValidreqBody(loginData)) {
            return res.status(400).send({ status: false, message: "Invalid request,please Enter EmailId and password" })
        }
        //-----------------------------email validation--------------------------------------------
        if (!email) return res.status(400).send({ status: false, message: "please Enter Email" })
        if (!validation.isValidEmail(email)) return res.status(400).send({ satus: false, message: "Please enter a valid email" })
        if (!validation.isValidElem(email)) return res.status(400).send({ status: false, message: "email Id is required" })


        //------------------------------password validation------------------------------------------



        if (!password) return res.status(400).send({ status: false, message: "Please Enter Password" })
        if (!validation.isValidElem) return res.status(400).send({ status: false, message: "password is required" })




        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(401).send({ status: false, message: "Invalid Credential" })
        let MatchUser = await bcrypt.compare(password, user.password)
        if (!MatchUser) return res.status(401).send({ status: false, message: "password does not match" })


        let token = jwt.sign({ userId: user._id.toString(), iat: Math.floor(Date.now() / 1000) },
            "Project5-ProductManagement",
            { expiresIn: '24h' });
        res.setHeader("Authorization", token)
        res.status(200).send({ status: true, message: "User Login Succesful", data: { userId: user._id, token: token } })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const getprofile = async function(req,res){
    let profileId= req.params.userId
    if(!profileId) return res.status(400).send({ status: false, message: "userId is required in path par" })
    if(!mongoose.isValidObjectId(profileId)) return res.status(403).send({status:false,message:"Invalid ProfileId"})
    if(req.token !=profileId) return res.status(403).send({status:false,message:"Unauthorized"})

    let findProfile= await userModel.findById(profileId)
    if(!findProfile){
        return res.status(404).send({status: false,message: "User profile details Not found"})
    }
   
    return res.status(200).send({status: true,message: "User profile details",data:findProfile})
} 


module.exports = {
    createUser, userLogin,getprofile

}