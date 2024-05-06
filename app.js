"use strict";

// Cute little additions
const express = require("express");
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

// Endpoint creates a new account
app.post('/cookiejar/newuser', async (req, res) => {
  const db = await getDBConnection();
  try {
    let username = req.body.username.toString();
    let password = req.body.password.toString();
    let eventname = req.body.eventname.toString();
    let partysize = req.body.partysize.toString();
    let date = req.body.date.toString();
    if(username && password && eventname && partysize && date) {
      // check that the user name does not already exist
      let usernameExists = await db.get('SELECT * FROM users WHERE username =?;', username);
      // if username does not exist --> add to database
      if(usernameExists) {
        res.status(400).type('text');
        res.send('Username already exists please select a new one!');
      } else {
        await db.run('INSERT INTO users(username, password, "event-name", "party-size", date) VALUES (?, ?, ?, ?, ?)', [username, password, eventname, partysize, date]);
        res.type('text');
        res.send('Account created successfully');
      }
    } else {
      res.status(400).type('text');
      res.send('Please fill out all fields!');
    }
    // to do: update the user table with the client inputed information from the form
  } catch (err) {
    await db.close();
    res.status(500).type('text');
    res.send('Uh oh spaghettios!');
  }
});

// Endpoint allows the user to login
app.post('/cookiejar/login', async (req, res) => {
  const db = await getDBConnection();
  try {
    let username = req.body.username.toString();
    let password = req.body.password.toString();
    if(username && password) {
      // 1) check that the username and password combo exists
      let verifyUsernamePassword = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
      await db.close();
      if(verifyUsernamePassword) {
        res.json(verifyUsernamePassword);
      } else {
        res.status(400).type('text');
        res.send('Account does not exist');
      }
    } else {
      res.status(400).type('text');
      res.send('Missing either username or password.');
    }
    // to do: update the user table with the client inputed information from the form
  } catch (err) {
    await db.close();
    res.status(500).type('text');
    res.send('Uh oh spaghettios!');
  }
});

// Endpoint retrieves all products, or information for an individual product if specified
app.get('/cookiejar/products', async (req, res) => {
  const db = await getDBConnection();
  try {
    let product = req.query.name;
    if (product) {
      // get where that data equals the shortname // maybe save that as the article id?
      let productInfo = await db.get('SELECT * FROM products WHERE shortname =?;', product);
      await db.close();
      res.type('json');
      res.send(productInfo);
    } else {
      let myProducts = await db.all('SELECT * FROM products;');
      await db.close();
      res.type('json');
      res.send(myProducts);
    }
  } catch (err) {
    await db.close();
    res.status(500).type('text');
    res.send('Uh oh spaghettios!');
  }
});

// Endpoint for processing a new transaction
app.post('/cookiejar/transaction/new', async (req, res) => {
  const db = await getDBConnection();
  try {
    // access all parameters required to insert into table
    let username = req.body.username.toString();
    let productname = req.body.productname.toString();
    let quantity = req.body.quantity.toString();
    let price = req.body.price.toString();
    let totalCost = req.body.totalCost.toString();
    if(productname && quantity && price && totalCost) {
      // check that user can purchse desired quantity (Query to products table)
      let productStock = await db.get('SELECT quantity FROM products WHERE "display-name" =?;', productname);
      let currStock = productStock.quantity;
      let newStock = currStock - quantity;
      if(newStock >= 0) {
      // 1) generate new transaction code + check that it doesn't already exist in the data table
        let num =  Math.floor(Math.random() * 2000);
        let transactionCode = num + "a";
        // check that the transaction code does not already exist in the transaction data table
          // get access to all the transaction codes in the data base
        let allExistingCodes = await db.all('SELECT "confirmation-number" FROM transactions');
        if(allExistingCodes.length !== 0) {
          // for loop through the existing transaction codes and if there is a match generate a new one
          for(let i=0; i<allExistingCodes.length; i++) {
            if(allExistingCodes[i]['confirmation-number'] === transactionCode) {
              transactionCode = Math.floor(Math.random() * 2000) + "a";
            }
          }
        }
        // 2) insert new row into transactions table (at this point transaction code is unique)
        let insertTransaction = await db.run('INSERT INTO transactions("confirmation-number", username, "display-name", quantity, "total-cost") VALUES (?, ?, ?, ?, ?)', [transactionCode, username, productname, quantity, totalCost]);
        // 3) Update the products table with the new quantity
        await db.run('UPDATE products SET quantity = ? WHERE "display-name" = ?', [newStock, productname]);
        // 4) send back text string --> Confirmation Code: the generated code
        await db.close();
        res.type('text');
        let sendString = "Transaction Code: " + transactionCode;
        res.send(sendString);
      } else {
        await db.close();
        res.status(400).type('text');
        res.send('Quantity selected not available for purchase');
      }
    } else {
      await db.close();
      res.status(400).type('text');
      res.send('Please fill out quantity!');
    }
  } catch(err) {
    await db.close();
    res.status(500).type('text');
    res.send('Uh oh spaghettios!');
  }
});

// Endpoint filters - sends back the shortnames of products that meet the filter
app.post('/cookiejar/filter', async (req, res) => {
  let db = await getDBConnection();
  try {
    let allergen = req.body.allergen; // gf, nf, nd, no_allergen
    let occasion = req.body.occasion; // any_occasion, baby, seasonal, wedding, funeral
    let type = req.body.type; // cookie, cake, pastry, any_type
    if (allergen && occasion && type) {
      if (sanitizeFilter(allergen, occasion, type)) {
        let myQry1 = 'SELECT p.shortname FROM filters f, products p WHERE p.id = f.product_id AND ';
        let myQry2 = 'f.' + allergen + '= "t" AND f.' + occasion + '= "t" AND f.' + type + '= "t";';
        let filteredShortnames = await db.all(myQry1 + myQry2);
        await db.close();
        res.type('json');
        res.send(filteredShortnames);
      } else {
        res.status(400).type('text');
        res.send('Bad input');
      }
    } else {
      res.status(400).type('text');
      req.send('Missing one or more of the required parameters');
    }
  } catch {
    await db.close();
    res.status(500).type('text');
    res.send('Something went wrong on our end');
  }
});

// Endpoint to leave a review
app.post('/cookiejar/review/new', async (req, res) => {
  let db = await getDBConnection();
  try {
    let user = req.body.username;
    let score = req.body.score;
    let product = req.body.product;
    if (user && score && product) {
      if (await verifyReview(db, user, score, product)) {
        let qry = 'INSERT INTO reviews(product_name, text, score, username) VALUES (?, ?, ?, ?);'
        let reviewText = req.body.text;
        await db.run(qry, product, reviewText, score, user);
        await updateProduct(db, product, score);
        res.type('text');
        res.send('Thanks for your feedback!');
      } else {
        res.status(400).type('text');
        res.send('product has already been reviewed, score was not 1-5, or product is not real');
      }
    } else {
      res.status(400).type('text');
      res.send('Missing one or more parameters.');
    }
  } catch {
    res.status(500).type('text');
    res.send('Something went wrong on our end');
  }
});

// Endpoint to get all current reviews
app.get('/cookiejar/reviews', async (req, res) => {
  let db = await getDBConnection();
  try {
    let myReviews = await db.all('SELECT * FROM reviews');
    await db.close();
    res.type('json');
    res.send(myReviews);
  } catch {
    res.status(500).type('text');
    res.send('something went wrong on our end');
  }
});

// Endpoint gets the transaction history for a given user
app.get('/cookiejar/transaction/history/:username', async (req, res) => {
  const db = await getDBConnection();
  try {
    let username = req.params.username;
    // send back all transactions that match user name
    let allTransactions = await db.all('SELECT "confirmation-number", "display-name", "quantity", "total-cost" FROM transactions WHERE username = ?', username);
    res.json(allTransactions);
  } catch {
    await db.close();
    res.status(500).type('text');
    res.send('oopsie doopsie!');
  }
});

// Endpoint searches for product display names that match the query
app.get('/cookiejar/search', async (req, res) => {
  const db = await getDBConnection();
  try {
    // grab that search term
    // if there is no search term, send an error
    let searchTerm = req.query.search;
    if (searchTerm) {
      searchTerm = searchTerm.trim();
      searchTerm = '%' + searchTerm + '%';
      let myQry = 'SELECT shortname FROM products WHERE "display-name" LIKE ?;';
      let searchResults = await db.all(myQry, searchTerm);
      await db.close();
      res.type('json');
      res.send(searchResults);
    } else {
      res.status(400).type('text');
      res.send('Please input a search term');
    }
  } catch {
    await db.close();
    res.status(500).type('text');
    res.send('oopsie doopsie!');
  }
});

// function verifies that a review can go through
async function verifyReview(db, user, score, product) {
  // check if this is a real product
  let isProduct = await db.get('SELECT * FROM products WHERE shortname LIKE ?', product);
  if (!isProduct) {
    return false;
  }
  // check if user has already reviewed this product
  let myQry = 'SELECT * FROM reviews WHERE username = ? AND product_name = ?';
  let checkPrevious = await db.get(myQry, user, product);
  if (checkPrevious) {
    await db.close();
    return false;
  } else {
    // check if score is numerical 1-5
    score = parseInt(score);
    if (isNaN(score)) {
      await db.close();
      return false;
    } else if (score > 5 || score < 1) {
      return false;
    }
  }
  return true;
}

// function updates a product's rating when it is reviewed
async function updateProduct(db, product, score) {
  let myQry = 'SELECT "rating-score" FROM products WHERE shortname = "' + product + '";';
  let tScr = await db.get(myQry);
  myQry = 'SELECT "num-ratings" FROM products WHERE shortname = "' + product + '";'
  let nRate = await db.get(myQry);
  tScr = tScr['rating-score'] + parseInt(score);
  nRate = nRate['num-ratings'] + 1;
  myQry = 'UPDATE products SET "rating-score" = ' + tScr + ' WHERE shortname = "' + product + '";';
  await db.run(myQry);
  myQry = 'UPDATE products SET "num-ratings" = ' + nRate + ' WHERE shortname = "' + product + '";';
  await db.run(myQry);
  return true;
}

// Function sanitizes the filter inputs
function sanitizeFilter(allergen, occasion, type) {
  let myAllergens = ['nd', 'gf', 'nf', 'no_allergen'];
  let myOccasions = ['any_occasion', 'baby', 'wedding', 'seasonal', 'funeral'];
  let myTypes = ['any_type', 'cookie', 'cake', 'pastry'];
  if (!myAllergens.includes(allergen)) {
    return false;
  }
  if (!myOccasions.includes(occasion)) {
    return false;
  }
  if (!myTypes.includes(type)) {
    return false;
  }
  return true;
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'cookiejar.db',
    driver: sqlite3.Database
  });
  return db;
}

// Some footer info ig
app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);