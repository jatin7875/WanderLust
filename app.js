if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ----- Routers -----
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ----- Database connection -----
const DB_URL = process.env.ATLAS_DB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(DB_URL)
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.log("Database connection error:", err));

// ----- App configuration -----
app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ----- Session configuration -----
const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET || 'thisshouldbeabettersecret'
    },
    touchAfter: 24 * 3600
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET || 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// ----- Passport configuration -----
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----- Flash & current user middleware -----
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ----- Routes -----
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ----- Root route -----
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// ----- Error handler -----
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { message });
});

// ----- Server start -----
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
