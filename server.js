// server.js
// SERVER-SIDE JAVASCRIPT


/////////////////////////////
//  SETUP and CONFIGURATION
/////////////////////////////

// require express and other modules
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),

  //  NEW ADDITIONS
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true, }));

// serve static files from public folder
app.use(express.static('public'));

// set Models
var db = require('./models'),
  Card = db.Card,
  Destination = db.Destination,
  User = db.User;
  Rating = db.Rating;

// set view engine to ejs
app.set("view engine", "ejs");

app.use(methodOverride("_method"));

app.use(cookieParser());
app.use(session({
  secret: "thisisasecret", // change this!
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
});


////////////////////
//  ROUTES
///////////////////

// set view engine to ejs
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render('index');
});

// Signup
app.get('/signup', function (req, res) {
 res.render('signup');
});


app.post("/signup", function (req, res) {
  console.log("sanity check!! pre-signup");
  User.register(new User({ username: req.body.username, }), req.body.password,
      function (err, newUser) {
        console.log("Check if it enter function to auth");
        console.log("ERROR", err);
        console.log("NEW USER!!",newUser);
        passport.authenticate("local")(req, res, function() {
          res.redirect("/");
        });
      }
  );
});

//View of all cards
app.get("/api/cards", function(req, res){
  Card.find({}, function(err, allCards){
    if (err){
      console.log(err);
    } else {
      // res.render("cards/index", {cards: allCards, error: null});
      res.json(allCards);
    }

});
});
// create cards
app.post("/api/cards", function(req, res){
  var newCard = new Card(req.body);
//saving the new card that was created
  newCard.save(function(err, savedCard){
    if (err){
      console.log(err);
    } else {
      res.json(savedCard);
    }
  });
//populate user reference in the card model
  // Card.find().populate('User').exec(function(err,card){
  //   console.log(card);
  //   console.log(card.User);
  // });
  // //populate destination reference in the card model
  // Card.find().populate('Destination').exec(function(err,card){
  //   console.log(card);
  //   console.log(card.Destination);
  // });
});

//Showpage for individual cards
app.get("/api/cards/:id", function(req, res){
  Card.findOne({_id: req.params.id}, function(err, foundCard){
    console.log(foundCard);
    if (err){
      console.log(err);
    } else{
      res.json(foundCard);
      foundCard.title = req.body.title || foundCard.title;
      foundCard.description = req.body.description || foundCard.description;
      foundCard.image = req.body.title || foundCard.image;
    }
  })
});


// Show all destinations
app.get("/api/destinations", function(req, res) {
  Destination.find({}, function(err, allDestinations) {
    if (err) {
      res.status(500).json({error: err.message});
    }
    else {
      res.json(allDestinations);
      // res.render("destinations/index", {destinations: allDestinations})
    }
  });
});

app.get("/api/destinations/:id", function(req, res) {
  Destination.findById((req.params.id), function(err, foundDestination) {
    if (err) {
      res.status(500).json({error: err.message});
    }else {
      res.json(foundDestination);
      // res.render("destinations/show", {destinations: foundDestination});
    }
  });
});

app.get("/api/users", function(req, res){
  User.find({}, function(err, allUsers){
    if (err){
      console.log(err);
    } else {
      res.json(allUsers);
    }
});
});


//delete cards
app.delete("/api/cards/:id", function (req, res) {
  // get card id from url params (`req.params`)
  var cardId = req.params.id;

  // find card in db by id and remove
  Card.findOneAndRemove({ _id: cardId, }, function () {
    res.redirect("/");
  });
});



//-------------Server------------->
app.listen(process.env.PORT || 3000, function(){
  console.log("listening..");
});
