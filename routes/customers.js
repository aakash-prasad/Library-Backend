const express = require('express');
const router = express.Router();
const {conn} = require('../connection');




router.post('/new-customer', async(req, res)=>{
  const mysqlconnection = await conn();
  const {fullName, phoneNo}= req.body;
  const time = new Date();
    let customer = [fullName, time, phoneNo];
    try{
      const insertSql = "INSERT INTO customers (full_name, created_at, phoneNo) Values(?,?,?)"
      const result = await mysqlconnection.execute(insertSql, customer)
      console.log('Customer Number: ');
    }catch(err){console.log(`The error in creating customer is ${err}`)}

   console.log(`New Customer Created`);
   return res.status(200).json({msg: customer})
})



router.post('/collect-fees', async(req, res)=>{
  const mysqlconnection = await conn();
  const {customerName, status} = req.body;
  if(status == true){
    const updateSql = 'UPDATE collection_book SET paid = true WHERE customer_name = ?';
    try{
      const result = await mysqlconnection.execute(updateSql, [customerName]);      
        console.log('Success updating main table')
    }catch(err){console.log(err)}     
      console.log('Paid')
      return res.status(200).json({msg: `Fees paid ${customerName}`})
  }
  console.log('Not Paid')
  return res.status(424).json({msg: `Fees payment Unsuccesful ${customerName}`})     
})



router.post('/all-customers', async(req,res)=>{
  const returnedList = [];
  const mysqlconnection = await conn();
  const getCustomerSql = 'SELECT full_name FROM customers'
  const getCustomerResult  = await mysqlconnection.execute(getCustomerSql)
  const getBookSql = 'SELECT book_name FROM bookissue';
  const getBookResult = await mysqlconnection.execute(getBookSql)
  const customerArray = (getCustomerResult[0]);
  customerArray.forEach((item, index)=>{
    const nthCustomer = {
      "name": customerArray[index].full_name
    }
    returnedList.push(nthCustomer)
  });

  console.log(returnedList)
  res.status(200).json({msg: returnedList}); 
})

module.exports = router;