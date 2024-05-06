/**
 * Chloe Adams, Isha Narayanan
 * 12th December 2023
 * CSE 154
 *
 * This file contains all the Java Script code for the cookiejar website.
 * The functionality that this file enables include: interactivity buttons such as navigators,
 * logging in and creating an account,searching and filtering, and calls to the cookiejar api
 * as well as others and assisting functions.
 *
 * Happy browsing!
 */

'use strict';
(function() {
  window.addEventListener('load', init);

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   */
  function init() {
    addListenersToIntroPage();
    loadProducts();
    id('display-btn').addEventListener('click', togglePartyMode);
    id('about-btn').addEventListener('click', displayAbout);
    id('about-btn').disabled = true;
    id('reviewpage-button').addEventListener('click', displayReview);
    id('reviewpage-button').disabled = true;
    id('profile-btn').addEventListener('click', displayProfile);
    id('profile-btn').disabled = true;
    id('menu-btn').addEventListener('click', displayMenu)
    id('menu-btn').disabled = true;
    id('submit-rvw-btn').addEventListener('click', () => {
      submitReview();
    });
    id('search-btn').addEventListener ('click', runSearch);
    id('search-btn').disabled = true;
    id('pref-btn').addEventListener('click', runFilter);
  }



  /**
   * Navigates the user to the 'about' page
   */
  function displayAbout() {
    id('intro-page').classList.add('hidden');
    id("expanded-view").classList.add('hidden');
    id('about-view').classList.remove('hidden');
    id('reviews-view').classList.add('hidden');
    id('menu-view').classList.add('hidden');
    id('profile-view').classList.add('hidden');
  }

  /**
   * Navigates the user to the 'reviews' page that displays previous user reviews
   */
  function displayReview() {
    id('intro-page').classList.add('hidden');
    id("expanded-view").classList.add('hidden');
    id('about-view').classList.add('hidden');
    id('reviews-view').classList.remove('hidden');
    id('menu-view').classList.add('hidden');
    id('profile-view').classList.add('hidden');
    loadReviews();
  }

  /**
   * Navigates the user to the 'profile' page and enables access to profile functions
   */
  function displayProfile() {
    id('intro-page').classList.add('hidden');
    id("expanded-view").classList.add('hidden');
    id('about-view').classList.add('hidden');
    id('reviews-view').classList.add('hidden');
    id('menu-view').classList.add('hidden');
    id('profile-view').classList.remove('hidden');
    id('profileInfo').addEventListener('click', displayProfileTransactions);
    id('review').addEventListener('click', displayReviewForm);
  }

  /**
   * Displays the 'leave a review' form under profile view, or hides it if already shown
   */
  function displayReviewForm() {
    if (id('pv-review').classList.contains('hidden')) {
      id('pv-profile').classList.add('hidden');
      id('pv-review').classList.remove('hidden');
    } else {
      id('pv-review').classList.add('hidden');
    }
  }

  /**
   * Loads all previous product reviews
   */
  async function loadReviews() {
    try {
      let allRevs = await fetch('/cookiejar/reviews');
      allRevs = await statusCheck(allRevs);
      allRevs = await allRevs.json();
      for (let i = 0; i < allRevs.length; i++) {
        populateReviews(allRevs[i]);
      }
    } catch(err) {
      let errMessage = gen('article');
      let errText = gen('p');
      errText.textContent = 'something went wrong';
      errMessage.appendChild(errText);
      id('rv-reviews').appendChild(errMessage);
    }
  }

  /**
   * Creates a review card to show on the reviews page using given data
   *
   * @param {object} currReview - the review data to utilize
   * @returns {HTMLElement} - the completed review card
   */
  function populateReviews(currReview) {
    let currElement = gen('article');
    id("rv-reviews").appendChild(currElement);
    let toSearch = currReview['product_name'];
    let temp = id(toSearch);
    let currDisplay = temp.querySelector('p');
    let displayName = currDisplay.textContent;
    let first = gen('p');
    first.textContent = currReview.score + '/5 Stars - ' + displayName;
    currElement.appendChild(first);
    let second = gen('p');
    second.textContent = currReview.text;
    currElement.appendChild(second);
    let third = gen('p');
    let temp2 = currReview['username'];
    third.textContent = '-' + temp2;
    currElement.appendChild(third);
  }

  /**
   * Allows the user to submit their review, displaying success or failure
   */
  async function submitReview() {
    try {
      let myReview = new FormData(id('review-form'));
      let myFetch = await fetch('/cookiejar/review/new', {method: 'POST', body: myReview});
      myFetch = await statusCheck(myFetch);
      id('review-response').textContent = "Thanks for your review!";
      setTimeout(clearBox, 5000);
    } catch(err) {
      id('review-response').textContent = err.message;
      setTimeout(clearBox, 5000);
    }
  }

  /**
   * Clears the indicator of whether a review was successful or not
   */
  function clearBox() {
    id('review-response').textContent = "";
  }

  /**
   * Displays the menu view, showing all hidden products
   */
  function displayMenu() {
    id('intro-page').classList.add('hidden');
    id("login-page").classList.add("hidden");
    id("createaccount-page").classList.add("hidden");
    id('about-view').classList.add('hidden');
    id('reviews-view').classList.add('hidden');
    id('profile-view').classList.add('hidden');
    id("menu-view").classList.remove("hidden");
    let box = id('product-display');
    let products = box.querySelectorAll('.product');
    for (let i = 0; i < products.length; i++) {
      products[i].classList.remove('hidden');
    }
  }

  /**
   * Displays the expanded view of a product
   */
  function displayExpandedView() {
    id("menu-view").classList.add('hidden');
    id("expanded-viewcontent").classList.remove('hidden');
    id("expanded-view").classList.remove('hidden');
    id("back-btn").addEventListener("click", navigateMainViewFromExpanded);
    id("purchaseButton").addEventListener("click", populateConfirmation);
  }

  /**
   * Function displays the page for a user to login
   */
  function displayLoginPage() {
    id("intro-page").classList.add("hidden");
    id("createaccount-page").classList.add("hidden");
    id("login-page").classList.remove("hidden");
    if(window.localStorage.getItem("storeUsername") === "true") {
      id("user").value = window.localStorage.getItem("username");
    } else {
      id("user").value = "";
    }
    id("login-btn").addEventListener("click", loginApiCall);
  }

  /**
   * Function displays the page for a user to create a new account
   */
  function displayCreateAcntPage() {
    id("createaccount-page").classList.remove("hidden");
    id("intro-page").classList.add("hidden");
    id("createaccount-btn").addEventListener("click", createNewUser);
  }

  /**
   * Function allows clicking on products to show their expanded view
   */
  function addEventListenersToProducts() {
    let product = qsa(".product");
    for (let counter = 0; counter < product.length; counter++) {
      product[counter].addEventListener('click', expandedView);
    }
  }

  /**
   * Function gives intro page buttons functionality
   */
  function addListenersToIntroPage() {
    id("select-login-btn").addEventListener("click", displayLoginPage);
    id("select-createaccount-btn").addEventListener("click", displayCreateAcntPage);
  }

  /**
   * Function enables logged-in functionalities if login is successful
   *
   * @param {boolean} loginResponse - indicates successful login
   */
  function navigateMainViewFromLogin(loginResponse){
    if(loginResponse) {
      id('about-btn').disabled = false;
      id('reviewpage-button').disabled = false;
      id('profile-btn').disabled = false;
      id('menu-btn').disabled = false;
      id('search-bar').addEventListener('input', () => {
        if (id('search-bar').value.trim() !== '') {
          id('search-btn').disabled = false;
        } else {
          id('search-btn').disabled = true;
        }
      });
      displayMenu();
      let checked = id("yes").checked.toString();
      if(checked) {
        window.localStorage.setItem("username", loginResponse.username);
        window.localStorage.setItem("party-size", loginResponse["party-size"]);
        window.localStorage.setItem("storeUsername", checked);
      }
    }
  }

  /**
   * Function runs a login attempt given user input
   */
  async function loginApiCall() {
    let username = id("user").value.trim();
    let password = id("password").value.trim();
    let apiData = new FormData();
    apiData.append("username", username);
    apiData.append("password", password);
    if(username !== "" && password !== "") {
      try {
        let login = await fetch('/cookiejar/login', {method: 'POST', body: apiData});
        login = await statusCheck(login);
        login = await login.json();
        navigateMainViewFromLogin(login);
      } catch (err) {
        handleError(err);
      }
    } else
      id("errorP").textContent = "Please fill out Username and Password!";
  }

  /**
   * Function runs a search for products given a searchterm
   */
  async function runSearch() {
    try {
      let searchTerm = id('search-bar').value.trim();
      let results = await fetch('/cookiejar/search?search=' + searchTerm);
      results = await statusCheck(results);
      results = await results.json();
      displayMenu();
      let box = id('product-display');
      let menuItems = box.querySelectorAll('.product');
      let shortnameArray = [];
      for (let i = 0; i < results.length; i++) {
        let currName = results[i].shortname;
        shortnameArray.push(currName);
      }
      for (let i = 0; i < menuItems.length; i++) {
        let currSn = menuItems[i].id;
        if (!shortnameArray.includes(currSn)) {
          menuItems[i].classList.add('hidden');
        }
      }
    } catch (err) {
    }
  }

  /**
   * Function filters menu-view products based on user's indicated preferences
   */
  async function runFilter() {
    try {
      displayMenu();
      let myFilters = new FormData();
      let allergen = id('allergen-filter').value;
      myFilters.append("allergen", allergen);
      let occasion = id('occasion-filter').value;
      myFilters.append("occasion", occasion);
      let type = id('type-filter').value;
      myFilters.append("type", type);
      let results = await fetch('/cookiejar/filter', {method: 'POST', body: myFilters});
      results = await statusCheck(results);
      results = await results.json();
      let box = id('product-display');
      let myProducts = box.querySelectorAll('.product');
      let shortnameArray = [];
      for (let i = 0; i < results.length; i++) {
        let currName = results[i].shortname;
        shortnameArray.push(currName);
      }
      for (let i = 0; i < myProducts.length; i++) {
        let currSn = myProducts[i].id;
        if (!shortnameArray.includes(currSn)) {
          myProducts[i].classList.add('hidden');
        }
      }
    } catch (err) {
    }
  }

  /**
   * Function toggles party mode.
   */
  function togglePartyMode() {
    let allProducts = qsa('.product');
    let partyProducts = qsa('.product-party');
    let box = id('product-display');
    let productImages = box.querySelectorAll('img');
    if (partyProducts.length == 0) {
      let summaries = qsa('.product-summary');
      for (let i = 0; i < allProducts.length; i++) {
        allProducts[i].classList.add('product-party');
        summaries[i].classList.remove('product-summary');
        summaries[i].classList.add('summary-compact');
        productImages[i].classList.add('hidden');
      }
    } else {
      let partySummaries = qsa('.summary-compact');
      for (let i = 0; i < partyProducts.length; i++) {
        partyProducts[i].classList.remove('product-party');
        partySummaries[i].classList.add('product-summary');
        partySummaries[i].classList.remove('summary-compact');
        productImages[i].classList.remove('hidden');
      }
    }
  }

  /**
   * Function loads the expanded view data for a given product
   */
  async function expandedView() {
    let shortname = this.id;
    try {
      let fetchString = '/cookiejar/products?name=' + shortname;
      let currProduct = await fetch(fetchString);
      currProduct = await statusCheck(currProduct);
      currProduct = await currProduct.json();
      populateExpandedView(currProduct);
    } catch(err) {
      handleError(err);
    }
  }

  /**
   * Function populates the expanded view given product info
   *
   * @param {object} currProduct - the information to populate the page with
   */
  function populateExpandedView(currProduct) {
    id("expanded-viewcontent").innerHTML = '';
    let temp = gen('section');
    temp.id = "text";
    id("expanded-viewcontent").appendChild(temp);

    // 1) insert image
    let productImg = gen('img');
    productImg.src = 'img/' + currProduct.shortname + '.jpg';
    productImg.alt = currProduct.shortname;
    id("expanded-viewcontent").appendChild(productImg);

    // 2) product name
    let productName = gen('p');
    productName.textContent = currProduct['display-name'];
    productName.classList.add('product-name');
    id("text").appendChild(productName);

    // 3) Description
    let productDescription = gen('p');
    productDescription.textContent = currProduct.descriptors;
    id("text").appendChild(productDescription);

    // 4) Price
    let productPrice = gen('p');
    productPrice.id = "unit-price";
    productPrice.textContent = 'Price: $' + currProduct.price;
    id("text").appendChild(productPrice);

    // 5) Quantity
    let productQuantity = gen('input');
    productQuantity.type= "number";
    productQuantity.id= "quantity-input";
    productQuantity.min = 0;
    productQuantity.max = 5;
    productQuantity.size = 10;
      // generating a label
      // label for="eventname-input
    let label = gen("label");
    label.for = "quantity-input";
    label.textContent = "Quantity:  ";
    id("text").appendChild(label);
    id("text").appendChild(productQuantity);

    // 6) Rating
    if(currProduct['num-ratings'] === 0 & currProduct['rating-score'] === 0) {
      let productRating = gen('p');
      productRating.textContent = "Rating: Product has not been rated by users yet";
      id("text").appendChild(productRating);
    } else {
      let rating = currProduct['rating-score']/currProduct['num-ratings'];
      rating = rating.toFixed(2);
      let productRating = gen('p');
      productRating.textContent = "Rating: " + rating + " stars";
      id("text").appendChild(productRating);
    }

    // 7) Button: add to cart
    let purchaseButton = gen('button');
    purchaseButton.id = "purchaseButton";
    purchaseButton.textContent = "Purchase";
    id("text").appendChild(purchaseButton);

    // 8) Add an error paragraph
    let errorPara = gen('p');
    errorPara.id = "errorPara";
    id("text").appendChild(errorPara);
    displayExpandedView();
  }

  /**
   * Function populates a transaction confirmation page
   */
  function populateConfirmation() {
    id("confirmation").innerHTML = "";
    let productname = qs("#expanded-view .product-name").textContent;
    let quantity = parseInt(id("quantity-input").value);
    let priceString = id("unit-price").textContent;
    let price = priceString.split("$");
    price = parseInt(price[1]);
    let totalCost = price * quantity;
    let product = gen("p");
    product.textContent = "Product: " + productname;
    id("confirmation").appendChild(product);
    let unitPrice = gen("p");
    unitPrice.textContent = "Unit" + priceString;
    id("confirmation").appendChild(unitPrice);
    let pquantity = gen("p");
    pquantity.textContent = "Quantity: " + quantity;
    id("confirmation").appendChild(pquantity);
    let totalcost = gen("p");
    totalcost.textContent = "Total Cost: $" + totalCost;
    id("confirmation").appendChild(totalcost);
    if(id("quantity-input").value !== "") {
      navigateConfirmation(productname, quantity, price, totalCost);
    } else {
      id("errorPara").textContent = "Please fill out the Quantity Field!"
      id("confirmation").innerHTML = "";
      id("submission").innerHTML = "";
    }
  }

  /**
   * Function navigates confirmation
   *
   * @param {string} selector - element selector
   * @param {string} selector - element selector
   * @param {string} selector - element selector
   * @param {string} selector - element selector
   */
  function navigateConfirmation(productname, quantity, price, totalCost) {
    id("expanded-viewcontent").classList.add('hidden');
    id("expanded-view").classList.add('hidden');
    id("confirmation-page").classList.remove('hidden');
    id("back-confirmation").addEventListener("click", navigateExpandedFromConfirmation);
    id("next").addEventListener("click", () => {
    populateSubmission(productname, quantity, price, totalCost);
    });
  }

  /**
   * Function sends a user away from the confirmation page
   */
  function navigateExpandedFromConfirmation() {
    id("confirmation").innerHTML = "";
    id("submission").innerHTML = "";
    id("expanded-viewcontent").classList.remove('hidden');
    id("expanded-view").classList.remove('hidden');
    id("confirmation-page").classList.add("hidden");
  }

  /**
   * Function populates the submission page with given information
   *
   * @param {string} selector - element selector
   * @param {string} selector - element selector
   * @param {string} selector - element selector
   * @param {string} selector - element selector
   */
  function populateSubmission(productname, quantity, price, totalCost) {
    id("submission").innerHTML = "";
    // idk why this isnt working
    let intromessage = gen("p")
    intromessage.textContent = "Please confirm that the details below are correct!";
    id("submission").appendChild(intromessage);

    let intromessage2 = gen("p")
    intromessage.textContent = "All orders are in-store pick up only";
    id("submission").appendChild(intromessage2);

    let product = gen("p");
    product.textContent = "Product: " + productname;
    id("submission").appendChild(product);

    let pquantity = gen("p");
    pquantity.textContent = "Quantity: " + quantity;
    id("submission").appendChild(pquantity);

    let totalcost = gen("p");
    totalcost.textContent = "Total Cost: $" + totalCost;
    id("submission").appendChild(totalcost);

    let apiMessage = gen("p");
    apiMessage.id = "apiMessage";
    id("submission").appendChild(apiMessage);

    navigateSubmission(productname, quantity, price, totalCost);
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function navigateSubmission(productname, quantity, price, totalCost) {
    id("submission-page").classList.remove("hidden");
    id("confirmation-page").classList.add("hidden");
    id("back-submission").addEventListener("click", navigateConfirmationFromSubmission);
    id("submit").addEventListener("click", () => {
      verifyTransaction(productname, quantity, price, totalCost);
      });
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  async function verifyTransaction(productname, quantity, price, totalCost) {
    let apiData = new FormData();
    let username = window.localStorage.getItem("username");
    apiData.append("username", username);
    apiData.append("productname", productname);
    apiData.append("quantity", quantity);
    apiData.append("price", price);
    apiData.append("totalCost", totalCost);
    try {
      let transaction = await fetch('/cookiejar/transaction/new', {method: 'POST', body: apiData});
      transaction = await statusCheck(transaction);
      transaction = await transaction.text();
      handleTransaction(transaction);
    } catch(err) {
      handleError(err);
    }

  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function handleTransaction(transaction) {
    // if the returned text == transaction id
    id("apiMessage").textContent = "Order was Submitted! " + transaction;
    // timer for naviagating to the homepage
    let timer = setTimeout(navigateMainViewFromSubmission, 1000);
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function navigateMainViewFromSubmission() {
    id("submission-page").classList.add("hidden");
    id("menu-view").classList.remove("hidden");
    id("submission").innerHTML = "";
    navigateMainViewFromExpanded();
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function navigateConfirmationFromSubmission() {
    id("submission-page").classList.add("hidden");
    id("confirmation-page").classList.remove("hidden");
    id("submission").innerHTML = "";
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function navigateMainViewFromExpanded() {
    qs("#expanded-viewcontent > img").remove();
    id("text").innerHTML = "";
    id("expanded-viewcontent").classList.add("hidden");
    id("expanded-view").classList.add("hidden");
    id("menu-view").classList.remove("hidden");
  }

  // create account
  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  async function createNewUser(evnt) {
    evnt.preventDefault();
    let username = id("username-input").value.trim();
    let password = id("password-input").value.trim();
    let email = id("email-input").value.trim();
    let eventname = id("eventname-input").value.trim();
    let partysize = id("partysize-input").value.trim();
    let date = id("date-input").value.trim();
    let apiData = new FormData();
    apiData.append("username", username);
    apiData.append("password", password);
    apiData.append("email", email);
    apiData.append("eventname", eventname);
    apiData.append("partysize", partysize);
    apiData.append("date", date);
    try {
      if (username !== "" && password !== "" && email !== "" && eventname !== "" && partysize !== "" && date !== "") {
        let newUser = await fetch('/cookiejar/newuser', {method: 'POST', body: apiData});
        newUser = await statusCheck(newUser);
        newUser = await newUser.text();
        navigateFromCreate(newUser);
      } else {
        id("error").textContent = "Please fill out all fields";
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function navigateFromCreate(newUser) {
    if(newUser === "Account created successfully") {
      displayLoginPage();
    } else {
      id("error").textContent = "Please try again";
    }
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  async function loadProducts() {
    try {
      let allProducts = await fetch('/cookiejar/products');
      allProducts = await statusCheck(allProducts);
      allProducts = await allProducts.json();
      for (let i = 0; i < allProducts.length; i++) {
        let product = allProducts[i];
        populateProduct(product);
      }
      addEventListenersToProducts();
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function populateProduct(product) {
    let myProduct = gen('article');
    myProduct.classList.add('product');
    // make the myProductid the shortname
    myProduct.id = product.shortname;
    id('product-display').appendChild(myProduct);
    let myImg = gen('img');
    myImg.src = 'img/' + product.shortname + '.jpg';
    myImg.alt = product['display-name'];
    myProduct.appendChild(myImg);
    let pName = gen('p');
    pName.textContent = product['display-name'];
    pName.classList.add('product-name');
    myProduct.appendChild(pName);
    let summary = gen('p');
    summary.classList.add('product-summary');
    summary.textContent = product.descriptors;
    myProduct.appendChild(summary);
    let myPrice = gen('p');
    myPrice.classList.add('price');
    myPrice.textContent = '$' + product.price + ' per Unit';
    myProduct.appendChild(myPrice);
  }

  // Profile --> my profile button
    // displays basic user information followed by transaction history
    //  goal: make API transaction history endpoint by 5 pm
  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  async function displayProfileTransactions() {
    id("pv-profile").classList.toggle('hidden');
    id("pv-review").classList.add('hidden');
    // fetch information from API:
    if(!id("pv-profile").classList.contains("hidden")) {
      // fetch information from API:
      try {
        let username = window.localStorage.getItem("username");
        let transactions = await fetch('/cookiejar/transaction/history/' + username);
        transactions = await statusCheck(transactions);
        transactions = await transactions.json();
        displayTransactions(transactions);
      } catch (err) {
        // need to handle errors
        handleError(err);
      }
    }
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function displayTransactions(transactions) {
    // display in paragraph format
    // first logout transaction 1 in bold
    // order of output
      // confirmation-number
      // display-name
      // quantity
      // total-cost
    if(transactions.length === 0) {
      id("pv-profile").innerHTML = "";
      let noTransactions = gen("p");
      noTransactions.textContent = "There are no purchases in your history";
      id("pv-profile").appendChild(noTransactions);
    } else {
      // the array is not empty
      id("pv-profile").innerHTML = "";
      let transactionHeader = gen("p");
      transactionHeader.textContent = "Your Previous Transactions:";
      transactionHeader.classList.add("bold");
      id("pv-profile").appendChild(transactionHeader);
      for(let i=0; i<transactions.length; i++) {
        // create a new method
        displayEachTransaction(transactions[i], i+1);
      }
    }
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function displayEachTransaction(transaction, num) {
    let transNum = gen("p");
    transNum.textContent = "Transaction: " + num;
    transNum.classList.add("bold");
    id("pv-profile").appendChild(transNum);
    let confirmNum = transaction["confirmation-number"];
    let confirm = gen("p");
    confirm.textContent = "Confirmation Number: " + confirmNum;
    id("pv-profile").appendChild(confirm);

    let displayName = transaction["display-name"];
    let display = gen("p");
    display.textContent = "Display Name: " + displayName;
    id("pv-profile").appendChild(display);

    let quantityNum = transaction.quantity;
    let quantity = gen("p");
    quantity.textContent = "Quantity: " + quantityNum;
    id("pv-profile").appendChild(quantity);

    let totalCostNum = transaction["total-cost"];
    let totalCost = gen("p");
    totalCost.textContent = "Total Cost: " + totalCostNum;
    id("pv-profile").appendChild(quantity);
  }

  /**
   * Sets up interactivity on buttons, disabled until login. Loads products.
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function handleError(err) {
    if(err.message === "Quantity selected not available for purchse" || err.message === "Please fill out quantity!") {
      id("apiMessage").textContent = err.message;
    }
    if(err.message === 'Account does not exist' || err.message === 'Missing either username or password.') {
      id("errorP").textContent = err.message;
    }
    if(err.message === 'Username already exists please select a new one!' || err.message === 'Please fill out all fields!') {
      id("error").textContent = err.message;
    }
  }

  /**
   * Function checks if the retrieved data is 'ok'
   * @param {promise} res the supposed data
   * @return {promise} returns the promise if it is valid
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

   /**
   * Function creates shorthand for the contained command
   * @param {string} tag the type of element to create
   * @return {element} the new element
   */
   function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * Finds the first element with the specified selector
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object associated with selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Finds the element with the specified ID attribute
   *
   * @param {string} id - element ID
   * @returns {HTMLElement} DOM object associated with id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Finds all elements with the specified selector
   *
   * @param {string} selector - element selector
   * @returns {HTMLElement} DOM object/objects associated with selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();
