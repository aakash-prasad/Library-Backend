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

  const{bookName, authorName, quantity, rate} = req.body;
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
    return res.json({msg:'Book already exist'})
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
  const getBookQuery = 'SELECT id FROM books WHERE name = ?';
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
    return res.json({msg: 'Issue success'})
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
    const getBookQuery = 'SELECT id FROM books WHERE name = ?';
    const getBookResult = await mySqlConnection.execute(getBookQuery, [bookName]);
    const bookId = (getBookResult[0][0].id);

    //UPDATE TABLE ISSUE_BOOK WHERE USERID = ? AND BOOKID =?
    const updateIssueQuery = 'UPDATE issue_book SET is_returned = true , returned_date = ? WHERE customer_id = ? AND book_id = ?';
    const updateIssueResult = await mySqlConnection.execute(updateIssueQuery, [new Date(), customerId, bookId])
    return res.json({Success: [userName, bookName ]})
  }catch(err){console.log(`Error in getting customer ${err}`)}
})

module.exports = router;