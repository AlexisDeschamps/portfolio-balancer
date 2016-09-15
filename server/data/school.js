var mongoose = require("mongoose");
var schoolSchema = mongoose.Schema({
	title: String,
	source: String,
	website: String,
	url: String,
	tickers: [{
		title: String,
		percent: {type: Number, min: 0, max: 100},
	}],
    name: String,
    tagline: String
});

module.exports = mongoose.model("school", schoolSchema);