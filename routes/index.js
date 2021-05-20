const express = require('express');
const router = express.Router();
const mysqlconnection = require('../connection')

router.get('/', (req, res)=>{
  console.log(`homepage running`);
  res.send(`Welcome to the homepage`)
})

router.post('/customer', (req, res)=>{
  const {fullName, phoneNo}= req.body;
  const time = new Date();
    let customer= {
      full_name: fullName,
      phoneNo: phoneNo,
      created_at: time
    }
  mysqlconnection.query('INSERT INTO customers SET ?',customer,(error, results)=> {
    if (error) throw error;
    console.log('Customer Number: '+results.insertId);
  });
   console.log(`New Customer Created`);
   res.json({msg: 'new customer created'})
})

router.post('/new-book/',(req, res)=>{
  let {name, author, quantity} = req.body;
  let newBook = {
    name: name,
    author: author,
    quantity: quantity
  }
  const sqlCheck = "SELECT name FROM books WHERE name = ?";
  const sqlUpdate = "UPDATE books SET quantity = ? WHERE name = ?"
    mysqlconnection.query(sqlCheck,[name], (err, result)=>{
    if(err) throw err;
    if(result.length==0){
      mysqlconnection.query('INSERT INTO books SET ?' ,newBook, (err, results)=>{
        if(err) console.log(`error in inserting book ${err}`);
        console.log(`Book ${name} inserted`)
        })
    }
    mysqlconnection.query(sqlUpdate, [quantity, name], (err, results)=>{
      if(err) console.log(err)
      console.log('quantity updated')
    })
    console.log('helooooooooo')
  })
  res.json({msg: 'Book Insertion succesful'})
})

router.post('/issue-book', (req, res)=>{
  const {bookName, customerName, duration} = req.body;
  //if customer issued a book push into database
  const issueData = {
    customer_name: customerName,
    book_name: bookName,
    issue_date: new Date(),
    returned: false,
    duration: duration
  }
  const sql = 'INSERT INTO bookissue SET ?'
  mysqlconnection.query(sql, issueData, (err, results)=> {
    if(err) throw err;
    console.log(`Book issue for ${customerName} succesful`);
  })
  res.json({msg: 'Book issue Success'})
})

router.post('/collect-book', (req, res)=>{
  const {customerName, bookName}= req.body;
  sql = 'SELECT issue_date FROM bookissue WHERE customer_name = ?'
  mysqlconnection.query(sql, [customerName], (err, results)=>{
    if(err) throw err;
    const issueDate= results[0].issue_date
    const currentDate = new Date();
    const duration = (currentDate.getTime() - issueDate.getTime())/(1000 * 3600 * 24);
    const rate = 10;
    const fees = rate*duration;
    
    let collectionData = {
      customer_name: customerName,
      book_name: bookName,
      issue_date: issueDate,
      fees: fees,
      returned: true
    }
    const insertSql = 'INSERT INTO collection_book SET ?'
    mysqlconnection.query(insertSql, collectionData, (err, result)=>{
      if(err) throw err;
      console.log('You have returned the book sucesfully');

      
    })
  })
  res.json({msg: 'success'})
})

router.post('/collect-fees', (req, res)=>{
  const {customerName, status} = req.body;
  if(status == true){
    const updateSql = 'UPDATE collection_book SET paid = true WHERE customer_name = ?';
      mysqlconnection.query(updateSql, [customerName], (err, result)=>{
        if(err) throw err;
        console.log('Success updating main table')
      })
      console.log('Paid')
      res.json({msg: 'Fees paid'})
  }
  console.log('Not Paid')
  res.json({msg: 'fees payment unsuccesful'})     
})

module.exports = router;