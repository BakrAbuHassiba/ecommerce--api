const mongoose = require('mongoose');

const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = dbConnection;
