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
