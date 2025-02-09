// import mysql from 'mysql2';
// require('dotenv').config();

// async function dbConnect() {
//   if (process.env.DB_URL) {
//     const connection = mysql.createConnection(process.env.DB_URL);

//     // console.log("connection", connection);

//     connection.connect((err: any) => {
//       if (err) {
//         console.log('Error connecting to the database!', err);
//         throw err;
//       }
//       console.log('Connected to the database!');
//     });
//   }
// }

// export { dbConnect };

// ********************************************* New Connection *********************************************

import * as fs from 'fs';
import * as pg from 'pg';

function dbConnect() {
  if (process.env.DB_SSL_CA_PATH) {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(process.env.DB_SSL_CA_PATH).toString(),
      },
    };

    const client = new pg.Client(config);

    client.connect(function (err: any) {
      if (err) throw err;
      client.query('SELECT VERSION()', [], function (err: any, result: any) {
        if (err) throw err;

        console.log(result.rows[0].version);
        client.end(function (err: any) {
          if (err) throw err;
        });
      });
    });
  }
}

export { dbConnect };
