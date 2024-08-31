const searchArg = require('./searchargs');

/** Typechecking functino to detect type errors early
 * @param {string, number, boolean}
 * @param {string, number, boolean}
 */
function checkType(value, expectedType) {
  if (typeof value !== expectedType) {
    //throw a type error
    throw new TypeError(`Expected ${expectedType}, got ${typeof value}`);
  }
}

/**
 * Datamodel defines all data for the pertubations table
 */
/**
 * Represents a pertubation with various attributes
 */
class Perturbagens {
  /**
   * Constructor for the cellinfos class
   * @param {HashMap} keyValuePairs - Attributes and their values
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      pert_name: 'string',
      cmap_name: 'string',
      gene_target: 'string',
      moa: 'string',
      canonical_smiles: 'string',
      inchi_key: 'string',
      compound_aliases: 'string',
    };
    // use a dymaic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }
  /**
   * Write Function for inserting the instance into the db
   * @param {instance}
   */

  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define sql statement
    const sql = `INSERT INTO perturbagens (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted cell
    const newpertid = await dbconnection.get(
      `SELECT * FROM perturbagens WHERE pert_name = ?`,
      this.pert_name
    );
    return newpertid;
  }

  /**
   * Delete Function for the pert_id table
   * @param {dbconnection, pert_id}
   */
  // sql statement
  static async deleteOne(dbconnection, pertid) {
    const sql = `DELETE FROM perturbagens WHERE pert_id = ?`;
    const dbres = await dbconnection.run(sql, `${pertid}`);
    // return a console.log that the given pertubagens was deleted
    console.log(`Perturbagens with pert_id: ${pertid} was deleted`);
  }
  /**
   * Updates a single row in the "compound" table with the given id, column, and new value
   *
   * @param {object} dbconnection - The database connection object.
   * @param {number} id - The id of the row to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {Promise<object>} - A Promise that resolves to the updated row.
   */

  /**
   * Update/Patch Function for pert_id table
   * @param {dbconnection, pert_id, column, newvalue}
   */
  static async updateOne(dbconnection, pertid, column, newvalue) {
    const sql = `UPDATE perturbagens SET ${column} = ? WHERE pert_id = ${pertid}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return a console.log that the given pertubagens was updated
    console.log(`Pertubagens with ${pertid} was updated`);
    const updatedPerturbagens = await dbconnection.get(
      'SELECT * FROM perturbagens WHERE pert_id = ?',
      pertid
    );
    return updatedPerturbagens;
  }

  static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'perturbagens')
        : 'SELECT * FROM perturbagens';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }

  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'perturbagensUI')
        : 'SELECT * FROM perturbagens';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }

  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'perturbagensUI')
        : 'SELECT * FROM perturbagens';
    console.log(
      `SQL generated to search Compounds:\n${JSON.stringify(searchSql)}`
    );
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }
  // get by ID

  static async readById(id, dbconnection) {
    console.log(id);
    const sql = 'SELECT * FROM perturbagens WHERE pert_id = ?';
    const dbres = await dbconnection.get(sql, id);
    console.log(dbres);
    return dbres;
  }
}

module.exports = Perturbagens;
