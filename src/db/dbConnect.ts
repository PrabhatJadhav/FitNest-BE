import mysql from "mysql2";
require("dotenv").config();

async function dbConnect() {
  if (process.env.DB_PUBLIC_URL) {
    const connection = mysql.createConnection(process.env.DB_PUBLIC_URL);

    // console.log("connection", connection);

    connection.connect((err: any) => {
      if (err) {
        console.log("Error connecting to the database!", err);
        throw err;
      }
      console.log("Connected to the database!");
    });
  }
}

export { dbConnect };
