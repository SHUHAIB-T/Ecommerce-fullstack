const { default: mongoose } = require("mongoose")

const dbConnect = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_ATLAS_URL)
        console.log("database connected sccessfully")
    }catch(err){
        console.log("error connecting in db")
    }
}
module.exports = dbConnect;