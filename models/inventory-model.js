const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get vehicle by inv_id
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [vehicleId]
    );
    return data.rows[0]; //return a single vehicle
  } catch (error) {
    console.error("getVehicleById error: " + error);
  }
}

/* ***************************
 *  Insert new classification into the database
 * ************************** */
async function insertClassification(classificationName) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classificationName]);
    return result.rowCount;
  } catch (error) {
    console.error("Error inserting classification:", error);
    throw error;
  }
}

/* ***************************
 *  Insert new vehicle into the database
 * ************************** */
async function addInventory(vehicleData) {
  try {
    const sql = `
      INSERT INTO public.inventory 
      (inv_make, inv_model, inv_year, inv_price, classification_id, inv_thumbnail, inv_image) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const result = await pool.query(sql, [
      vehicleData.inv_make,
      vehicleData.inv_model,
      vehicleData.inv_year,
      vehicleData.inv_price,
      vehicleData.classification_id,
      vehicleData.inv_thumbnail,
      vehicleData.inv_image
    ]);
    return result.rows[0]; // Return the newly inserted vehicle data
  } catch (error) {
    console.error("Error adding vehicle to inventory:", error);
    throw error; // Rethrow the error to be handled in the controller
  }
}



module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, addInventory }