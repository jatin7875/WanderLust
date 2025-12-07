const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");



 router.get("/",async(req,res) =>{
    const allListings = await Listing.find({});
   res.render("listings/index", { allListings });
});

//create new listing route
router.get("/new",isLoggedIn,(req,res)=>{  
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author"
        },
    })
    .populate("owner");
    
    if(!listing){
     req.flash("error"," Listing you requested does not exists");
     res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing});
});

//create route 
router.post("/",validateListing,isLoggedIn,wrapAsync(async (req,res,next)=>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
}));


//edit route
router.get("/:id/edit",isLoggedIn,isOwner, async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
      if(!listing){
     req.flash("error"," Listing you requested does not exists");
     res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{listing});
});

//update edit route
router.put("/:id",validateListing,isLoggedIn,isOwner, async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success"," Listing updated");
    res.redirect(`/listings/${id}`);
});

//delete route
router.delete("/:id",isLoggedIn,isOwner,async(req,res) =>{
     let {id} = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success","Listing Deleted");
     res.redirect("/listings"); 
});



module.exports = router;