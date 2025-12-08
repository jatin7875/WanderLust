const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressErrors.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const {validateReview, isReviewAuthor} = require("../middleware.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const { isRef } = require("joi");
const reviewController = require("../controllers/reviews.js");
  
//Review Route
router.post("/",validateReview,isLoggedIn,wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.distroyReview));

module.exports = router;