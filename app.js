const express = require("express");
const app = express();
const mongoose = require("mongoose"); 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { nextTick } = require("process");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressErrors.js");
const session = require("express-session");
const flash = require("connect-flash");
 

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

 
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

const sessionOptions ={
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
       expires : Date.now() + 7*24*60*60*1000,
       maxAge : 7 * 24 * 60 * 60 * 1000, 
       httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


//middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
   /*  res.status(statusCode).send(message); */
});
