const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Get vehicle details by vehicleId
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
    const vehicleId = req.params.vehicleId; //fetch vehicleId from route
    const vehicleData = await invModel.getVehicleById(vehicleId); //query DB for vehicle details
    let nav = await utilities.getNav();
  
    if (vehicleData) {
      res.render("./inventory/vehicleDetail", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        vehicleData, //pass the data to the view
      });
    } else {
      res.status(404).send("Vehicle not found");
    }
  };

module.exports = invCont