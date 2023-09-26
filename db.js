const mongoose = require('mongoose')


const connectDb = async() => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (error ) {
    console.log("Connection Error",error.message);
  }

  const connection = mongoose.connection;

  if(connection.readyState >= 1){
    console.log('connected to Db');
    return;
  }
  connection.on('error', ()=>console.log("Failed to Connect to Db"));
}

module.exports = connectDb;