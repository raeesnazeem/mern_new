const express = require('express')
const app = express()
const PORT = 3000
const router = require('./router/authRouter')

app.use('/api/v1/auth', router)


app.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`)
})
