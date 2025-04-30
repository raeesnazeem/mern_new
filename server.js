const express = require('express')
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.status (200).send('Hello World!');
})

app.get('/register', (req, res) => {
    res.status(200).send("This is the register page")
})

app.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`)
})
