const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { nextTick } = require("process");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressErrors.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");


main().then(() =>{
    console.log("Database connected successsfully");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine",'ejs');
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});

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

//creating joi middleware for reviews validation error showing
const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}


app.get("/",(req,res)=>{
    console.log("hii, i am root");
});

/* app.get("/testListing",async(req,res)=>{
     let sampleListing = new Listing({
        tittle:"My new villa",
        description:"by the beach",
        price :1200,
        location:"Calangute ,Goa",
        country:"india",
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("Successful testing"); 
}); */

app.get("/listings",async(req,res) =>{
    const allListings = await Listing.find({});
   res.render("listings/index", { allListings });
});

//new route
app.get("/listings/new",(req,res)=>{
res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
});

//create route
app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


//edit route
app.get("/listings/:id/edit", async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update edit route
app.put("/listings/:id",validateListing,async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id",async(req,res) =>{
     let {id} = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     res.redirect("/listings"); 
});

//Review Route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review )

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
   let {id,reviewId} = req.params;
   await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await Review.findById(reviewId);
   res.redirect(`/listings/${id}`);
}))



//middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
   /*  res.status(statusCode).send(message); */
});
