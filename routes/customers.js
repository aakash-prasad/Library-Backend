const express = require('express');
const router = express.Router();
const {conn} = require('../connection');

router.get('/', async(req,res)=>{
  // START THE CONNECTION
  const mySqlConnection = await conn();
  // QUERY TO GET CUSTOMER
  const getCustomerQuery = 'SELECT * FROM customers';
  const getCustomerResult = await mySqlConnection.execute(getCustomerQuery);
  let customerArray = getCustomerResult[0]
  console.log(customerArray)
  //RETURN THE ARRAY
  return res.status(200).json({data: customerArray})  
});


router.post('/', async(req,res)=>{
  //START THE CONNECTION
  const mySqlConnection = await conn();
  
  const{userName, phoneNo, gender} =req.body;
  let customerDetails = [userName, phoneNo, gender];
  //Check length of phoneNo:
  if(phoneNo.length !=10){
    return res.json({msg: 'Enter a valid Phone Number'})
  }
  try{
  //check weather the userName exist or not:
  const checkUserQuery = 'SELECT username FROM customers WHERE username = ?';
  const checkUserResult = await mySqlConnection.execute(checkUserQuery, [userName]);
  // If userName doesn't exist insert new customer:
  if(checkUserResult[0].length==0){
      const insertQuery = 'INSERT INTO customers(username, phone, gender) VALUES(?,?,?)';
      const insertResult = await mySqlConnection.execute(insertQuery, customerDetails)
      return res.status(200).json({data: customerDetails});
  }
  else{
    console.log('User Already exist')
    return res.status(409).json({msg: 'User Already Exist'})
  }  
  }catch(err){return res.status(500).json({err})}
})
  


router.get('/:id', async(req, res)=>{
  const mySqlConnection = await  conn();
  const userId  = (req.params.id)
  console.log(userId)
  try{
  //SEARACH FOR THE USER WITH THE id IN THE DATABASE
  const getUserQuery = 'SELECT * FROM customers WHERE id = ?';
  const getUserResult = await mySqlConnection.execute(getUserQuery, [userId])
  const userData = (getUserResult[0][0])
  console.log(userData)
  return res.status(200).json({data :userData})
  }catch(err){return res.status(500).json({err})}

})


router.post('/:id', async(req, res)=>{
  const mySqlConnection = await  conn();
  const userId  = (req.params.id)
  
  const newData  = [userName, phoneNo]
  // UPDATE THE DETAILS WITH THE GIVEN USER ID
  const updateQuery = 'UPDATE customers SET username = ?,  phone = ? WHERE id = ?';
  const updateQueryResult = await mySqlConnection.execute(updateQuery, [userName, phoneNo, userId])
  return res.json({msg:'ok'})
})



router.get('/:id/books', async(req, res)=>{
  const mySqlConnection = await  conn();
  const userId  = (req.params.id)
  try{
  //SEARACH FOR THE USER WITH THE id IN THE DATABASE
  const getUserQuery = 'SELECT * FROM customers WHERE id = ?';
  const getUserResult = await mySqlConnection.execute(getUserQuery, [userId])
  const userData = (getUserResult[0][0])

  //Search for the book issued by the customer and push it into the userData object
  const customerId  = getUserResult[0][0].id;
  const getBookIdQuery = 'SELECT book_id FROM issue_book WHERE customer_id = ?';
  const getBookIdResult = await mySqlConnection.execute(getBookIdQuery, [customerId])
  //IF BOOK IS THERE FOR USER THEN SEARCH FOR IT
  if(getBookIdResult[0].length != 0){
    const bookArray = [];
  getBookIdResult.forEach(async(item,index)=>{
    const bookId = (getBookIdResult[0][index].book_id);
    console.log(getBookIdResult[0][0])
  
    const getBookQuery = 'SELECT name FROM books WHERE id = ?';
    const getBookResult = await mySqlConnection.execute(getBookQuery, [bookId]);
  
    const bookName = (getBookResult[0][0].name)
    console.log(getBookResult[0][0].name)
    bookArray.push(bookName)
  })
  userData.bookName = bookArray;
  return res.status(200).json({data :userData})
  }
  else{return res.status(200).json({data :userData}) }
  }catch(err){return res.status(500).json({err})}

})



router.post('/:id1/book/:id2', async(req, res)=>{
  const mySqlConnection = await conn();
  const customerId =req.params.id1;
  const bookId =req.params.id2;
  console.log(customerId)
  console.log(bookId)
  // issue the book with bookId with customerId
  try{
    const issueQuery = 'INSERT INTO issue_book(customer_id, book_id, issue_date) VALUES(?,?,?)';
    const issueResult = await mySqlConnection.execute(issueQuery, [customerId, bookId, new Date()])
    return res.status(200).json({data: [customerId, bookId, new Date()]})
  }catch(err){return res.status(500).json({err})}
  
})



module.exports = router;