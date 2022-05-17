const jwt = require("jsonwebtoken");
const User = require("../model/user.js");




exports.protect = async (req, res, next) => {
  
    let token;
    if (    
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, 'bulbul');
            //  console.log("decoded",decoded)
            // req.user = await User.findById(decoded.userId).select("password")
            req.user = await User.findById(decoded.userId)
            // console.log(" req.user", req.user);
            next();
        } catch (error) {
            console.log("error", error)
            // res.status(401);
            // throw new Error("Not authorized , token failed")
            return res.json({statusCode:401, statusMsj:"Not authorized , token failed"});
        }
    }
    if (!token) {
        // res.status(401);
        // throw new Error("Not authorized, no token");
        return res.json({statusCode:401, statusMsj:"Not authorized, No token provided"});
    }
}
