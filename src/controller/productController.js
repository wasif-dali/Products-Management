const aws =require("aws-sdk")
const productModel=require("../Model/productModel")
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
            // console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })



    })
}
//-----------------------------------------ProductCreate----------------------------------------------------
const addProduct= async (req,res)=>{
try{
    let data =req.body
    let files=req.files


    if(!(validation.isValidreqBody(data)||files)) return res.status(400).send({status:false,message:"Invalid request parameter,Please Provide"})
    let {title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments}=data

    //-------------------------------------title validation-------------------------------------
    if(!validation.isValidElem(title)) return res.status(400).send({status:false,message:"Title is required"})
    if(!validation.isValidName(title)) return res.status(400).send({status:false,message:"please provide valid Title including characters only"})

    let checkTitle=await productModel.findOne({title:data.title});
    if(checkTitle) return res.status(409).send({status:false,message:"title already exist"})

    //--------------------------------------description validation--------------------------------------------
    if(!description) return res.status(400).send({status:false,message:"description is required"})
    if(!validation.isValidElem(description)) return res.status(400).send({status:false,message:"description is required"})
    //--------------------------------------price validation--------------------------------------------------------
    if(!price) return res.status(400).send({status:false,message:"Price is required"})
    if(!validation.isValidNumber(price)) return res.status(400).send({status:false,message:"Price should be in number Only"})

    //--------------------------------currencyId validation--------------------------------------------------


    if(currencyId||currencyId==""){
        if(!validation.isValidElem(currencyId)) return res.status(400).send({status:false,messsage:"CurrencyId is Required"})
        if(!(/INR/.test(currencyId))) return res.status(400).send({status:false,message:"Currency Id of Product should be in UpperCase 'INR' format"})

    }
    else{
        data.currencyId="INR"
    }
    //-------------------------------currency Format validation-----------------------------------------------
    if(currencyFormat||currencyFormat==""){
        if(!validation.isValidElem(currencyFormat)) return res.status(400).send({status:false,message:"currency format is required"})
        if(!(/₹/.test(currencyFormat))) return res.status(400).send({status:false,message:"currency format of product should be in '₹' "})
    }
    else{
        data.currencyFormat="₹"
    }
    //--------------------------------isFreeShipping validation------------------------------------------
    if(isFreeShipping||isFreeShipping==""){
        isFreeShipping=isFreeShipping.toLowerCase();
        if(isFreeShipping=='true'||isFreeShipping=="false"){
            isFreeShipping=JSON.parse(isFreeShipping)
        }
        else{
            return res.status(400).send({status:false,message:"Enter valid value for isFreeShipping"})
        }
        if((typeof isFreeShipping!="boolean")){
            return res.status(400).send({status:false,message:"isFreeShipping Must be A boolean value"})
        }
    }
    //---------------------------------style  validation--------------------------------------------------
    if(style||style==""){
        if(!validation.isValidElem(style)) return res.status(400).send({status:false,message:"style is required"})
        if(!validation.isValidName(style)) return res.status(400).send({status:false,message:"please style should be characters only "})
    }
    //--------------------------------availableSize validation----------------------------------------------
    if(!availableSizes) return res.status(400)({status:false,message:"available Size is required "})
    let size1=["S", "XS", "M", "X", "L", "XL", "XXL"]
    let size2= availableSizes.split(",").map((x)=>x.trim().toUpperCase())
    for(let i=0;i<size2.length;i++){
        if(!(size1.includes(size2[i]))){
            return res.status(400).send({status:false,message:"Sizes Should One of these-'S', 'XS', 'M', 'X', 'L', 'XL', 'XXL' "})
        }
    }
    data.availableSizes=size2

    //-------------------------------- installments Validation----------------------------------------------------------
    if(installments || installments==""){
        if(!validation.isValidElem(installments)) return res.status(400).send({status:false,message:"installments should be in numbers"})
        if(!validation.isValidNumber(installments)) return res.status(400).send({status:false,message:"installment should be in number Only"})
    }

    


     if(!files || files.length == 0) return res.status(400).send({ status: false, message: "Please upload product image" })
    
        //upload to s3 and get the uploaded link
        let uploadedFileURL = await uploadFile(files[0])
        data.productImage = uploadedFileURL
        if (!/(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i.test(data.productImage)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg,png,jpg,gif,bmp etc" })
    const create = await productModel.create(data)
    return res.status(201).send({status:true,message:"Success",data:create})




}
 catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}

//get by id

const getById = async (req, res) => 
{
    try 
    {
        const productId = req.params.productId

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "enter valid id in path param" })

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
       
        if (!checkProduct) return res.status(404)
        .send({ status: false, message: "productId invalid or the product deleted" })

        res.status(200)
        .send({ status: true, message: 'Success', data: checkProduct })

    } 
    
    catch (err) 
    {
        return res.status(500).send({ status: false, message: err.message })
    }
}

///delete

const deleteProduct = async (req, res) => 
{
    try 
    {
        const productId = req.params.productId;

        if (!mongoose.isValidObjectId(productId)) return res.status(400)
        .send({ status: false, message: "Please enter valid productId in params path" });

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!checkProduct) return res.status(404)
        .send({ status: false, message: "productId invalid or the product is deleted" });

        await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() });

        res.status(200)
        .send({ status: true, message: 'deleted sucessfully' })

    } 
    catch (err) 
    {
        return res.status(500)
        .send({ status: false, message: err.message })
    }
}
module.exports={addProduct,deleteProduct,getById}