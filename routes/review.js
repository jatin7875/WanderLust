const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressErrors.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const {validateReview, isReviewAuthor} = require("../middleware.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const { isRef } = require("joi");

  
//Review Route
router.post("/",validateReview,isLoggedIn,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review );
    newReview.author = req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created");
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(async(req,res)=>{
   let {id,reviewId} = req.params;
   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findById(reviewId);
   req.flash("success","Review Ddeleted");
   res.redirect(`/listings/${id}`);
}))

module.exports = router;