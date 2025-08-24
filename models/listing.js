const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

   image:  {
      type: String,
      filename: String,
      set: (v) =>
        v === ''
          ? 'https://img.freepik.com/free-photo/sunset-time-tropical-beach-sea-with-coconut-palm-tree_74190-1075.jpg?semt=ais_hybrid&w=740&q=80'
          : v,
    },

  price: Number,
  location: String,
  country: String,
});


const listening = mongoose.model("Listing",listingSchema);
module.exports = listening;