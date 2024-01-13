const express = require('express');
const homeRouter = express.Router();

const {isGoogleAuthenticate} = require('../middlewares/user')

const {home} = require('../controllers/home');


homeRouter.route("/home").get(isGoogleAuthenticate,home);



//FIXME: Exporting Router
module.exports = {homeRouter};

            


