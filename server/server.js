require ("dotenv").config()
const express = require('express')
const app = express()
const PORT = 3000
const router = require('./router/authRouter')
const tempRouter = require('./router/templateRouter')

const connectDB = require('./utils/db')

// Parse JSON bodies
app.use(express.json());

app.use('/api/v1/auth', router)
app.use('/api/v1/template', tempRouter)


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is successfully running on http://localhost:${PORT}`)
    })
})
