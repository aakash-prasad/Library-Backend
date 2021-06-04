const express = require('express');
const router = express.Router();
const {conn} = require('../connection')


router.post('/author', async(req,res)=>{
  const mySqlConnection = await conn();
  const{authorName} =req.body;  
  try{
    const checkAuthorQuery = 'Select * FROM authors WHERE name = ?'
    const checkAuthorResult = await mySqlConnection.execute(checkAuthorQuery, [authorName])
    if(checkAuthorResult[0].length == 0){
      const insertAuthorQuery = 'INSERT INTO authors (name) VALUES(?)';
      const insertAuthorResult = await mySqlConnection.execute(insertAuthorQuery, [authorName]);
      return res.json({authorName})
    }
    return res.json({msg: 'Author already exist'})
  }catch(err){console.log(`Error in inserting author ${err}`)}
})

router.post('/', async(req,res)=>{
  const mySqlConnection = await conn();

  const{bookname, authorName, quantity, rate} = req.body;
  const bookName = bookname.trim();
  console.log(bookName)
  try{
    //Fetch the author id
    const getAuthorQuery = 'SELECT id FROM authors WHERE name = ?';
    const getAuthorResult = await mySqlConnection.execute(getAuthorQuery, [authorName])
    const authorId = (getAuthorResult[0][0].id)

    // check if the book exist or not
    const checkBookQuery = 'SELECT name FROM books where name = ?';
    const checkBookResult = await mySqlConnection.execute(checkBookQuery, [bookName])
    
    if(checkBookResult[0].length == 0){
    //insert new book
      const newBook = [bookName, authorId, quantity, rate]
      const insertBookQuery = 'INSERT INTO books(name, authorId, quantity, rate) VALUES(?,?,?,?)';
      const insertBookResult = await mySqlConnection.execute(insertBookQuery, newBook);
      return res.json({newBook})
    }
    //ELSE UPDATE THE QUANTITY
    //GET THE QUANTITY
    const getBookQuery = 'SELECT * FROM books WHERE name = ?';
    const getBookResult = await mySqlConnection.execute(getBookQuery, [bookName]);
    const currentQuantity = getBookResult[0][0].quantity;
    intQty = parseInt(quantity)
    const newQuantity = currentQuantity + intQty;

    //UPDATE THE QUANTITY
    const updateQuantitySql = 'UPDATE books SET quantity = ? WHERE name = ?';
    const updateQuantityResult  = await mySqlConnection.execute(updateQuantitySql, [newQuantity, bookName])

    return res.json({QuantityUpdated:quantity})
  }catch(err){console.log(`Error in inserting new book: ${err}`)}
  
})


router.post('/issue', async(req, res)=>{
  const mySqlConnection = await conn();
  const {userName, bookName} = req.body;
  try{
    // Search for the customer and get the id
  const getCustomerQuery = 'SELECT id FROM customers WHERE username = ?';
  const getCustomerResult = await mySqlConnection.execute(getCustomerQuery, [userName]);
  const customerId = (getCustomerResult[0][0].id)
  //Search for the book and get the id
  const getBookQuery = 'SELECT * FROM books WHERE name = ?';
  const getBookResult = await mySqlConnection.execute(getBookQuery, [bookName]);
  const bookId = (getBookResult[0][0].id)
  //If id found insert it into the database
  if(getCustomerResult[0].length == 0){
    return res.json({msg: `Customer does not exist`})
  }
  else if(getBookResult[0].length == 0){
    return res.json({msg: `Book does not exist`})
  }
  else if(getCustomerResult[0].length != 0 && getBookResult[0].length != 0){
    //id found issue the book for customer
    const issueData = [customerId, bookId, new Date()]
    const insertIssueQuery = 'INSERT INTO issue_book(customer_id, book_id, issue_date) VALUES(?,?,?)';
    const insertIssueResult = await mySqlConnection.execute(insertIssueQuery, issueData);

    //UPDATE THE BOOKS TABLE TO REDUCE THE QUANTITY
    const newQuantity = (getBookResult[0][0].quantity -1)
    console.log(newQuantity)
    const updateQtyQuery = 'UPDATE books SET quantity = ? WHERE id = ?';
    const updateQtyResult = await mySqlConnection.execute(updateQtyQuery, [newQuantity,bookId])
    return res.json({Issue : bookName})
  }
  }catch(err){console.log(`Error in issue book : ${err}`)}
  
})


router.post('/collect', async(req, res)=>{
  const mySqlConnection = await conn();
  const{userName, bookName} = req.body;
  try{
    //SEARCH FOR THE USERNAME AND GET THE ID
    const getCustomerQuery = 'SELECT id FROM customers WHERE username = ?';
    const getCustomerResult = await mySqlConnection.execute(getCustomerQuery, [userName]);
    const customerId = (getCustomerResult[0][0].id);

    //SEARCH FOR THE BOOK AND GET THE BOOK
    const getBookQuery = 'SELECT * FROM books WHERE name = ?';
    const getBookResult = await mySqlConnection.execute(getBookQuery, [bookName]);
    const bookId = (getBookResult[0][0].id);

    //UPDATE TABLE ISSUE_BOOK WHERE USERID = ? AND BOOKID =?
    const updateIssueQuery = 'UPDATE issue_book SET is_returned = true , returned_date = ? WHERE customer_id = ? AND book_id = ?';
    const updateIssueResult = await mySqlConnection.execute(updateIssueQuery, [new Date(), customerId, bookId])

    //UPDATE THE BOOKS TABLE TO INCREASE THE QUANTITY
    const newQuantity = (getBookResult[0][0].quantity + 1)
    console.log(newQuantity)
    const updateQtyQuery = 'UPDATE books SET quantity = ? WHERE id = ?';
    const updateQtyResult = await mySqlConnection.execute(updateQtyQuery, [newQuantity,bookId])
    return res.json({Success: [userName, bookName ]})
  }catch(err){console.log(`Error in getting customer ${err}`)}
})


router.post('/fees', async(req,res)=>{
  const mySqlConnection = await conn();
  const{userName, bookName} = req.body;
  try{
    //SEARCH FOR THE USERNAME AND GET THE ID
    const getCustomerQuery = 'SELECT id FROM customers WHERE username = ?';
    const getCustomerResult = await mySqlConnection.execute(getCustomerQuery, [userName]);
    const customerId = (getCustomerResult[0][0].id);

    //SEARCH FOR THE BOOK AND GET THE BOOK
    const getBookQuery = 'SELECT id FROM books WHERE name = ?';
    const getBookResult = await mySqlConnection.execute(getBookQuery, [bookName]);
    const bookId = (getBookResult[0][0].id);

    //Get the issue date and returned date to calculate duration
    const getDateQuery = 'SELECT issue_date, returned_date FROM issue_book WHERE customer_id = ? AND book_id =?';
    const getDateResult = await mySqlConnection.execute(getDateQuery, [customerId, bookId])
    const issueDate = (getDateResult[0][0].issue_date)
    const returnedDate = (getDateResult[0][0].returned_date)
    const duration  = returnedDate.getTime()-issueDate.getTime();
    
    //Get the rate of the book to calculate fees
    const getRateQuery = 'SELECT rate FROM books WHERE id = ?';
    const getRateResult= await mySqlConnection.execute(getRateQuery, [bookId])
    const rate = (getRateResult[0][0].rate)

    //CALCULATING FEES
    const fees =  (rate/10)*duration;

    //UPDATE TABLE ISSUE_BOOK WHERE USERID = ? AND BOOKID =?
    const updatePaymentQuery = 'UPDATE issue_book SET payment_status = true WHERE customer_id = ? AND book_id = ?';
    const updateIssueResult = await mySqlConnection.execute(updatePaymentQuery, [customerId, bookId])
    return res.json({fees})
  }catch(err){console.log(`Error in getting customer ${err}`)}
})


router.get('/', async(req, res)=>{
  const bookName = (req.query.bookname)
  const mySqlConnection = await conn();
  try{
  //SEARCH FOR THE BOOK IN THE BOOKS AND GET THE DATA
  const getBookQuery = 'SELECT * FROM books WHERE name = ?';
  const getBookResult = await mySqlConnection.execute(getBookQuery, [bookName])
  const bookData = (getBookResult[0][0]);

  //SEARCH FOR THE AUTHOR WITH AUTHOR ID AND PUSH IT TO OBJECT
  const authorId = getBookResult[0][0].authorId;
  const getAuthorQuery  = 'SELECT name FROM authors WHERE id = ?';
  const getAuthorResult = await mySqlConnection.execute(getAuthorQuery, [authorId])
  const authorName = (getAuthorResult[0][0].name)
  bookData.author = authorName;
  delete bookData.authorId;
  res.json({book: bookData})

  }catch(err){console.log(`Cannot get ${err}`)}
    
})

module.exports = router;