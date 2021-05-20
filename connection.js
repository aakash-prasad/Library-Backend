const mysql = require('mysql2');
//db connect
const mysqlconnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'Aakash@123',
  database: 'library'
});
mysqlconnection.connect(err=>{
  if(err) console.log('Database Connection failed');
  console.log('Database Connected');
});

module.exports = mysqlconnection;