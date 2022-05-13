const router = require("express").Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

const { isAuthenticated } = require('./../middleware/jwt.middleware');



//***** HANDLE NEW USER CREATION/SIGNUP *****//
router.post('/signup', (req, res, next) => {
  const { displayName, email, password } = req.body;

  // ensure all form fields were provided //
  if ( displayName === '' || email === '' || password === '') {
    res.status(400).json({ message: 'All fields must be provided'});
    return;
  }

  // ensure email provided is of valid format //
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }

  // ensure password provided is of valid format //
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 8 characters, one number and at least one uppercase letter.' });
    return;
  }

  // above has all "passed", let's see if email provided is already associated with a user //
  User.findOne({email})
  
    .then(foundUser => {
      if(foundUser) {
      res.status(400).json({ message: 'Email already exists'});
      return;
      }

      // if not let's hash they password provided from form
      const hashedPassword = bcrypt.hashSync(password, 10);

      // now let's create our "new user"
      return User.create({ displayName, email, password: hashedPassword });

    })

    .then((createdUser) => {
      // deconstruct the newly created user object, minus password..
      const { displayName, email, _id } = createdUser;

      // new user object created to be shared 
      const payload = { displayName, email, _id };

      const authToken = jwt.sign( 
        payload,
        process.env.TOKEN_SECRET,
        { algorithm: 'HS256', expiresIn: "6h" }
      );

      res.status(201).json({user:payload, authToken: authToken})
    })

    .catch(error => {
      console.log(error);
      res.status(500).json({ message: 'Interal Server Error' })
    })

});



//***** HANDLE USER LOGIN *****//
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  User.findOne({ email })
    .then((foundUser) => {
    
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." })
        return;
      }
 
      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
 
      if (passwordCorrect) {
        // Deconstruct the user object and omit the password from what will be payload
        const { displayName, email, _id } = foundUser;
        
        // Create an object that will be set as the token payload
        const payload = { displayName, email, _id };
 
        // Create and sign the token
        const authToken = jwt.sign( 
          payload,
          process.env.TOKEN_SECRET,
          { algorithm: 'HS256', expiresIn: "6h" }
        );
 
        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
 
    })
    .catch(err => res.status(500).json({ message: "Internal Server Error" }));

})



// ***** HANDLE JWT TOKEN VERIFICATION *****//
router.get('/verify', isAuthenticated, (req, res, next) => {       
  // If JWT token is valid the payload gets decoded by the isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);
 
  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

module.exports = router;