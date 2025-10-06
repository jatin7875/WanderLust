const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const reviews = require("./reviews");


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
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const listening = mongoose.model("Listing",listingSchema);
module.exports = listening;