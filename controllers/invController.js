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

/* ***************************
 *  Build management view for inventory
 * ************************** */
invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav(); // Fetch navigation if needed
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav, 
    errors: null,
    messages: req.flash("info") // Handle flash messages
  });
};

/* ***************************
 *  Render Add Classification Form
 * ************************** */
invCont.buildAddClassificationView = async function(req, res, next) {
  let nav = await utilities.getNav(); // Fetch navigation
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    messages: req.flash("info"),
  });
};

/* ***************************
 *  Process Add Classification Form
 * ************************** */
invCont.addClassification = async function(req, res, next) {
  const { classificationName } = req.body;

  // Server-side validation: no spaces or special characters allowed
  const nameRegex = /^[a-zA-Z0-9]+$/;
  if (!nameRegex.test(classificationName)) {
    req.flash("error", "Classification name cannot contain spaces or special characters.");
    return res.redirect("/inv/add-classification");
  }

  try {
    // Call the model function to insert the classification
    const result = await invModel.insertClassification(classificationName);

    if (result) {
      // Regenerate navigation to include new classification
      let nav = await utilities.getNav();

      // Success message
      req.flash("info", "New classification added successfully!");

      // Render the management view with the updated navigation
      res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash("info"),
      });
    } else {
      throw new Error("Failed to add classification.");
    }
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Render Add Inventory Form
 * ************************** */
invCont.addInventoryView = async function (req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    let nav = await utilities.getNav();
    
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      flashMessage: req.flash("flashMessage"),
      errors: req.flash("error"),
    });
  } catch (error) {
    console.error("Error rendering add inventory view:", error);
    res.status(500).send("Internal Server Error");
  }
};

/* ***************************
 *  Process Add Inventory Form
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const { inv_make, inv_model, inv_year, inv_price, classification_id, inv_thumbnail, inv_image } = req.body;

  let errors = [];

  if (!inv_make || !inv_model || !inv_year || !inv_price || !classification_id) {
    errors.push("All fields are required.");
  }

  if (errors.length > 0) {
    const classificationList = await utilities.buildClassificationList(classification_id);
    let nav = await utilities.getNav();
    
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors,
      vehicle: { inv_make, inv_model, inv_year, inv_price, inv_thumbnail, inv_image },
    });
  } else {
    try {
      await invModel.addInventory({ inv_make, inv_model, inv_year, inv_price, classification_id, inv_thumbnail, inv_image });
      req.flash('flashMessage', 'Vehicle added successfully!');
      res.redirect('/inventory');
    } catch (error) {
      console.error("Error adding inventory:", error);
      req.flash('flashMessage', 'Failed to add vehicle.');
      res.redirect('/inventory/add');
    }
  }
};

module.exports = invCont