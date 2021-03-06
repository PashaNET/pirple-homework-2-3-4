//Dependencies
const validators = require('../servises/validators'),
      ShoppingCart = require('../models/ShoppingCart'),
      Token = require('../models/Token');

let shoppingCart = (data, callback) => {
    //permitted methods for controller
    const allowedMethods = {
        get: {needVerification: true}, 
        put: {needVerification: true}, 
        post: {needVerification: true}, 
        delete: {needVerification: true}
    };

    //check if request method allowed for this controller
    if(allowedMethods[data.method] !== undefined) {
        //before perform operation, check that if method require logged user
        if(allowedMethods[data.method].needVerification){
            //check that user logged in 
            Token.verify(data.headers.token, data.payload.email, (tokenIsValid) => {
                if(tokenIsValid){
                    //get action according to request method
                    _shoppingCart[data.method](data.payload, callback);
                } else {
                    callback(403);
                }
            });
        } else {
            //current method doen't need token verification
            //get action according to request method
            _shoppingCart[data.method](data.payload, callback);
        }
    } else {
        callback(405);
    }
};

_shoppingCart = {};

_shoppingCart.get = (data, callback) => {
    //check if params suit requirements
    let isIdValid = validators.isValidEmail(data.id);

    if(isIdValid){
        //check if user exist
        ShoppingCart.getById(data.id, (err, message, cart) => {
            if(!err){
                callback(200, cart);
            } else {
                //such cart doesn't exist 
                callback(400, {message: message});
            }
        });
    } else {
        callback(400, {message: 'Invalid id'});
    }
};

_shoppingCart.post = (data, callback) => {
    //check if params suit requirements
    // let isEmailValid = validators.isValidEmail(data.email),
    let isNotEmptyItems = validators.isNotEmptyArray(data.items);
//isEmailValid && 
    if(isNotEmptyItems){
        //create instanse of cart
        let cart = new ShoppingCart(data);
        
        //validate cart
        if(cart.isValid()){
            cart.create((err, message) => {
                let respCode = err ? 400 : 200;
                callback(respCode, {message: message, cart: cart});
            });
        } else {
            callback(400, {message: 'Missing required params'});
        }
    } else {
        callback(400, {message: 'Invalid email'});
    }
};

_shoppingCart.put = (data, callback) => {
    //get cart instance by id
    ShoppingCart.getById(data.id, (err, message, cart) => {
        if(!err && cart){
            cart.items.push(data.items[0]);
            cart.update((err, message, updatedCart) => {
                //get responseCode
                let respCode = err ? 400 : 200;
                callback(respCode, {message: message, cart: updatedCart});
            });
        } else {
            callback(400, {message: 'Missed required params'});
        }
    });
};

_shoppingCart.delete = (data, callback) => {
    //check if number suit requirements
    let isEmailValid = validators.isValidEmail(data.email);

    if(isEmailValid){
        //check if cart exist
        ShoppingCart.getByEmail(data.email, (err, message, cart) => {
            if(!err){
                //if the no error, we can delete this cart
                cart.delete((err, message) => {
                    let respCode = err ? 400 : 200;
                    callback(respCode, {message: message});
                });
            } else {
                //such cart doesn't exist 
                callback(200, {message: message});
            }
        });
    } else {
        callback(400, {message: 'Invalid id'});
    }
};

module.exports = shoppingCart;