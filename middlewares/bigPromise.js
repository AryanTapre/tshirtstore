module.exports = func => (request,response,next) => {
    Promise.resolve(func(request,response,next)).catch(err =>  console.log(err));
}

