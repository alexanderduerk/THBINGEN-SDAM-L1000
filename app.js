// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const Cells = require('./cells');
const Genes = require('./genes');
const Perturbagens = require('./pertubations');
const Signatureinfo = require('./siginfo');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// allow static file useage
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON data (if needed, for other parts of your app)
app.use(bodyParser.json());

// Basic route for homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Basic route for about
app.get('/about', (req, res) => {
  res.render('about');
});

// Basic route for contact
app.get('/contact', (req, res) => {
  res.render('contact');
});

/**
 * All Routes connected to the cellinfos table
 * This will include Update, Delete and Search
 */
app.post('/cells', async (req, res) => {
  let db;
  // Connect to the Database
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Create a new instance of the Cell class
    const CellInfo = new Cells(req.body);
    // Call Create One on the instance
    const newCell = await CellInfo.createOne(db);
    // send the newly created Cell as JSON
    res.json(newCell);
    // catch errors and return 400 when any error occurs
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
    // close the db connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Cellinfos table
 */
app.post('/cells/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  // check if the searchArg is a string for UI parsing
  if (searchArgString && typeof searchArgString === 'string') {
    // use middleware to parse the searchArg and convert from string to object
    try {
      searchArg = JSON.parse(searchArgString);
      // catch errors and return 400 when any error occurs
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
    // else use the searchArg as an object directly
  } else {
    searchArg = searchArgString;
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  // try to connect to the db
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // use the search Arg to query the db
    const cells = await Cells.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      // render the table if the request accepts HTML
      res.render(
        'cellstable.ejs',
        // hand data and searchArg to the ejs file
        { data: cells, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
      // return the data as JSON if the request accepts JSON
    } else if (req.accepts('json')) {
      res.json(cells);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Cellinfos table
 */
app.post('/cells/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  // check if the searchArg is a string for UI parsing
  if (searchArgString && typeof searchArgString === 'string') {
    try {
      // use middleware to parse the searchArg and convert from string to object
      searchArg = JSON.parse(searchArgString);
      // catch errors and return 400 when any error occurs
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
    // else use the searchArg as an object directly
  } else {
    searchArg = searchArgString;
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db with the searchArg
    const cells = await Cells.searchUI(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      // render the table if the request accepts HTML
      res.render(
        'cellstable.ejs',
        // hand data and searchArg to the ejs file
        { data: cells, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
      // return the data as JSON if the request accepts JSON
    } else if (req.accepts('json')) {
      res.json(cells);
    }
    // catch errors and return 500 when any error occurs
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Delete Request for Cellinfos table
 */
// Route to handle DELETE requests to /cells/:name
app.delete('/cells/:id', async (req, res) => {
  // Connect to the Database
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Extract the cell name from the request parameters
    const cellid = req.params.id;

    // Call the deleteOne method from the Cellinfos class
    await Cells.deleteOne(db, cellid);

    // Send a success response
    res.status(200).send(`Cell with ${cellid} was deleted`);
  } catch (error) {
    console.error(error);
    // Send an error response
    res.status(500).send('Internal Server Error');
    // Close the database connection if it was opened
  } finally {
    if (db) {
      await db.close(); // Close the database connection if it was opened
    }
  }
});

/**
 * UpdateOne for the cells table
 */
app.patch('/cells', async (req, res) => {
  // Connect to the Database
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Extract the required parameters from the request parameters
    const { cellid, columnname, newvalue } = req.body;
    // Call the updateOne function from the cells class
    const updatedCell = await Cells.updateOne(db, cellid, columnname, newvalue);
    // Send the updated cell record
    res.json(updatedCell);
    // catch errors and return 500 when any error occurs
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
    // close the db connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Post Function for the genes table
 */
app.post('/genes', async (req, res) => {
  // Connect to the Database
  let db;
  // Connect to the Database
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Create a new instance of the Cell class
    const GeneInstance = new Genes(req.body);
    // Call Create One on the instance
    const newGene = await GeneInstance.createOne(db);
    // send the newly created Cell as JSON
    res.json(newGene);
    // catch errors and return 400 when any error occurs
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
    // close the db connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the genes table
 */
app.post('/genes/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  // check if the searchArg is a string for UI parsing
  if (searchArgString && typeof searchArgString === 'string') {
    // use middleware to parse the searchArg and convert from string to object
    try {
      searchArg = JSON.parse(searchArgString);
      // throw an error if the searchArg cannot be parsed
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
    // if the searchArg is an object, use it as is
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db with the searchArg
    const genes = await Genes.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // render the table if the request accepts html
    if (req.accepts('html')) {
      res.render(
        'cellstable.ejs',
        // pass the data to the ejs template
        { data: genes, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
      // render the table if the request accepts json
    } else if (req.accepts('json')) {
      res.json(genes);
    }
    // catch errors and return 500 when any error occurs
  } catch (e) {
    console.error(e);
    res.status(500);
    // close the db connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Cellinfos table
 */
app.post('/genes/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  if (searchArgString && typeof searchArgString === 'string') {
    // use middleware to parse the searchArg and convert from string to object
    try {
      searchArg = JSON.parse(searchArgString);
      // throw an error if the searchArg cannot be parsed
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
    // if the searchArg is an object, use it as is
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const genes = await Genes.searchUI(searchArg, searchArg.offset, searchArg.limit, db);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'genes.ejs',
        // hand data and searchArg to the ejs file
        { data: genes, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
      // return the data as JSON if the request accepts JSON
    } else if (req.accepts('json')) {
      res.json(genes);
    }
    // catch errors and return 500 when any error occurs
  } catch (e) {
    console.error(e);
    res.status(500);
    // close the db connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Delete Request for Cellinfos table
 */
// Route to handle DELETE requests to /cells/:name
app.delete('/genes/:id', async (req, res) => {
  // Initialize the db variable
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Extract the cell name from the request parameters
    const genesId = req.params.id;
    // Call the deleteOne method from the Cellinfos class
    await Cells.deleteOne(db, genesId);
    // Send a success response
    res.status(200).send(`Cell with ${genesId} was deleted`);
    // Catch any errors and send an error response
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
    // Close the database connection if it was opened
  } finally {
    if (db) {
      await db.close(); // Close the database connection if it was opened
    }
  }
});

/**
 * UpdateOne for the genes table
 */
app.patch('/genes', async (req, res) => {
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Extract the required parameters from the request parameters
    const { geneid, columnname, newvalue } = req.body;
    // Call the updateOne function from the cells class
    const updatedGene = await Cells.updateOne(db, geneid, columnname, newvalue);
    // Send the updated gene as a response
    res.json(updatedGene);
  } catch (err) {
    // Catch any errors and send an error response
    console.log(err);
    res.status(400).send('Internal server error');
    // Close the database connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Post Function Pertubations
app.post('/perturbations', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Create a new instance of the Pertubagens class
    const Perturbagensinstance = new Perturbagens(req.body);
    // Call Create One on the instance
    const newperdid = await Perturbagensinstance.createOne(db);
    // Send the newly created pert_id as a response
    res.json(newperdid);
    // Catch any errors and send an error response
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
    // Close the database connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Pertubations table
 */
app.post('/perturbations/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  // check if the searchArg is a string for UI parsing
  if (searchArgString && typeof searchArgString === 'string') {
    // use middleware to parse the searchArg and convert from string to object
    try {
      searchArg = JSON.parse(searchArgString);
      // catch errors and return 400 when any error occurs
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
    // else use the searchArg as an object directly
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const compounds = await Perturbagens.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Render the table if the request accepts html
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/perts.ejs',
        // hand data and searchArg to the ejs file
        { data: compounds, currentSearchArg: searchArg },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
      // Hand JSON data if the request accepts json
    } else if (req.accepts('json')) {
      res.json(compounds);
    }
    // Catch any errors and send an error response
  } catch (e) {
    console.error(e);
    res.status(500);
    // Close the database connection if it was opened
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Pertubations table
 */
app.post('/perturbations/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  // check if the searchArg is a string for UI parsing
  if (searchArgString && typeof searchArgString === 'string') {
    // use middleware to parse the searchArg and convert from string to object
    try {
      searchArg = JSON.parse(searchArgString);
      // catch errors and return 400 when any error occurs
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
    // else use the searchArg as an object directly
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const compounds = await Perturbagens.searchUI(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/perts.ejs',
        { data: compounds, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(compounds);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Delete Pertubations
app.delete('/perturbations/:id', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Extract the pert_id from the request body
    const pertid = req.params.id;
    // Call deleteOne function
    await Perturbagens.deleteOne(db, pertid);
    res.status(200).send(`Deleted Pertubagens record with pert_id: ${pertid}`);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
// Patch pertubations
app.patch('/perturbations', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: `./l1000.db`,
      driver: sqlite3.Database,
    });
    // Extract the pert_id to be updated from request body
    const { pertid, column, newvalue } = req.body;
    const updatedPerturbagens = await Perturbagens.updateOne(
      db,
      pertid,
      column,
      newvalue
    );
    // Send a success response
    res.json(updatedPerturbagens);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
// Post Function sig_info
app.post('/siginfo', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Create a new instance of the signature_infos class
    const Signatureinstance = new Signatureinfo(req.body);
    // Call Create One on the instance
    const newsigid = await Signatureinstance.createOne(db);
    res.json(newsigid);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
/*
 * Search Request for the sig_info table
 */
app.post('/siginfo/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  if (searchArgString && typeof searchArgString === 'string') {
    try {
      searchArg = JSON.parse(searchArgString);
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const signatures = await Signatureinfo.searchUI(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'siginfo.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      // res.json(signatures);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});
/*
 * Search Request for the sig_info table
 */
app.post('/siginfo/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  if (searchArgString && typeof searchArgString === 'string') {
    try {
      searchArg = JSON.parse(searchArgString);
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const signatures = await Signatureinfo.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/siginfofull.ejs',
        { data: signatures, siteSearchArg: searchArg },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(signatures);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});
// Delete Pertubations
app.delete('/siginfo/:id', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');

    // Extract the pert_id from the request body
    const sigid = req.params.id;
    // Call deleteOne function
    await Signatureinfo.deleteOne(db, sigid);
    res.status(200).send(`Deleted Pertubagens record with pert_id: ${sigid}`);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
// Patch Signatures
app.patch(`/siginfo`, async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: `./l1000.db`,
      driver: sqlite3.Database,
    });
    // Extract the pert_id to be updated from request body
    const { sig_name, column, newvalue } = req.body;
    // Call updateOne function
    const updatedSignatureinfo = await Signatureinfo.updateOne(
      db,
      sig_name,
      column,
      newvalue
    );
    // Send a success response
    res.json(updatedSignatureinfo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});
/*
 * Search Request for the genetargets table
 */
app.post('/genetargets', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  // Parse the JSON string into an object
  let searchArg;
  if (searchArgString && typeof searchArgString === 'string') {
    try {
      searchArg = JSON.parse(searchArgString);
    } catch (e) {
      console.error('Error parsing searchArg:', e);
      return res.status(400).send('Invalid searchArg format.');
    }
  } else {
    searchArg = searchArgString;
  }
  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    // Query the db
    const signatures = await Signatureinfo.searchcompounds(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/siginfofull.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(signatures);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

app.post('/plots', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const signatures = await Signatureinfo.searchUI(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found signatures:`);
    console.log(signatures);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'plots.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      // res.json(signatures);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Cells Get ID function
app.get('/cells', async (req, res) => {
  let db;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    const cellId = req.query.id; // Extract the cell ID from the URL
    const cell = await Cells.readById(cellId, db); // Call the readById function
    res.json(cell);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving cell');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// siginfo Get ID function
app.get('/siginfo', async (req, res) => {
  let db;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    const sigID = req.query.id; // Extract the isg ID from the URL
    const signature = await Signatureinfo.readById(sigID, db); // Call the readById function
    res.json(signature);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving siginfo');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Compounds Get function
app.get('/pertubations', async (req, res) => {
  let db;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    const pertid = req.query.id; // Extract the isg ID from the URL
    const perturbagen = await Perturbagens.readById(pertid, db); // Call the readById function
    res.json(perturbagen);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving compound');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Compounds Get function
app.get('/genes', async (req, res) => {
  let db;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    const geneid = req.query.id; // Extract the isg ID from the URL
    const gene = await Genes.readById(geneid, db); // Call the readById function
    res.json(gene);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving gene');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

const {
  server: { port },
} = require('./config');
// Start the server
app.listen(port, () => {
  console.log('Server is running');
});
