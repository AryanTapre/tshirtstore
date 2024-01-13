const bigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/CustomError');
const Order = require('../models/Order');
const {userDashboard} = require("./userController");
const {request} = require("axios");
const {uriDecodeFileName} = require("express-fileupload/lib/utilities");

const createOrder = async (request,response,next) => {
    const {
        orderItems,
        shippingInfo,
        shippingAmount,
        paymentInfo,
        taxAmount,
        totalAmount,
    } = request.body;

   const orderPlace = new Object({
       orderItems: orderItems,
       shippingInfo:shippingInfo,
       user: request.userID,
       shippingAmount:shippingAmount,
       paymentInfo: paymentInfo,
       taxAmount: taxAmount,
       totalAmount: totalAmount,
       orderStatus: "order placed"
   })

    let orderAlreadyExist = undefined;
    let order = undefined;
    try{
        //order = await Order.create(orderPlace);
        orderAlreadyExist = await Order.find({user: request.userID});
        console.log("order already exist:",orderAlreadyExist);

        if(orderAlreadyExist.length >= 1) {
            orderAlreadyExist[0].orderItems.push(orderItems);
            await orderAlreadyExist[0].save({validateBeforeSave: false});
        }
        else {
            order = await Order.create(orderPlace);
        }


    }catch (error) {

        console.log(`error while creating order onto database: ${error}`)
       next(response.status(501).json({
           success: false,
           message: new CustomError(`error while creating order onto database: ${error}`,`error while creating order onto database: ${error}`,501)
       }))
    }

    console.log(`order saved successfully: ${order}`);

    response.status(201).json( {
        success: true,

    } )

}

const deleteOrder = async (request,response,next) => {
    const orderID = request.query.orderid ? request.query.orderid: undefined;
    const productID = request.query.productid ? request.query.productid: undefined;

    if(orderID && productID) {

        let order = undefined;
        try{

            //verifying the User
            order = await Order.find({user: request.userID})
            console.log("order:",order[0].orderItems);

            const orderDelete = order[0].orderItems.filter((element,index) => {
                if(element.product.toString() === productID.toString()) {
                    element.index = index;
                    return element
                }
            })

            if(orderDelete.length >=1) {
                order[0].orderItems.splice(orderDelete[0].index,1); // deleting order
            }

            if(order[0].orderItems.length >= 1){
                await order[0].save({validateBeforeSave: false})
            }
            else {
                await order[0].deleteOne();
            }

        }catch (error) {

            console.log(`error while creating order onto database: ${error}`)
            next(response.status(501).json({
                success: false,
                message: new CustomError(`error while creating order onto database: ${error}`,`error while creating order onto database: ${error}`,501)
            }))
        }

        response.status(201).json({
            success: true,
            message: `order deleted successfully for productid: ${productID}`
        })
    }
    else {
        return response.status(401).json({
            success: false,
            message: new CustomError("orderID/productID not found","orderID/productID not found",401)
        })
    }

}

const getOneOrder = async(request,response,next) => {
    const orderID = request.params.id ? request.params.id: undefined;
    let order = undefined;
    if(orderID) {
        try{
            order = await Order.findById(orderID);
        }
        catch(error) {
            next(response.status(501).json( {
                success: false,
                message: `Cannot find order: ${error}`
            }))
        }
    }
    else {

        response.status(401).json({
            success: false,
            message: "order id not found!"
        })
    }

    response.status(201).json({
        success: true,
        message:"order found successfully",
        order
    })
}

const getMyOrders = async(request,response,next) => {
    const order = await Order.find({user: request.userID})

    if(!order) {
        next(response.status(501).json({
            success: false,
            message: `order not found for user: ${request.userID}`
        }))
    }

    order[0]._id = undefined;
    order[0].user = undefined;
    order[0].orderStatus = undefined;
    order[0].createdAt = undefined;

    response.status(200).json({
        success: true,
        message: `order founded for user : ${request.userID}`,
        order
    })
}

const adminAllOrders = async(request,response,next) => {
    const order = await Order.find()

    if(!order) {
        next(response.status(501).json({
            success: false,
            message: `order not found for user: ${request.userID}`
        }))
    }

    response.status(200).json({
        success: true,
        message: `order founded for user : ${request.userID}`,
        order
    })
}

const adminGetOneOrder = async(request,response,next) => {

    const orderID = request.params.id ? request.params.id: undefined;
    let order ;
    if(orderID) {
        try{
            order = await Order.findById(orderID);
        }
        catch(error) {
            next(response.status(501).json( {
                success: false,
                message: `Cannot find order: ${error}`
            }))
        }
    }
    else {

        response.status(401).json({
            success: false,
            message: "order id not found!"
        })
    }

    response.status(201).json({
        success: true,
        message:"order found successfully",
        order
    })
}

const selectDataToUpdate = (...data) => {
    let values = [];
    for (const dataKey of data) {
        if(dataKey.data) {
            values.push(dataKey.type);
        }
    }
    console.log("values:",values);

    return values;
}
const adminUpdateOrder = async (request,response,next) => {
    const data = [
        {
            type:"orderStatus",
            data: request.body.orderStatus
        },
        {
            type:"deliveredAt",
            data: request.body.deliveredAt
        },
    ]

    const selectedData = selectDataToUpdate(...data);
    const updatedData = {};

    selectedData.forEach((element) => {
        if(element == "orderStatus") {
            updatedData.orderStatus = request.body.orderStatus
        }

        if(element == "deliveredAt") {
            updatedData.deliveredAt = new Date(Date.now());
        }
    })

    let order = undefined;
    try {
         order = await Order.findByIdAndUpdate(request.params.id,updatedData,{
            new: true,
            runValidators: true
        })
    }
    catch(error) {
        console.log("cannot update the order:",error);
        next(response.status(501).json({
            success: true,
            message: `cannot update the order: ${error}`
        }))
    }

    response.status(201).json({
        success: true,
        message: "order updated successfully",
        order
    })
}

const adminDeleteOrder = async (request,response,next) => {
    const orderID = request.params.id ? request.params.id: undefined;
    let order = undefined;

    if(orderID) {
        try {

            order = await Order.findByIdAndDelete(orderID);
            if(!order) {
                response.status(201).json({
                    success: true,
                    message: "order not found",

                })
            }
        }
        catch(error) {
            console.log("cannot find order:",error)
            next(response.json({
                success: true,
                message: `cannot find order :${error}`
            }))
        }

        response.status(201).json({
            success: true,
            message: "order deleted successfully",

        })
    }
}

exports.adminDeleteOrder = bigPromise(adminDeleteOrder)
exports.adminUpdateOrder = bigPromise(adminUpdateOrder)
exports.adminGetOneOrder = bigPromise(adminGetOneOrder);
exports.adminAllOrders = bigPromise(adminAllOrders);
exports.getMyOrders = bigPromise(getMyOrders);
exports.getOneOrder = bigPromise(getOneOrder)
exports.createOrder = bigPromise(createOrder);
exports.deleteOrder = bigPromise(deleteOrder);