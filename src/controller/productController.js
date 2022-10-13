const aws =require("aws-sdk")
const validation=require("../validation/validate")



//--------------------------------------aws--------------------------------------------------------
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
//---------------------------------------ProductCreate----------------------------------------------------
const addProduct= async (req,res)=>{
    try{
    let data =req.body
    let files=req.file

if (!files || files.length == 0) return res.status(400).send({ status: false, message: "Please upload product image" });
        //upload to s3 and get the uploaded link
        let uploadedFileURL = await uploadFile(files[0])
        data.productImage = uploadedFileURL
        if (!/(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i.test(data.productImage)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg,png,jpg,gif,bmp etc" })

        let created = await productModel.create(data).select({__v:0})
        res.status(201).send({ status: true, message: 'Success', data: created })
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}
module.exports={addProduct}