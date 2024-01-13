// importing big promise from middlewares
const bigPromise = require('../middlewares/bigPromise');

const home = (request,response,next) => {
    response.status(200).json(
        {
            success: true,
            message: "Welcome to Home "
        }
    )
}


exports.home = bigPromise(home);

