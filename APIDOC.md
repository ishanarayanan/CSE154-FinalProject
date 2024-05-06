# Cookie Jar Catering API
This API allows for catering account creation, login, and provides information about various products.

## Create Account
**Request Format:** /cookiejar/newuser, formdata includes proposed username, password, eventname, partysize, date

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Request allows the creation of a new user. If the username is unique, the new user is stored in the API database. Stored information in the database includes username, password, event name, party size, date.

**Example Request:**  /cookiejar/newuser  POST parameters of username= `futuremrsgosling123`, password= `MeAndRyanForever`, eventname= `Women in Stem Fundraiser`, partysize= `80`, date= `10/6/2023`


**Example Response:**
```
‘Account created successfully’
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - Sends an error message if the proposed new username is already in use: 'Username already exists please select a new one!'
  - One of the formdata fields does not exist: 'Please fill out all fields!'
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `Uh oh spaghettios!`

## Login to existing account
**Request Format:** /cookiejar/login

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Returns a JSON object with the user’s login and event information, including userID, username, password, event-name, party-size, and date

**Example Request:** /cookiejar/login  POST parameters of `username= `baker1234`, password= `carrots`

**Example Response:**

```json
{
     "userId": 1,
     "username": "baker1234",
     "password": "carrots",
     "event-name": "Women in STEM Gala",
     "party-size": 24,
     "date": "11/17/2024"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in username and password pair does not exist in database, returns an error with message ‘Account does not exist’
  - If username or password fields are not filled out, returns an error eith message 'Missing either username or password.'
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `Uh oh spaghettios!`

## Retrieve product information
**Request Format:** /product/:productname

**Request Type:** GET

**Returned Data Format**: JSON Object

**Description:** Returns an object containing all of the information about the requested product.

**Example Request:** GET parameters of `productname=strawberrycreampuff`

**Example Response:**

{
‘Display-name’: “Strawberry Cream Puff”,
‘Shortname’: “strawberrycreampuff”,
‘descriptors’: “Fresh, Airy, Creamy”
‘price’: “4”,
‘num-ratings’: “3”, // The number of ratings received
‘rating-score’: “15”, // The total score of all ratings given
‘quantity’: "50"
}

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If product does not exist, ‘product not found’
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `Something went wrong; please try again.`


## Add a new transaction
**Request Format:** /cookiejar/transaction/new,  formdata includes username, productname, quantity, price, totoalCost

**Request Type:** POST

**Returned Data Format**: Plain text

**Description:** Verifies that user can purchase desired quantity of a product. Based on this, the endpoint will update the quantity field in the products table and add to the transactions table. Returns the transaction code of a succesful transaction.

**Example Request:** /cookiejar/transaction/new  POST parameters of username= `baker1234`, productName= `Cookie Sampler Tray`, quantity = 2, price = 20, totalCost = 40

**Example Response:**
```
‘Transaction Code: 124a’
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - User selects a quantity of a desired product that is too high based on existing stock, returns error with 'Quantity selected not available for purchse'
  - User does not fill out quantity field, returns error with 'Please fill out quantity!'
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `Uh oh spaghettios!`

## Add product rating
**Request Format:** /cookiejar/transaction/history/:username

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves and returns all the transactions that a user has completed stored in the transactions table.

**Example Request:** GET parameters of `username=Delicious Delights Catering`

**Example Response:**
```
{
  [
    "confirmation-number": 1444a,
    "display-name": "Cookie Sampler Tray",
    "quantity": 2,
    "total-cost": 40
  ]
}
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `oopsie doopsie!`

## Add a new transaction
**Request Format:** /cookiejar/transaction/new,  formdata includes username, productname, quantity, price, totoalCost

**Request Type:** POST

**Returned Data Format**: Plain text

**Description:** Verifies that user can purchase desired quantity of a product. Based on this, the endpoint will update the quantity field in the products table and add to the transactions table. Returns the transaction code of a succesful transaction.

**Example Request:** /cookiejar/transaction/new  POST parameters of username= `baker1234`, productName= `Cookie Sampler Tray`, quantity = 2, price = 20, totalCost = 40

**Example Response:**
```
‘Transaction Code: 124a’
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - User selects a quantity of a desired product that is too high based on existing stock, returns error with 'Quantity selected not available for purchse'
  - User does not fill out quantity field, returns error with 'Please fill out quantity!'
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `Uh oh spaghettios!`

## Search for items
**Request Format:** /cookiejar/search?search=

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves and returns shortnames of all products where the Display Name matches the
search term.

**Example Request:** GET parameters of `search=Pink Cupcake'

**Example Response:**
```
{
  shortname: 'pink-cpk'
}
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something goes wrong on the server, returns error with `oopsie doopsie!`
