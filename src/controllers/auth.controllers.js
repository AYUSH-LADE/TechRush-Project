const usermodel = require("../models/user.model");
const jwt = require("jsonwebtoken");


async function registerUser(req, res) {
    const { username, email, password } = req.body;

    const user = await usermodel.create({
        username , email , password});

        const token = jwt.sign({
            id:user._id,
        },process.env.JWT_SECRET)

        res.cookie("mama", token);

        res.status(201).json({
            message:"User Registered Successfully",
            token,
        })
}



module.exports = { registerUser };