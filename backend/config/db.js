const pgp = require('pg-promise')();
require('dotenv').config();

const db = pgp({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

db.connect()
    .then(obj => {
        console.log('✅ Database connected successfully.');
        obj.done(); // success, release the connection
    })
    .catch(error => {
        console.error('❌ Database connection error:', error.message);
    });

module.exports = db;
