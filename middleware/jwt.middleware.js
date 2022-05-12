const { expressjwt: jwtMiddleware } = require("express-jwt");

const isAuthenticated = jwtMiddleware({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: 'payload', 
  getToken: getTokenFromHeaders
});

// Function checks request 'Authorization' Headers for a token
function getTokenFromHeaders (req) {
  
  // we are returned an array with bearer in index 1(0) and the string in 2(1)
  // Check if the token is available on the request Headers
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
 
    // Get the encoded token string and return it
    const token = req.headers.authorization.split(" ")[1];
    return token;
  } 
  
  return null;
}

module.exports = {
  isAuthenticated
}