const searchArg = require('./searchargs');

/**
 * Checks if the type of a value is the expected type.
 *
 * @param {*} value - The value to check the type of.
 * @param {string} expectedType - The expected type of the value.
 * @throws {TypeError} If the type of the value is not the expected type.
 * @return {void}
 */
function checkType(value, expectedType) {
  if (typeof value !== expectedType) {
    // throw a type error
    throw new TypeError(`Expected ${expectedType}, got ${typeof value}`);
  }
}
/**
 * Datamodel defines all data for the signature table
 * Represents a signature with various attributes
 */
class Signatureinfo {
  /**
   * Constructs a new instance of the Signatureinfo class.
   *
   * @param {Object} keyValuePairs - An object containing key-value pairs to initialize the instance.
   * @throws {TypeError} If the type of a value does not match the expected type.
   * @return {void}
   */
  constructor(keyValuePairs) {
    const expectedTypes = {
      sig_name: 'string',
      pert_name: 'string',
      cmap_name: 'string',
      pert_type: 'string',
      cell_name: 'string',
      bead_batch: 'string',
      pert_dose: 'string',
      pert_time: 'string',
      nsamples: 'number',
      cc_q75: 'number',
      ss_ngene: 'number',
      tas: 'number',
      pct_self_rank_q25: 'number',
      wt: 'string',
      median_recall_rank_spearman: 'number',
      median_recall_rank_wtcs_50: 'number',
      median_recall_score_spearman: 'number',
      median_recall_score_wtcs_50: 'number',
      batch_effect_tstat: 'number',
      batch_effect_tstat_pct: 'number',
      is_hiq: 'boolean',
      qc_pass: 'boolean',
      det_wells: 'string',
      det_plates: 'string',
      distil_ids: 'string',
      project_code: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }

  /**
   * Type checking function to validate data types and throw a TypeError if the type does not match the expected type.
   *
   * @param {string} key - The key name of the value being checked
   * @param {*} value - The value to check
   * @param {string} expectedType - The expected data type as a string
   * @throws {TypeError} If the type of a value does not match the expected type
   * @return {void}
   */
  checkType(key, value, expectedType) {
    if (expectedType === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new TypeError(
          `Expected number for ${key}, but got ${typeof value}`
        );
      }
      if (!Number.isInteger(value)) {
        throw new TypeError(`Expected integer for ${key}, but got number`);
      }
    } else if (expectedType === 'boolean') {
      if (typeof value !== 'boolean') {
        throw new TypeError(
          `Expected boolean for ${key}, but got ${typeof value}`
        );
      }
    } else if (typeof value !== expectedType) {
      throw new TypeError(
        `Expected ${expectedType} for ${key}, but got ${typeof value}`
      );
    }
  }

  /**
   * Creates a new signature info in the database.
   *
   * @param {object} dbconnection - The database connection object.
   * @return {object} The newly inserted signature info object.
   */
  async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define sql statement
    const sql = `INSERT INTO signature_infos (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted signature
    const newsigname = await dbconnection.get(
      `SELECT * FROM signature_infos WHERE sig_name = ?`,
      this.sig_name
    );
    return newsigname;
  }

  /**
   * Deletes a signature info from the database.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {string} signame - The name of the signature info to delete.
   * @return {void}
   */
  static async deleteOne(dbconnection, sigid) {
    const sql = `DELETE FROM signature_infos WHERE sig_id = ?`;
    const dbres = await dbconnection.run(sql, `${sigid}`);
  }

  /**
   * Updates a single row in the "signature_infos" table with the given signature name, column, and new value.
   *
   * @param {object} dbconnection - The database connection object.
   * @param {string} signame - The name of the signature info to update.
   * @param {string} column - The column to update.
   * @param {any} newvalue - The new value to set.
   * @return {object} The updated signature info object.
   */
  static async updateOne(dbconnection, sigid, column, newvalue) {
    const sql = `UPDATE signature_infos SET ${column} = ? WHERE sig_id = ${sigid}`;
    const dbres = await dbconnection.run(sql, newvalue);
    // return a console.log that the given pertubagens was updated
    const updatedSignatureinfo = await dbconnection.get(
      'SELECT * FROM signature_infos WHERE sig_id = ?',
      sigid
    );
    return updatedSignatureinfo;
  }

  /**
   * Searches for signature information in the database based on the provided search argument.
   *
   * @param {object} searcharg - The search argument to use for the query.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from which to start returning results.
   * @param {object} dbconnection - The database connection object.
   * @return {array} An array of search results.
   */
  static async search(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'signature_infos')
        : 'SELECT * FROM signature_infos';
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    console.log(JSON.stringify(dbResult));
    return dbResult;
  }

  /**
   * Searches for compounds in the database based on the provided search argument.
   *
   * @param {object} searcharg - The search argument to use for the query.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from which to start returning results.
   * @param {object} dbconnection - The database connection object.
   * @return {array} An array of search results.
   */
  static async searchcompounds(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'genetargets')
        : 'SELECT * FROM signature_infos';
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    console.log(dbResult);
    return dbResult;
  }

  /**
   * Searches for signature information in the database based on the provided search argument.
   *
   * @param {object} searcharg - The search argument to use for the query.
   * @param {number} limit - The maximum number of results to return.
   * @param {number} offset - The offset from which to start returning results.
   * @param {object} dbconnection - The database connection object.
   * @return {array} An array of search results.
   */
  static async searchUI(searcharg, limit, offset, dbconnection) {
    const searchSql =
      searcharg !== undefined && searcharg !== null
        ? searchArg.translateToSQL(searcharg, 'signature_infosUI')
        : 'SELECT * FROM signature_infos';
    // Query the database
    const dbResult = await dbconnection.all(searchSql);
    return dbResult;
  }
  // Read by ID

  static async readById(id, dbconnection) {
    console.log(id);
    const sql = 'SELECT * FROM signature_infos WHERE sig_id = ?';
    const dbres = await dbconnection.get(sql, id);
    console.log(dbres);
    return dbres;
  }
}

module.exports = Signatureinfo;
