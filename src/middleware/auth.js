const jwt = require('jsonwebtoken')

const auth = function(req, res, next) {
    try {
        let token = req.headers.authorization
        if (!token) {
            return res.status(401).send({ status: false, msg: "token is required" })
        } 
        token = token.split(' ')[1]
        jwt.verify(token, "Project5-ProductManagement", (error, decodedtoken) => {
            if (error)  return res.status(401).send({ status: false, msg: error.message })
            
            else {
                req.token = decodedtoken
                next();
            }
        });
    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
};

module.exports.auth = auth