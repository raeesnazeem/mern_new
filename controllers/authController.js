const home = async (req, res) => {
    try{
        res.status(200).send("This is the home page using controller")
    }catch(error){
        res.status(500).send("Error in home page")
    }
}

const register = async (req, res) => {
    try{
        res.status(200).send("This is the new registration page")
    } catch {
        res.status(500).send("There's been an error on the page")
    }
}

module.exports = {home, register}