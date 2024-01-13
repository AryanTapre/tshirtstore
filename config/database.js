
const mongoose = require('mongoose');
const  express = require("express");
const app = express();

const DB_NAME = require("../constants")

//TODO: PROFESSIONAL METHOD TO CONNECT WITH DATABASE
const connectWithDB = async () => {
    try {
        // const connectionInstance = await mongoose.connect(`${process.env.MONOGODB_CONNECTION_URL}/${DB_NAME.DB_NAME}`,{
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true
        // })
        const connectionInstance = await mongoose.connect(`${process.env.MONOGODB_CONNECTION_URL}`,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        app.on("error",(error) => {   // listener
            console.log(`express can not talk to monoDB: ${error}`)
        })

        console.log(`CONNECTED WITH MONGOdb!!
            host:${connectionInstance.connection.host} 
            port:${connectionInstance.connection.port} 
            name:${connectionInstance.connection.name}
        `);

    }
    catch (e) {
        console.log(`FAILED TO CONNECT WITH MONGODB: ${e}`)
        process.exit(1);
    }
}
module.exports = connectWithDB;
