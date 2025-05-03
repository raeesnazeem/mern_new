const mongoose = require("mongoose")

// const URI = 'mongodb://127.0.0.1:27017/mern_admin'

const URI = process.env.MONGODB_URI

//  mongoose.connect(URI)

const connectDB = async () => {
    try{
       await mongoose.connect(URI)
       console.log("connected succesfully to database")
    } catch(error) {
        console.error("database connection failed")
        process.exit(0)
    }
}

module.exports = connectDB