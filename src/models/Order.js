/**
 * Order class
 */

//Dependencies
const helpers = require('../servises/helpers'),
      validators = require('../servises/validators'),
      database = require('../servises/database');  

class Order {
    constructor(data = {}){
        this.id = data.id;
        this.shoppingCartId = data.shoppingCartId;
        this.status = data.status;//TODO add Enumeration
        this.description = data.description;
        this.summaryPrice = data.summaryPrice;
        this.belongTo = data.belongTo;
    }

    /**
     * Returns collection name
     */
    static getCollectionName() {
        return 'order';
    }

    /**
     * Validation of necessary order fields 
     */
    isValid(){
        let isIdValid = validators.isValidString(this.id);
        let isShoppingCartIdValid = validators.isValidString(this.shoppingCartId);
        let isSummaryPriceValid = validators.isValidBoolen(this.summaryPrice);
        let isBelongToValid = validators.isValidString(this.belongTo);

        return isIdValid && isShoppingCartIdValid && isSummaryPriceValid && isBelongToValid;
    }

    /**
     *  Get order from db by his id
     * @param {*} callback 
     */
    static getById(id, callback){
        database.read(Order.getCollectionName(), id, (response) => {
            let order = {};
            if(!response.err){
                let data = helpers.safeJsonParse(response.data);
                order = new Order(data);
            }

            callback(response.err, response.message, order);
        });
    }

    /**
     * Create new order
     * @param {*} callback 
     */
    create(callback){
        //create hash for password
        this.password = helpers.hash(this.password);
        
        //create file for new order
        database.create(Order.getCollectionName(), this.id, this, (response) => {
            //return response to controller 
            callback(response.err, response.message);
        });
    }

    update(callback){
        database.update(Order.getCollectionName(), this.id, this, (response) => {
            //return response to controller 
            callback(response.err, response.message, response.data);
        });
    }

    /**
     * Delete order by his number
     * @param {*} callback 
     */
    delete(callback){
        database.delete(Order.getCollectionName(), this.id, (response) => {
            //return response to controller 
            callback(response.err, response.message);
        })
    }
}

module.exports = Order;