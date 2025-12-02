const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressErrors.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");



//creating joi middleware for listings validation error showing
const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}


 router.get("/",async(req,res) =>{
    const allListings = await Listing.find({});
   res.render("listings/index", { allListings });
});

//new route
router.get("/new",(req,res)=>{
res.render("listings/new.ejs");
});

//show route
router.get("/:id",async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
     req.flash("error"," Listing you requested does not exists");
     res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing});
});

//create route 
router.post("/",validateListing,wrapAsync(async (req,res,next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
}));


//edit route
router.get("/:id/edit", async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
      if(!listing){
     req.flash("error"," Listing you requested does not exists");
     res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{listing});
});

//update edit route
router.put("/:id",validateListing,async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success"," Listing updated");
    res.redirect(`/listings/${id}`);
});

//delete route
router.delete("/:id",async(req,res) =>{
     let {id} = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success","Listing Deleted");
     res.redirect("/listings"); 
});



module.exports = router;