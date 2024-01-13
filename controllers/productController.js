const bigPromise = require('../middlewares/bigPromise');
const cloudinary = require('cloudinary').v2;
const CustomError = require('../utils/CustomError');
const Product = require('../models/Product');
const WhereClause = require('../utils/WhereClause')
const fileSystem = require('fs')
const User = require("../models/User");

const adminnewProduct = async (request,response,next) => {

    const productName  = request.body.name;
    const productPrice = request.body.price;
    const productDescription = request.body.description;
    const productPhotos = request.files.photos;
    const productCategory = request.body.category;
    const productBrand = request.body.brand;
    const productStock = request.body.stock;
    const productManageUser = request.userID;

    if(!(productName && productPrice && productDescription && productPhotos && productCategory && productBrand && productStock && productManageUser)) {
        console.log(`all field are mandatory for adding new product onto database`)
        return next(response.status(401).json({
            success: false,
            message: new CustomError("all field are mandatory for adding new product onto databaseMedia","all field are mandatory for adding new product onto databaseMedia",401)
        }))
    }

    //moving all photos to cloudinary && Server
    let productImages = [];
    for (let index = 0; index < productPhotos.length; index++) {
        try{
            const cloudinaryResult = await cloudinary.uploader.upload(productPhotos[index].tempFilePath,{
                folder: "Product"})

            productImages.push({
                id: cloudinaryResult.public_id,
                secure_url: cloudinaryResult.secure_url
            })


            let file = productPhotos[index];
            let fileName = cloudinaryResult.public_id;
            fileName =  fileName.replace("Product/","");

            const fileExtension = cloudinaryResult.format;
            file.name = fileName.concat("."+fileExtension);

            const show = {
                file: file,
                cloud: cloudinaryResult
            }
            console.log(show)

            let path =  __dirname + "/../databaseMedia/products/" + file.name;
            await file.mv(path,(error) => {
                if(error) {
                    console.log(`failed to upload photo to server : ${error}`)
                    return next(response.status(501).json({
                        success: false,
                        message: new CustomError("failed to upload photo to server","failed to upload photo to server",501)}))
                }
            })

        }
        catch(error) {
            console.log(`error in uploading photo to Cloudinary -> ${error}`)
        }

    }

    const product = await Product.create({
        name:productName,
        price: productPrice,
        description: productDescription,
        photos: productImages,
        category: productCategory,
        brand: productBrand,
        stock: productStock,
        user: productManageUser
    })

    response.status(201).json({
        success: true,
        product
    })
}


const getProductDetails = async (request,response,next) => {
    const clause = new WhereClause(Product.find(),request.query);
    const totalProductCount = await Product.countDocuments();

    const product = clause.search()
                    clause.filter()
                    clause.pagination(request.query.limit? request.query.limit : 1);

    console.log("product info=>",product);

    const filteringData = product._conditions
    const page = {...product.options}

    console.log("data is => ",filteringData)
    console.log("page is => ",page)

    let data = new Object({...filteringData});

    console.log("final data: ",data)

    let fetchedProducts;
    try{
         fetchedProducts = await  Product.find({...data}).limit(page.limit).skip(page.skip)
    }catch (error) {
        console.log(`faulty: ${next(new CustomError(`error while fetching products from server`,error,501))}`)
    }

    response.status(200).json({
        success: true,
        totalProductCount,
        totalFilteredProductCount: fetchedProducts.length,
        fetchedProducts
    })

}

const adminGetProduct = async (request,response,next) => {
    let product;

    try{
         product = await Product.find();
    }catch (error) {
        console.log(`faulty: ${next(new CustomError(`error while fetching products from server`,error,501))}`)
        return response.status(501).json({
            success: false,
            message: "error while fetching products from server"})
    }

    if(!product) {
        return response.status(501).json({
            success: false,
            message: "there exist no product in database"})
    } else {
        response.status(201).json({
            success: true,
            product
        })
    }

}

const getOneProduct = async (request,response,next) => {
    const productID = request.params.id ? request.params.id : {undefined}

    if(productID === undefined) {
        return response.status(401).json({success: false,message: new CustomError("productID not found","productID not found",401)});
    }

    let productInformation;

    try{
        productInformation = await Product.findById(productID);
    }catch (error) {
        console.log(`faulty: ${next(new CustomError(`error while fetching products from server`,error,501))}`)
        return response.status(501).json({
            success: false,
            message: new CustomError("error while fetching products from server","error while fetching products from server",501)})
    }

    if(!productInformation) {
        return response.status(501).json({
            success: false,
            message: new CustomError("no product exist","no product exist",501)})
    }

    response.status(200).json({
        success: true,
        productInformation
    })
}

const adminUpdateProduct = async (request,response,next) => {
    const productID = request.params.id ? request.params.id : {undefined}

    if(productID === undefined) {
        return response.status(401).json({success: false,message: new CustomError("productID not found","productID not found",401)});
    }

    //deleting existing photos from cloudinary & local server
    const deleteAsset = request.body.asset ? request.body.asset : undefined ;


    if(deleteAsset) {
        console.log(deleteAsset.length)
        let directoryPath =  __dirname + "/../databaseMedia/products/";
        let sendResponse = [];

        for(let index= 0; index<deleteAsset.length; index++) {
            let cloudinaryFileName = "Product/"+deleteAsset[index].id;

            await cloudinary.uploader.destroy(cloudinaryFileName);

            fileSystem.unlink(directoryPath + deleteAsset[index].id + "." + deleteAsset[index].ext,(error) => {
                if(error) {
                    next(new CustomError("failed to remove from local server directory","failed to remove from local server directory",501))
                }
                console.log(`deleted successfully from local directory!`)
            })

            sendResponse.push({
                success: true,
                id: deleteAsset[index].id,
                message: "deleted successfully"
            })
        }

        response.status(200).json(sendResponse);
    }

    //uploading files to local server and cloudinary
    const updateAsset = request.files.updatePhoto ? request.files.updatePhoto : undefined;

    if(updateAsset) {
        let imageArray = [];

        for (const ArrayElement of updateAsset) {
            try{
                    const cloudinaryResult = await cloudinary.uploader.upload(ArrayElement.tempFilePath,{
                        folder: "Product",
                        crop: "scale"})

                    imageArray.push({
                        id: cloudinaryResult.public_id,
                        secure_url: cloudinaryResult.secure_url})

                    let fileName = cloudinaryResult.public_id
                    fileName = fileName.replace("Product/","");

                    const fileExtension = cloudinaryResult.format;
                    ArrayElement.name = fileName.concat("."+fileExtension);

                    const show = {
                        file: ArrayElement,
                        cloud: cloudinaryResult
                    }
                    console.log(show)

                    let directoryPath =  __dirname + "/../databaseMedia/products/" + ArrayElement.name;

                    await ArrayElement.mv(directoryPath,(error) => {
                        if(error) {
                            console.log(`failed to upload photo to server : ${error}`)
                            return next(response.status(501).json({
                                success: false,
                                message: new CustomError("failed to upload photo to server","failed to upload photo to server",501)}))
                        }
                    })
            }
            catch (error) {
                console.log(`error while uploading to Cloudinary: ${error}`)
            }
        }


        let updatedAssets;
        const photoToUpdate = {};
        photoToUpdate.photos = imageArray

        try{
            updatedAssets = await Product.findOneAndUpdate({_id: productID},photoToUpdate,{
                new: true,
                runValidators: true
            })

        }catch (error) {
            console.log("error while updating data on databaseMedia server:",new CustomError(error,error,500));
            return response.status(501).json({
                success: false,message:"error while updating data on databaseMedia server"
            })
        }

        response.status(201).json({
            success: true,
            message: "data Updated successfully",
            updatedAssets
        })

    }

}




const adminDeleteProduct = async (request,response,next) => {
    //delete photos from cloudinary,local server directory & database entry
    const productID = request.params.id ? request.params.id : undefined;
    let directoryPath =  __dirname + "/../databaseMedia/products/";
    let sendResponse = [];

    if(productID) {
        const _productStatus = await Product.findById(productID);

        if(!_productStatus) {
            console.log(`productID not validating`);
            next(response.status(401).json({
                success: false,
                message: new CustomError("productID is inValid","productID is inValid",401)})
            )
        }

        for (let index = 0; index < _productStatus.photos.length; index++) {
            const asset = _productStatus.photos[index];
           try{
                await cloudinary.uploader.destroy(asset.id);
                const len = asset.secure_url.length-4; // getting format for file(.jpeg/.png/.avg)
                const fileExtension = asset.secure_url.slice(len,asset.secure_url.length);


               let fileName = asset.id;
               fileName =  fileName.replace("Product/","");
               console.log("fileName=",fileName)
               console.log("full filename = ",directoryPath+fileName+fileExtension);

               fileSystem.unlink(directoryPath + fileName + fileExtension,(error) => {
                   if(error) {
                       next(new CustomError(`failed to delete asset from local server:${error}`,`failed to delete asset from local server:${error}`,501));
                   }
                   console.log(`Asset id: ${asset.id} deleted Successfully...`)
               })

               sendResponse.push({
                   success:true,
                   assetID: asset.id,
                   message: "deleted successfully"
               })
           }
           catch (error) {
               console.log(new CustomError(`failed to delete asset remotely: ${error}`,`failed to delete asset remotely: ${error}`,501));

               return response.json({
                   msg: new CustomError(`failed to delete asset remotely: ${error}`,`failed to delete asset remotely: ${error}`,501)
               })

           }
        }

        //deleting product from database;
        try{
            await Product.findByIdAndDelete(productID);
        }catch (e) {

            next(new CustomError(`cannot delete product from database:${e}`,`cannot delete product from database:${e}`,501));
        }

        response.status(202).json(sendResponse);
    }
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
const addReview = async (request,response,next) => {
    const productID = request.params.id ? request.params.id : undefined;

    if(productID) {
        const product = await Product.findById(productID);
        if(!product) {
            console.log("ISSUE RAISE : productID invalid")
            next(response.status(401).json({
                success: false,
                message:new CustomError("productID invalid","productID invalid",401)}))
        }

       const alreadyReviewed = product.reviews.find(
           (element) => {
               return element.user.toString() === request.userID.toString()
           }
       )

        if(alreadyReviewed) {

            const data = [
                {type: "rating",
                    data: request.body.rating},
                {type: "comment",
                    data: request.body.comment}
            ]

            const selectedData = selectDataToUpdate(...data);
            console.log(`selectedData:`,selectedData)

            product.reviews.forEach((review) => {
                if(review.user.toString() === request.userID.toString()) {
                    for (const data of selectedData) {
                        console.log(`${data}:`,request.body[data]);
                        review[data] = request.body[data];
                    }
                }
            })

        } else {

            const user = await User.findById(request.userID);
            const userRating = request.body.rating;
            const userComment = request.body.comment;
            const userName = user.name;

            let info = {   user:request.userID,
                                 name: userName,
                                 rating: Number(userRating),
                                 comment: userComment }

            product.reviews.push(info);
            product.numberOfReview = product.reviews.length;
        }

        //calculating overall rating of Product....
        product.rating = product.reviews.reduce((accumulator,current) => {
            return current.rating + accumulator
        },0) / product.reviews.length;

       try{
           await  product.save({
               validateBeforeSave: false
           })
       }
       catch(error) {
           console.log(`failed to save review to database:${error}`)
           next(response.status(501).json({
               success: false,
               message:`failed to save review to database:${error}`
           }))
       }
        console.log("review added successfully for userID:",request.userID)
        response.status(201).json({
            success: true,
            message :"review added successfully"
        })
    }

}


const deleteReview = async (request,response,next) => {
    const productID = request.params.id ? request.params.id : undefined;

    if(productID) {
        const product = await Product.findById(productID);
        if (!product) {
            console.log("ISSUE RAISE : productID invalid")
            next(response.status(401).json({
                success: false,
                message: new CustomError("productID invalid", "productID invalid", 401)}))
        }

        const userReview = product.reviews.filter((element,index) => {
            if(element.user.toString() === request.userID.toString()) {
                element.index = index;
                return element;
            }
        })

        console.log("user review:",userReview);

        if(userReview.length >= 1) {
            product.numberOfReview = product.reviews.length - 1;

            product.reviews.splice(userReview[0].index, 1); // deleting review

            if(product.reviews.length >= 1) {
                product.rating = product.reviews.reduce((accumulator,current) => {return current.rating + accumulator},0) / product.reviews.length
            } else {
                product.rating = 0;
            }


            await product.save({
                validateBeforeSave: false
            })

            console.log("review deleted successfully reviewID:",userReview[0]._id);
            response.status(201).json({
                success: true,
                message: "review deleted successfully"
            })
        }
        else {
            console.log("review not exist for userID:",request.userID);
            response.status(401).json({
                success: false,
                message: "review not exist"
            })
        }

    }
}

exports.deleteReview = bigPromise(deleteReview)
exports.addReview = bigPromise(addReview)
exports.adminDeleteProduct = bigPromise(adminDeleteProduct)
exports.adminUpdateProduct = bigPromise(adminUpdateProduct)
exports.getOneProduct = bigPromise(getOneProduct);
exports.adminGetProduct = bigPromise(adminGetProduct);
exports.adminnewProduct = bigPromise(adminnewProduct);
exports.getProductDetails = bigPromise(getProductDetails);