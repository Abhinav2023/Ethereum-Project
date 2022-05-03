var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    User             = require("./models/user"),
    methodOverride   = require("method-override"),
    indexRoutes      = require("./routes/index"),
    flash            = require("connect-flash")

var url="mongodb+srv://<Username>:<password>@cluster0.urbmq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(url,{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname +"/public/"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "JaiHindCoders",
    resave: false, 
    saveUninitialized: false
}))
    
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    app.locals.moment = require('moment');
    next()
})

app.use("/",indexRoutes);

app.listen(8000, process.env.IP, function(){
   console.log("The BlockChain Server Has Started!");
});