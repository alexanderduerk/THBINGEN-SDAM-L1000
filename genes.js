const searchArg = require('./searchargs');

/**
 * Checks if the type of a given value matches the expected type.
 *
 * @param {any} value - The value to be checked.
 * @param {string} expectedType - The expected type of the value.
 * @throws {TypeError} If the type of the value does not match the expected type.
 */
function checkType(value, expectedType) {
  if (typeof value !== expectedType) {
    // throw a type error
    throw new TypeError(`Expected ${expectedType}, got ${typeof value}`);
  }
}

/**
 * Initializes a new instance of the Genes class with the given key-value pairs.
 *
 * @param {Object} keyValuePairs - An object containing key-value pairs representing the attributes and their values.
 * @throws {TypeError} If the type of a value does not match the expected type.
 */
class Genes {
  constructor(keyValuePairs) {
    const expectedTypes = {
      entrez_id: 'number',
      gene_symbol: 'string',
      ensembl_id: 'string',
      gene_title: 'string',
      gene_type: 'string',
      src: 'string',
      feature_space: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }

  /**
   * Creates a new record in the 'genes' table of the database with the values from the instance.
   *
   * @param {Object} dbconnection - The connection object to the database.
   * @return {Promise<Object>} The newly inserted cell object.
   */
  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define the sql statement
    const sql = `INSERT INTO genes (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted cell
    const newcell = await dbconnection.get(
      'SELECT * FROM genes WHERE cell_name = ?',
      this.cell_name
    );
    return newcell;
  }

  /**
   * Deletes a single row from the "genes" table with the given gene_id.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {number} geneid - The id of the row to delete.
   * @return {Promise<void>} A promise that resolves when the row is deleted.
   */
  static async deleteOne(dbconnection, geneid) {
    const sql = 'DELETE FROM genes WHERE gene_id = ?';
    const dbres = await dbconnection.run(sql, geneid);
    // return a console.log that the given cell was deleted
    console.log(`Cell with cell_id: ${geneid} was deleted`);
  }

  /**
   * Updates a single row in the "genes" table with the given id, column, and new value.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {number} id - The id of the row to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {Promise<object>} A Promise that resolves to the updated row.
   */
  static async updateOne(dbconnection, id, column, newvalue) {
    const sql = `UPDATE genes SET ${column} = ? WHERE gene_id = ${id}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return the newly updated Row
    const updatedCell = await dbconnection.get(
      'SELECT * FROM genes WHERE cell_id = ?',
      id
    );
    return updatedCell;
  }

  /**
   * Searches the database based on the provided search arguments, limit, offset, and database connection.
   *
   * @param {any} searcharg - The search arguments to filter the results.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from the beginning of the results.
   * @param {object} dbconnection - The database connection object.
   * @return {Promise<Array>} An array of database results matching the search criteria.
   */
  static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'genes')
        : 'SELECT * FROM genes';
    console.log(`SQL generated to search Genes:\n${JSON.stringify(searchSql)}`);
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }

  /**
   * Searches the database based on the provided search arguments, limit, offset, and database connection.
   *
   * @param {any} searcharg - The search arguments to filter the results.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from the beginning of the results.
   * @param {object} dbconnection - The database connection object.
   * @return {Promise<Array>} An array of database results matching the search criteria.
   */
  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'genesUI')
        : 'SELECT * FROM genes';
    console.log(`SQL generated to search Genes:\n${JSON.stringify(searchSql)}`);
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    // Done
    console.log(dbResult);
    return dbResult;
  }
  // get by ID

  static async readById(id, dbconnection) {
    console.log(id);
    const sql = 'SELECT * FROM genes WHERE gene_id = ?';
    const dbres = await dbconnection.get(sql, id);
    console.log(dbres);
    return dbres;
  }
}

module.exports = Genes;
