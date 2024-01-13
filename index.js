require('dotenv').config({
    path: './environmentVariables/.env'
})

const app = require('./config/app');
const connectWithDB = require('./config/database');
const cloudinary = require('cloudinary');

//FIXME: CONNECTING TO DATABASE....
connectWithDB().then(()=> {
    app.listen(process.env.SERVER_PORT,() => {
        console.log(`Express:server: is up at port:${process.env.SERVER_PORT}`);
    })
}).catch((error) => {
        console.error("MOngoDB connection Failed!!!",error);
})


//cloudinary connect....
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUDNAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
