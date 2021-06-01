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


module.exports = router;