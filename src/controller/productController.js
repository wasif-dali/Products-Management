
const aws =require("aws-sdk")
const { json } = require("express")
const productModel=require("../Model/productModel")
const validation=require("../validation/validate")
const ObjectId = require('mongoose').Types.ObjectId

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
    console.log(size2)
    for(let i=0;i<size2.length;i++){
        console.log(size1.includes(size2[i]))
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



const getDataByQuery = async function(req,res){
  
try{
    let data=  req.query 
    let {size , name , priceGreaterThan,priceLessThan,priceSort} =data
    let title,price,availableSizes
    let document ={
        isDeleted:false
    }
    
    if(size){
        if(!validation.isValidElem(size) || (["S", "XS","M","X", "L","XXL", "XL"].indexOf(size)==-1)){
           return res.status(400).send({ status: false, message: 'size should be in "S", "XS","M","X", "L","XXL", "XL" '})
        }else{
        document.availableSizes=size
        }
    }
    if(name){
        if(!validation.isValidName(name)){
            return res.status(400).send({ status: false, message: 'name is not in correct format'})
        }else{
        document.title=name}
    }
    /// problem see again  

    if(priceGreaterThan){
        if(!(/^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(priceGreaterThan))|| !validation.isValidElem(priceGreaterThan)){
            return res.status(400).send({ status: false, message: 'priceGreaterthan is not in correct format'})
        }else{
            priceGreaterThan=Number(priceGreaterThan)
            document.price={$gt : priceGreaterThan}
        }
    }
    if(priceLessThan){
        if(!(/^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(priceLessThan))|| !validation.isValidElem(priceLessThan)){
            return res.status(400).send({ status: false, message: 'priceGreaterthan is not in correct format'})
        }else{
            priceLessThan=Number(priceLessThan)
            document.price={$lt:priceLessThan}
        }
    }
    let getdata
    if (priceSort) {
        priceSort = priceSort.trim();
        console.log(priceSort)
        if (["-1", "1"].indexOf(priceSort) < 0) {
            return res.status(400).send({status: false,message: "enter the Valid key for priceSort", });
        }
        if (priceSort == "1") {
            console.log(document)
            getdata = await productModel.find(document).sort({ price: 1 });
            return res.status(200).send({status: true,
                message: 'Success',
                data: getdata})
        } else if (priceSort == "-1") {
           console.log("chal raha hai")
           console.log(document)
           getdata = await productModel.find(document).sort({ price: -1 });
           return res.status(200).send({status: true,
            message: 'Success',
            datagetdata})
        }
    }
    // console.log(document)


    getdata = await productModel.find(document)
    if(getdata.length == 0 ) return res.status(404).send({status:false , msg : "No product Found"})
    console.log(document)
    return res.status(200).send({status: true,
        message: 'Success',
        data :getdata})
}catch(err){
    console.log(err)
    return res.status(500).send({ message: err.message })
}


}


const getById = async (req, res) => 
{
    try 
    {
        const productId = req.params.productId

        if (!ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "enter valid id in path param" })

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
       
        if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product deleted" })

        return res.status(200).send({ status: true, message: 'Success', data: checkProduct })

    } 
    
    catch (err) 
    {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateData = async function(req ,res) {
    try{
        let data = req.body;
        let productId = req.params.productId;
        let files = req.files;
        
        

        if (!validation.isValidElem(productId)) {
            return res.status(400).send({ status: false, message: "userId is not given" });
        }
        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "userId is Invalid" });
        }

        const findProductId = await productModel.findOne({isDeleted:false , _id : productId });
        if (!findProductId)
        return res.status(404).send({ status: false, message: "NO DATA FOUND" });
        


        // check request body is valid
        if (!(validation.isValidreqBody(data) || files)) {
            return res.status(400).send({ status: false, message: "Enter a valid details" });
        }

        let {title,description,price,currencyId,currencyFormat,isFreeShipping,productImage,style,availableSizes,installments,isDeleted} = data;
        let updateData = {};

        if(title ||title===""){
            title=title.trim()
               if (!validation.isValidElem(title)){
                  return res.status(400).send({ status: false, message: "title is invalid" })};
               
                let finding = await productModel.findOne({ title: title });
              if (finding) {
                return res.status(400).send({ status: false, message: "title is already present" })}
                updateData.title = title
              };

        if (description || description === "") {
            description=description.trim()
            if (!validation.isValidElem(description)) { return res.status(400).send({ status: false, message: "description is missing." }); }
            // if (!validation.isValidName(description)) { return res.status(400).send({ status: false, message: "description should be in correct formate." }); }
            updateData.description = description;
        }
        if (price || price === "") {
            price =price.trim()
            if (!validation.isValidNumber(price)) { return res.status(400).send({ status: false, message: "price is missing or Not in correct format" }); }
            updateData.price = price;
        }

        if (currencyId || currencyId === "") {
            if(currencyId !="INR" )
            return res.status(400).send({ status: false, message: "currency key is not able to update  try Other keys" }); 
            
        }
        if (currencyFormat || currencyFormat === "" ) {
            if(currencyFormat !="₹")
            
            return res.status(400).send({ status: false, message: "currencyFormat is not able to update  try Other keys" }); 
        }

        if (isFreeShipping) {
            console.log("rohit singh :"+isFreeShipping)
            isFreeShipping=isFreeShipping.trim()
            if (isFreeShipping === "true"){
                isFreeShipping =true
            }else if(isFreeShipping === "false"){
                isFreeShipping = false
            }

            console.log(isFreeShipping)
            console.log(isFreeShipping === Boolean)
        //     // if (!validation.isValidElem(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping is missing" })
        //     if (typeof(isFreeShipping) !== Boolean) return res.status(400).send({ status: false, message: "isFreeShipping should be in Boolean" })
           updateData.isFreeShipping = isFreeShipping;
        
    }

        if (productImage) {
            if (typeof productImage === "string") {
                return res.status(400).send({ Status: false, message: "Please upload the image" })
            }
        }
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])
        
            updateData.productImage = uploadedFileURL
        }

        if (style) {
            if (!validation.isValidElem(style)) { return res.status(400).send({ status: false, message: "title is missing." }); }
            updateData.style = style;
        } 
        if (availableSizes) {
            ///
            ////
            //
        } 
        if (installments) {
            if (!validation.isValidNumber(installments)) { return res.status(400).send({ status: false, message: "installment is missing or in incorrect formate " }); }
            updateData.installments = installments;
        }
        if (isDeleted) {
            if (isDeleted != "true" || isDeleted != "false") { return res.status(400).send({ status: false, message: "isDeleted should in Boolean form." }); }
            updateData.isDeleted = Boolean(isDeleted);
            updateData.deletedAt = Date.now()
        }

        const updatedProduct = await productModel.findByIdAndUpdate(productId , updateData, { new: true })
        res.status(200).send({ status: true, message: "User profile updated", data: updatedProduct })

    }catch(err){
        return res.status(500).send({ message: err.message })
    }


}


///delete

const deleteProduct = async (req, res) => 
{
    try 
    {
        const productId = req.params.productId;

        if (!ObjectId.isValid(productId)) return res.status(400)
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
module.exports={addProduct,getDataByQuery,deleteProduct,updateData,getById}