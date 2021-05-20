const express = require('express');
const app = express();
const mysql = require('mysql2');
const mysqlconnection = require('./connection');
const bodyParser = require('body-parser')
//body parser
app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }))
//Router
app.use('/',require('./routes/index'))
//server running

app.listen(5000, ()=>{
  console.log(`Server running on port 5000`);
})
