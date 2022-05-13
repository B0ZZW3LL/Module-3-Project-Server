require("dotenv/config");
require("./db");

const express = require("express");

// Middleware for "route protection" - JWT request extraction/validation
const { isAuthenticated } = require('./middleware/jwt.middleware')

const app = express();

// This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);


//***** ROUTES *****//


const allRoutes = require("./routes/index.routes");
app.use("/api", allRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const pantryRoutes = require("./routes/pantry.routes");
app.use("/pantry", isAuthenticated, pantryRoutes);

const productRoutes = require("./routes/product.routes");
app.use("/product", isAuthenticated, productRoutes);


//***** HANDLE ERRORS *****//
require("./error-handling")(app);

module.exports = app;
