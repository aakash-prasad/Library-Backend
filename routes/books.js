const express = require('express');
const router = express.Router();
const mysqlconnection = require('../connection');
const {conn} = require('../connection')



router.post('/new-book/',async(req, res)=>{
  const mysqlconnection = await conn();
  let {name, author,rate, quantity} = req.body;

  const sqlCheck = "SELECT * FROM `books` WHERE `name` = ?";
  const sqlUpdate = "UPDATE books SET quantity = ? WHERE name = ?"
  
  try{
    const checkResult = await mysqlconnection.execute(sqlCheck,[name]);
    if(checkResult[0].length==0){
      const newBook = [name, author, rate, quantity];
      const updateResult = await mysqlconnection.execute('INSERT INTO books (name, author,rate, quantity) VALUES (?,?,?,?)' ,newBook)
      console.log(`Book ${name} inserted`)      
    }
    const updateResult = await mysqlconnection.execute(sqlUpdate, [quantity, name])
    console.log('quantity updated')
  }catch(err){console.log(err)}
    
    console.log('Done')
  return res.status(200).json({msg: newBook})
})



router.post('/issue-book', async(req, res)=>{
  const mysqlconnection = await conn();
  const {customerName, bookName, duration} = req.body;
  //if customer issued a book push into database
  const issueData = [customerName, bookName, new Date(), false, duration];
    
  const sql = 'INSERT INTO bookissue(customer_name, book_name, issue_date, returned, duration) VALUES (?,?,?,?,?)'
  const checkSql = 'SELECT * FROM books WHERE name = ?'
  const checkResult = await mysqlconnection.execute(checkSql, [bookName])
  //console.log(checkResult[0][0].quantity)
  if(checkResult[0].length == 0){
    console.log(`Sorry the book ${bookName} is not available`)
    return res.json(`Book issue for ${customerName} unsuccesful`)
  }
  if(checkResult[0][0].quantity == 0){
    console.log(`Sorry the book ${bookName} doesn't have enough quantity`)
    return res.json(`Book issue for ${customerName} unsuccesful. 0 book left`)
  }
  try{
    const insertResult = await mysqlconnection.execute(sql, issueData)
    const getqtySql = 'SELECT quantity FROM books WHERE name = ?'
    const qtyResult = await mysqlconnection.execute(getqtySql, [bookName]) 
    const  qty = (qtyResult[0][0].quantity);
    const updateSql = 'UPDATE books SET quantity = ?'
    const updateResult = await mysqlconnection.execute(updateSql, [qty-1])
    console.log(`Book issue for ${customerName} succesful`);
  }catch(err){console.log(err)} 
  return res.status(200).json({msg: issueData})
})


  
router.post('/collect-book', async(req, res)=>{
  const mysqlconnection = await conn();
  const {customerName, bookName}= req.body;
  checkSql = 'SELECT issue_date FROM bookissue WHERE customer_name = ?'
  try{
    const resultss = await mysqlconnection.execute(checkSql, [customerName])
    console.log(resultss[0][0].issue_date);
    const issueDate= resultss[0][0].issue_date;
    console.log(issueDate)
    const currentDate = new Date();
    const duration = (currentDate.getTime() - issueDate.getTime())/(1000 * 3600 * 24);
    const rateSql = 'SELECT rate FROM books WHERE name = ?'
    const ResultRateSql = await mysqlconnection.execute(rateSql, [bookName]);
    const rate = ResultRateSql[0][0].rate;
    const toBePaid = rate/10;
    const fees = toBePaid*duration;
    
    let collectionData = [
      customerName,
      bookName,
      issueDate,
      fees,
      true,
    ]
    const insertSql = 'INSERT INTO collection_book(customer_name, book_name, issue_date, fees, returned) VALUES (?,?,?,?,?) '
    const result = await mysqlconnection.execute(insertSql, collectionData);
      console.log('You have returned the book sucesfully');
  }catch(err){console.log(err)}
        
    
  
  return res.status(200).json({msg: collectionData})
})


module.exports = router;