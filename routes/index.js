const express = require('express');
const router = express.Router();
const {conn} = require('../connection')

router.get('/', async(req, res)=>{
  console.log(conn)
  const mysqlconnection = await conn();
  const name = 'The Alchemist'
  const sqlCheck = "SELECT * FROM `books` ";
  const result = await connection.execute(sqlCheck);
  console.log(`homepage running`);
  console.log(result[0][1])
  return res.status(200).send(`Welcome to the homepage`)
  
})


module.exports = router;