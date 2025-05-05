const User = require('../models/userModel')

const home = async (req, res) => {
    try{
        res.status(200).send("This is the home page using controller")
    }catch(error){
        res.status(500).send("Error in home page")
    }
}

const register = async (req, res) => {
    try{
        // destructuring the data from the body of the request
        const {username, email, password, isAdmin} = req.body

        //check if user exists in database
        const userExists = await User.findOne({email:email})

        if(userExists){
        return res.status(400).json({message: "email already exists"})
        }
        const userCreated = await User.create({username, email, password, isAdmin})

        res.status(201).json({msg: userCreated})
    } catch(error) {
        console.error("Registration Error:", error); // Log for debugging
        res.status(500).json({ 
          message: "Internal Server Error",
          error: error.message // Send details in development
        });
    }
}

const search = async (req, res) => {
    try{
        console.log(req.body)
        res.status(200).json({message: req.body})
    } catch(error) {
        res.status(500).json("Internal Server error")
    }
}

module.exports = {home, register, search}