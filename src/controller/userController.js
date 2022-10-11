///get user 

const userProfile =async function (req,res)
{
try
    {
    const userId=req.param.userId
    if(!userId) 
    return res
    .status(400)
    .send({status:false,message:"enter userid in p path"})
    
return res.status(500).send({status:true,message:"user profile details",data:checkuser})

    }
    
    catch(arr)
    {
    return res.status(500).send({status:false,message:arr.message})
    }

    

}
console.log(userId)