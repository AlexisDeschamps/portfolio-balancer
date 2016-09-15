var mongoose = require("mongoose");
var modelPortfolioSchema = mongoose.Schema({
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
}, { collection: 'modelPortfolios' });

module.exports = mongoose.model("modelPortfolio", modelPortfolioSchema);