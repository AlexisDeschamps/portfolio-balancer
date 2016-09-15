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

// Connect to mongodb database
//var opt = {
 //       user: config.username,
 //       pass: config.password,
 //       auth: {
//            authdb: 'portfolioModels'
//        }
//    };

mongoose.connect("mongodb://AlexisDeschamps:Alexmongolab4082!@ds147905.mlab.com:47905/portfolio-balancer");
//var connection = mongoose.createConnection(config.database.host, 'mydatabase', config.database.port, opt);
//mongoose.connect("mongodb://AlexisDeschamps:Alexmongolab4082!@ds147905.mlab.com:47905/portfolio-balancer");