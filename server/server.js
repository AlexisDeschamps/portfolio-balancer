var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");

//controllers
var modelPortfolioController = require("./controllers/modelPortfolioController");

//Express request pipeline
var app = express();
app.use(express.static(path.join(__dirname, "../app/dist")));
app.use(bodyParser.json())
app.use("/api", modelPortfolioController);

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Started listening on port", port);
});

var username = process.env.username;
var password = process.env.password;
var mongooseConnect = "mongodb//" + username + ":" + password + "@ds147905.mlab.com:47905/portfolio-balancer";
mongoose.connect("mongodb://AlexisDeschamps:Alexmongolab4082!@ds147905.mlab.com:47905/portfolio-balancer");