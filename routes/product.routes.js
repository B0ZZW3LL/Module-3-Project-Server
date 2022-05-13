const router = require("express").Router();
const mongoose = require('mongoose');

const Product = require("../models/Product.model");
const Pantry = require("../models/Pantry.model")


//***** HANDLE PRODUCT CREATION AND ADDING TO SPECIFIED PANTRY ******//
router.post('/create', (req, res, next) => {

  const { 
    image, 
    barcode_number, 
    title, 
    brand, 
    size, 
    category, 
    description, 
    manufacturer, 
    qty, 
    pantryId 
  } = req.body

  Product.create( {image, 
    barcode_number, 
    title, 
    brand, 
    size, 
    category, 
    description, 
    manufacturer, 
    qty,
    pantryId })

    .then(productCreated => {
      return Pantry.findByIdAndUpdate(pantryId, { $push: { products: productCreated._id }})
    })
    .then(() => {
      console.log('Product added to pantry');
      res.json('Product added to pantry');
    })
    .catch(error => console.log(error))
})


module.exports = router;