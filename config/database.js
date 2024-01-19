const { Pool } = require('pg');

// Configure the PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '@Mit@#$1',
    port: 5432,
});


//   const query = async (text, params) => {
//     const start = Date.now();
//     const res = await pool.query(text, params);
//     const duration = Date.now() - start;
//     console.log('Executed query:', { text, duration, rows: res.rowCount });
//     return res;
//   };

//   module.exports = {
//     query,
//   };

module.exports = pool;