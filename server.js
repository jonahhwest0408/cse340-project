/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute") 
const errorRoute = require('./routes/errorRoute');
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require('./routes/accountRoute');
const utilities = require("./utilities/")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(cookieParser())

app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))

//Index Route
app.get("/", baseController.buildHome)

// Inventory routes - Unit 3
app.use("/inv", inventoryRoute)

//Account routes - Unit 4
app.use("/account", accountRoute);

// // Error route
// app.use('/error', errorRoute);

// // Error-handling middleware (place this after all other routes)
// app.use((err, req, res, next) => {
//   // Set the error status if not already set
//   res.status(err.status || 500);

//   // Render the error view, passing in the error details and dynamic nav
//   res.render('error', { 
//     title: 'Server Error', 
//     message: 'Something went wrong on the server.', 
//     error: err,
//     nav: req.app.locals.nav // Assuming you store nav data in app.locals
//   });
// });

// Catch-all for 404 errors
// app.use((req, res, next) => {
//   res.status(404).render('404', {
//       layout: false // Render without layout if needed
//   });
// });


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
