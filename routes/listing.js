const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


 router.get("/",listingController.index);

//create new listing route
router.get("/new",isLoggedIn,listingController.renderNewFrom);

// SEARCH route (must be ABOVE :id)
router.get("/search", wrapAsync(async (req, res) => {
    const query = req.query.q || "";

    const listings = await Listing.find({
        $or: [
            { title:     { $regex: query, $options: "i" } },
            { location:  { $regex: query, $options: "i" } },
            { country:   { $regex: query, $options: "i" } }
        ]
    });

    res.render("listings/searchListing.ejs", { listings, query });
}));


//show route
router.get("/:id",wrapAsync(listingController.showListing));

//create route 
router.post("/",isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

//update edit route
router.put("/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updatingListing)
);


//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.distroyListing));



module.exports = router;