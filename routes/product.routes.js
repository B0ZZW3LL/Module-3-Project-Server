const router = require("express").Router();
const mongoose = require('mongoose');

const Product = require("../models/Product.model");
const Pantry = require("../models/Pantry.model")


//***** RETREIVE PANTRY PRODUCT DETAILS *****//
router.get('/:productId', (req, res, next) => {

  const { productId } = req.params

  Product.findById(productId)
  .then(product => {
    res.json(product)
  })
  .catch(error => console.log(error))
})


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


//***** HANDLE PRODUCT QUANTITY CHANGE ******//
router.put('/change/:productId', (req, res, next) => {

  const { productId } = req.params
  const { productQty } = req.body

  Product.findByIdAndUpdate(productId, { qty: productQty})
  .then(updatedProduct => {
    res.json(updatedProduct);
  })
  .catch(error => console.log(error))
})


//***** HANDLE PRODUCT REMOVAL ******//
router.delete('/remove/:productId', (req, res, next) => {

  const { productId } = req.params

  Product.findByIdAndDelete(productId)
    .then(productRemoved => {
      return Pantry.findByIdAndUpdate(productRemoved.pantryId, { $pull: { products: productRemoved._id } })
    })
    .then(() => {
      console.log('Product removed from pantry');
      res.json('Product removed from pantry');
    })
    .catch(error => console.log(error))

})


module.exports = router;