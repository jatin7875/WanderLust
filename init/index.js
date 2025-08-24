

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main().then(() =>{
    console.log("Database connected successsfully");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

//initliazing database
const initDB = async() =>{
    //cleaning old data
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Data was intialized");
}

initDB();