var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");

//controllers
var schoolController = require("./controllers/schoolController");
var modelController = require("./controllers/modelController");

//Express request pipeline
var app = express();
app.use(express.static(path.join(__dirname, "../app/dist")));
app.use(bodyParser.json())
app.use("/api", schoolController);
app.use("/api", modelController);

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("Started listening on port", port);
});

// Connect to mongodb database
mongoose.connect("mongodb://localhost/schoolfinder");