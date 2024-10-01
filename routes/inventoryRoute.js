// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display a specific vehicle's detail
router.get("/vehicle/:vehicleId", invController.getVehicleDetail);


module.exports = router;