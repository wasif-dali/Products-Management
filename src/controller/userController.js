const userModel = require("../Model/userModel")
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const validation = require("../validation/validate")
const aws = require("aws-sdk")
const jwt = require('jsonwebtoken')


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
        }

        document.address = JSON.parse(req.body.address)
        console.log(document.address)
        console.log(document)

        const requiredFields = ["street", "city", "pincode"]
        for (field of requiredFields) {
            let data = document.address.shipping[field]
            if (!validation.isValidElem(data)) return res.status(400).send({ status: false, msg: ` shipping ${field} is required` })
        }
        const required = ["street", "city", "pincode"]
        for (field of required) {
            let data = document.address.billing[field]
            if (!validation.isValidElem(data)) return res.status(400).send({ status: false, msg: ` billing ${field} is required` })
        }
        console.log(document)
        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            document.profileImage = uploadedFileURL

            // if (!validation.isValidElem(profileImage)) return res.status(400).send({ status: false, msg: "profile image is required" })
            // if (!validation.isValidimage(profileImage)) return res.status(400).send({ status: false, msg: "profile image link is wrong " })
        }
        else {
            return res.status(400).send({ status: false, message: "no image present" })
        }
        console.log(document)
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
        res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const getprofile = async function (req, res) {
    let profileId = req.params.userId
    if (!profileId) return res.status(400).send({ status: false, message: "userId is required in path par" })
    if (!mongoose.isValidObjectId(profileId)) return res.status(403).send({ status: false, message: "Invalid ProfileId" })
    if (req.token.userId != profileId) return res.status(403).send({ status: false, message: "Unauthorized" })

    let findProfile = await userModel.findById(profileId)
    if (!findProfile) {
        return res.status(404).send({ status: false, message: "User profile details Not found" })
    }

    return res.status(200).send({ status: true, message: "User profile details", data: findProfile })
}


const updateProfile = async function (req, res) {
    try {
        let data = req.body;
        let userId = req.params.userId;
        let files = req.files;
        let userIdfromtoken = req.token.userId

        //console.log("hello")

        // let userProfile=await userModel.findById(userId)
        if (!validation.isValidElem(userId)) {
            return res.status(400).send({ status: false, message: "userId is not given" });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is Invalid" });
        }

        const findUserId = await userModel.findById(userId);
        if (!findUserId)
            return res.status(404).send({ status: false, message: "NO DATA FOUND" });
        if (userIdfromtoken != userId) {
            return res.status(403).send({ status: false, message: "YOU ARE NOT AUTHORIZED" });
        }


        // check request body is valid
        if (!(validation.isValidreqBody(data) || files)) {
            return res.status(400).send({ status: false, message: "Enter a valid details" });
        }

        let { fname, lname, email, password, phone, address } = data;
        let updateData = {};

        if (fname) {
            if (!validation.isValidElem(fname)) { return res.status(400).send({ status: false, message: "fname is missing." }); }

            updateData.fname = fname;
        }

        if (lname) {
            if (!validation.isValidElem(lname)) { return res.status(400).send({ status: false, message: "lname is missing." }); }

            updateData.lname = lname;
        }
        if (email) {
            email = email.toLowerCase()
            if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, message: "enter valid email" })
            let emailCheck = await userModel.findOne({ email: email })
            if (emailCheck) return res.status(409).send({ status: false, message: "email already used" })

            updateData.email = email;
        }

        if (phone) {
            if (!validation.isValidElem(phone)) return res.status(400).send({ status: false, message: "Enter a valid phone number" })
            if (!validation.isValidmobile(phone)) return res.status(400).send({ status: false, message: "phone No is invalid. +91 is not required" })
            let checkMobile = await userModel.findOne({ phone })
            if (checkMobile) return res.status(409).send({ status: false, message: "Phone Number is already used" })
            updateData.phone = phone;
        }



        if (password) {
            if (!validation.isValidElem(password)) { return res.status(400).send({ status: false, message: "password is invalid" }); }
            if (!validation.isvalidpassword(password)) { return res.status(400).send({ status: false, message: "please enter a valid password between 8 to 15 digit" }) }
            updateData.password = await bcrypt.hash(password, 10);

        }



        if (data.profileImage) {
            if (typeof data.profileImage === "string") {
                return res.status(400).send({ Status: false, message: "Please upload the image" })
            }
        }
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])

            updateData.profileImage = uploadedFileURL
        }
        if (address) {
            if (typeof address === "string") { address = JSON.parse(address) }
            if (!validation.isValidreqBody(address)) return res.status(400).send({ status: false, message: "address is required" })


            if (address.shipping) {
                if (!validation.isValidreqBody(address.shipping)) return res.status(400).send({ status: false, message: "billing address is required" })
                if (address.shipping.street) {
                    if (!validation.isValidElem(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: "street is required in billing address!" });
                    }
                    updateData['address.shipping.street'] = address.shipping.street;
                }

                if (address.shipping.city) {
                    if (!validation.isValidElem(address.shipping.city)) return res.status(400).send({ status: false, message: "city is required in billing address!" });
                    updateData['address.shipping.city'] = address.shipping.city;
                }

                if (address.shipping.pincode) {
                    let pinCode = parseInt(address.shipping.pincode)
                    if (!validation.PinCode(pinCode)) return res.status(400).send({ status: false, message: "provide a valid pincode." })
                    updateData['address.shipping.pincode'] = pinCode;
                }
            }

            if (address.billing) {
                if (!validation.isValidreqBody(address.billing)) return res.status(400).send({ status: false, message: "shipping address is required" })


                if (address.billing.street) {
                    if (!validation.isValidElem(address.billing.street)) {
                        return res.status(400).send({ status: false, message: "street is required in shipping address!" });
                    }
                    updateData['address.billing.street'] = address.billing.street;
                }

                if (address.billing.city) {
                    if (!validation.isValidElem(address.billing.city)) {
                        return res.status(400).send({ status: false, message: "city is required in shipping address!" });
                    }
                    updateData['address.billing.city'] = address.billing.city;
                }


                if ((address.billing.pincode)) {
                    if (!validation.PinCode(address.billing.pincode)) return res.status(400).send({ status: false, message: "provide a valid pincode." })
                    updateData['address.billing.pincode'] = address.billing.pincode;
                }
            }
        }


        const updateUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true })
        res.status(200).send({ status: true, message: "User profile updated", data: updateUser })


    } catch (err) {
        console.log(err)
        res.status(500).send({ message: err.message })
    }

}





module.exports = {
    createUser, userLogin, getprofile, updateProfile

}