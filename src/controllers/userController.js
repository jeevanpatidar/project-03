const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const moment = require('moment')
 
module.exports = {
 createUser : async(req,res) => {
    try {
        let data = req.body
        let {phone, email} = data

        let uniqueData = await userModel.findOne({$or:[{phone: phone},{email: email}]})

        if (uniqueData) {
            if (uniqueData.phone == phone.trim()) { return res.status(400).send({ message: `${phone.trim()} is already exist` }) 
            } else if(uniqueData.email == email.trim()) { return res.status(400).send({ message: `${email.trim()} this emailId is already exist`}) }}

        let createUserdata = await userModel.create(data)
        res.status(201).send({status : true ,message : "Data created successfully" , data : createUserdata})
    }
     catch (error) {
        console.log(error.message)
        res.status(500).send({status : false , message : error.message})    
    }
},

login : async(req, res) => {
    try {
        let data = req.body
        let {email , password} = data

        let findUser = await userModel.findOne({ email: email, password: password }); 
        if (!findUser) return res.status(404).send({ status: false, message: "emailId or password is incorrect" })

        let token = jwt.sign({
            userId : findUser._id      
        },
        "secret-Hai-ye-batan-mat", { expiresIn: "1d" })
        let decode = jwt.verify(token ,"secret-Hai-ye-batan-mat")

        res.setHeader("token" ,token)
        res.status(200).send({Message : "LoggedIn successfully" , data: token ,userId: decode.userId ,iat: decode.iat ,exp: decode.exp})
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
}