//get by id

const productModel = require("../Model/productModel")
const validation = require('../validation/validate')



const getDataByQuery = async function(req,res){
  
try{
    let data=  req.query 
    let {size , name , priceGreaterThan,priceLessThan,priceSort} =data
    let document ={}
    document.isDeleted =true
    if(size){
        document.availableSizes=availableSizes
    }
    if(name){
        document.title=title
    }
    if(priceLessThan && priceGreaterThan){
        document.Price={ $gt :  priceGreaterThan, $lt : priceLessThan}
    }
    if(priceGreaterThan){
        document.Price= {$gt:priceGreaterThan}

    }
    if(priceLessThan){
        document.Price={$gt:priceLessThan}
    }
    if(priceSort){
        let getdata = await productModel.find(document).sort({Price: priceSort})
        if(getdata.length == 0 ) return res.status(404).send({status:false , msg : "No product Found"})
        return res.status(200).send({status:true , data : getdata})
    }
    console.log(document)


    let getdata = await productModel.find(document)
    if(getdata.length == 0 ) return res.status(404).send({status:false , msg : "No product Found"})
    return res.status(200).send({status:true , data : getdata})
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

const updateData = async function(req ,res) {
    try{
        let data = req.body;
        let productId = req.params.productId;
        let files = req.files;
        

        if (!validation.isValidElem(productId)) {
            return res.status(400).send({ status: false, message: "userId is not given" });
        }
        if (!mongoose.isValidObjectId(productId)) {
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

        if (title) {
            if (!validation.isValidElem(title)) { return res.status(400).send({ status: false, message: "title is missing." }); }
            if (!validation.isValidName(title)) { return res.status(400).send({ status: false, message: "title should be in correct format." }); }
            updateData.title = title;
        }

        if (description) {
            if (!validation.isValidElem(description)) { return res.status(400).send({ status: false, message: "description is missing." }); }
            if (!validation.isValidName(description)) { return res.status(400).send({ status: false, message: "description should be in correct formate." }); }
            updateData.description = description;
        }
        if (price) {
            if (!validation.isValidNumber(price)) { return res.status(400).send({ status: false, message: "price is missing or Not in correct format" }); }
            updateData.price = price;
        }

        if (currencyId) {
              return res.status(400).send({ status: false, message: "currency key is not able to update  try Other keys" }); 
        }
        if (currencyFormat) {
            return res.status(400).send({ status: false, message: "currencyFormat is not able to update  try Other keys" }); 
        }

        if (isFreeShipping) {
            if (!validation.isValidElem(isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping is missing" })
            if (typeof(isFreeShipping)!== Boolean) return res.status(400).send({ status: false, message: "isFreeShipping should be in Boolean" })
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
            if (typeof(isDeleted)!== Boolean) { return res.status(400).send({ status: false, message: "isDeleted should in Boolean form." }); }
            updateData.isDeleted = isDeleted;
            updateData.deletedAt = Date.now()
        }

        const updatedProduct = await userModel.findByIdAndUpdate(productId , updateData, { new: true })
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


module.exports={
    getById,getDataByQuery,deleteProduct,updateData
}