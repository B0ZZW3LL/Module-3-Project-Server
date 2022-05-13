const router = require("express").Router();
const mongoose = require('mongoose');

const User = require("../models/User.model");
const Pantry = require("../models/Pantry.model");

// const { isAuthenticated } = require('./../middleware/jwt.middleware');


//***** RETREIVE PANTRIES BY "OWNER" *****//
router.get('/:userId', (req, res, next) => {

  const { userId } = req.params

  Pantry.find( {owner: userId } )
    .then(pantriesFound => {
      console.log(pantriesFound)
      res.json(pantriesFound)
    })
    .catch(error => console.log(error))

})


//***** HANDLE NEW PANTRY CREATION *****//
router.post('/create', (req, res, next) => {

  const { pantryName, pantryOwner } = req.body

  Pantry.create( {owner: pantryOwner, name: pantryName } )
    .then(pantryCreated => {
      console.log(`${pantryCreated.name} has been created.`)
      res.json(`${pantryCreated.name} has been created.`)
      return User.findByIdAndUpdate(pantryOwner, { $push: { pantries: pantryCreated._id}})
    })
    .catch(error => console.log(error))
})


//***** HANDLE PANTRY NAME CHANGE *****//
router.put('/edit/:pantryId', (req, res, next) => {

  const { pantryId } = req.params
  const { pantryName } = req.body

  if (!mongoose.Types.ObjectId.isValid(pantryId)) {
    res.status(400).json({ message: 'Provided pantry id is not valid' });
    return;
  }
  
  Pantry.findByIdAndUpdate(pantryId, { name:pantryName }, { new: true })
    .then((updatedPantry) => res.json(updatedPantry))
    .catch(error => console.log(error))
})


//***** HANDLE PANTRY DELETION & REMOVE OWNER REFERENCE ******//
router.post('/delete/:pantryId', (req, res, next) => {

  const { pantryId } = req.params

  if (!mongoose.Types.ObjectId.isValid(pantryId)) {
    res.status(400).json({ message: 'Provided pantry id is not valid' });
    return;
  }

  Pantry.findById(pantryId)
    .then(pantryFound => {
      if (pantryFound.products.length === 0) {
        Pantry.findByIdAndDelete(pantryId)
          .then(pantryRemoved => {
            // ** without the 'return', it will not actually remove the pantry reference from user?!? ** //
            return User.findByIdAndUpdate(pantryRemoved.owner, { $pull: { pantries: pantryRemoved._id} })
          })
          .then(() => {
            res.json({ message: `Pantry ${pantryId} has been deleted.` })
          })
      } else {
        res.status(400).json({ message: 'Cannot delete pantries which contain items..' })
      }
    })
    .catch(err => console.log(err))
})


module.exports = router;

 