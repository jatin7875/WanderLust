const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");


 router.get("/",listingController.index);

//create new listing route
router.get("/new",isLoggedIn,listingController.renderNewFrom);

//show route
router.get("/:id",wrapAsync(listingController.showListing));

//create route 
router.post("/",validateListing,isLoggedIn,wrapAsync(listingController.createListing));


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

//update edit route
router.put("/:id",validateListing,isLoggedIn,isOwner, wrapAsync(listingController.updatingListing));

//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.distroyListing));



module.exports = router;