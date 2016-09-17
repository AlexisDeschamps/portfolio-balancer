var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
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

var usernameValue = process.env.USERNAME;
var passwordValue = process.env.PASSWORD;
var mongooseConnect = "mongodb://" + usernameValue + ":" + passwordValue + "@ds147905.mlab.com:47905/portfolio-balancer";
mongoose.connect(mongooseConnect);