const jwt = require('jsonwebtoken')

const auth = function(req, res, next) {
    try {
        let token = req.headers.authorization;
        // console.log(token)
        if (!token) {
            return res.status(401).send({ status: false, msg: "token is required" });
        } else {
            token = token.split(' ')[1]
            // console.log(token)
        }
        jwt.verify(token, "Project5-ProductManagement", (error, decodedtoken) => {
            if (error) {
                const msg =
                    error.message === "jwt expired"? "Token is expired": "Token is invalid";
                return res.status(401).send({ status: false, msg });
            }
            else {
                req.token = decodedtoken;
                // console.log(decodedtoken)
                next();
            }
        });
    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
};

module.exports.auth = auth