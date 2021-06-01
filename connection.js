const mysql = require('mysql2/promise');
//db connect
const connectDb = async ()=>{
  return await mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password:'Aakash@123',
    database: 'newLibrary'
  });
}
module.exports  = {
    conn: connectDb
}

