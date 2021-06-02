const express = require('express');
const router = express.Router();
const {conn} = require('../connection');


router.post('/', async(req,res)=>{
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
  }
  else{
    console.log('User Already exist')
    return res.json({msg: 'User Already Exist'})
  }  
  }catch(err){console.log(`Error in Creating a new customer: ${err}`)}
  
  return res.json({customerDetails});
})

router.get('/', async(req, res)=>{
  const mySqlConnection = await  conn();
  const userName  = (req.query.username)
  try{
  //SEARACH FOR THE USER WITH THE USERNAME IN THE DATABASE
  const getUserQuery = 'SELECT * FROM customers WHERE username = ?';
  const getUserResult = await mySqlConnection.execute(getUserQuery, [userName])
  const userData = (getUserResult[0][0])

  //Search for the book issued by the customer and push it into the userData object
  const customerId  = getUserResult[0][0].id;
  const getBookIdQuery = 'SELECT book_id FROM issue_book WHERE customer_id = ?';
  const getBookIdResult = await mySqlConnection.execute(getBookIdQuery, [customerId])
  const bookId = (getBookIdResult[0][0].book_id);
  const getBookQuery = 'SELECT name FROM books WHERE id = ?';
  const getBookResult = await mySqlConnection.execute(getBookQuery, [bookId]);
  const bookName = (getBookResult[0][0].name)
  userData.bookName = bookName;
  
  //IF USER FOUND RESPOND WITH THE USER DETAILS
  res.json({Customer :userData})
  }catch(err){console.log(`Error in getting the user ${err}`)}

})
module.exports = router;