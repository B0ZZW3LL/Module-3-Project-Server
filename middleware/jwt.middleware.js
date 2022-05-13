const { expressjwt: jwtMiddleware } = require("express-jwt");

const isAuthenticated = jwtMiddleware({
  secret: process.env.TOKEN_SECRET,
  algorithms: ["HS256"],
  requestProperty: 'payload', 
  getToken: getTokenFromHeaders
});

// Function checks request Header 'Authorization' for a token..
function getTokenFromHeaders (req) {
  
  // If token present, let's split the token value away from the 'Bearer' prefix...
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
 
    const token = req.headers.authorization.split(" ")[1];
    return token;
  } 
  
  return null;
}

module.exports = {
  isAuthenticated
}