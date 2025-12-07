const Listing = require("./models/listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/expressErrors.js");
const {listingSchema,reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.orignalUrl;
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) =>{
      let {id} = req.params;
    let listing = await Listing.findById(id);
     if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`)
     }
     next();
}

//creating joi middleware for listings validation error showing
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//creating joi middleware for reviews validation error showing
module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
           next();
    }
}


module.exports.isReviewAuthor = async (req,res,next) =>{
      let {id,reviewId} = req.params;
    let listing = await Review.findById(reviewId);
     if(!listing.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this Review!");
        return res.redirect(`/listings/${id}`)
     }
     next();
}
