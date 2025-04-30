const home = async (requestAnimationFrame, res) => {
    try{
        res.status(200).send("This is the home page using controller")
    }catch(error){
        res.status(500).send("Error in home page")
    }
}

module.exports = {home}