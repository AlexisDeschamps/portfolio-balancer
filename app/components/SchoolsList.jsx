global.jQuery = require('jquery');
var React = require("react");
React.Bootstrap = require('react-bootstrap');
React.Bootstrap.Select = require('react-bootstrap-select');
var SchoolInfo = require("./SchoolInfo.jsx")
var AddSchool = require("./AddSchool.jsx");
var PortfolioModels = require("./PortfolioModels.jsx");
var schoolService = require("../services/schoolService");
var selectedId;

var modelPortfoliosNames = [];
var tickerNames = [];
var suggestedPercentages = [];
var lastTradedPrices = [];
var testVar;

module.exports = React.createClass({
	getInitialState: function () {
		return {
			value: 'defaultUnknown'
		};
	},
	onModelSelect: function(value) {
		this.setState({value: value });
    },
   render: function() {	 

		var testFunct = function(value){
			return value + 1;
		};
		
		var getLastTradedPrice = function(symbol) {
			var url = 'http://query.yahooapis.com/v1/public/yql';
			var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

			return $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
			.then(function (data) {
				return {value: data.query.results.quote.LastTradePriceOnly}
			})
			.fail(function (jqxhr, textStatus, error) {
				var err = textStatus + ", " + error;
				console.log('Request failed: ' + err);}
			);
		};
		
		var getJSON = function(symbol) {
			var url = 'http://query.yahooapis.com/v1/public/yql';
			var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

			return $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env", function(data) { //return this
				$('#content').data('key', data);
			});
		};
			
		var getLastTradedPriceProcess = function(symbol) {
			getLastTradedPrice(function() {
				console.log('huzzah, I\'m done!');}, symbol);
		}
			
	    // Modify the received data to create a displayable array   
		var modelPortfolioData = this.props.schools;
		modelPortfoliosNames = [];
		modelPortfoliosNames.push({value: 'defaultUnknown', name: 'Select...'});
		for (i = 0; i < modelPortfolioData.length; i++) {
			modelPortfoliosNames.push({value: modelPortfolioData[i]._id, name: modelPortfolioData[i].title});
		}	
		// Find the selected object
		var selectedModelPortfolio;
		for (var i = 0; i < modelPortfolioData.length; i++) {
			if (modelPortfolioData[i]._id == selectedId) {
				selectedModelPortfolio = modelPortfolioData[i];
			}
		}
																																																														
		var testValueXD = testFunct(3);
		var newTestVar;
		getLastTradedPrice('VCN.TO').then(function(returndata){
			newTestVar = 2;
		});
		console.log(newTestVar);
		
		var textvarXD
		var json = getLastTradedPrice('VXC.TO');
		
		// Return display when no model is selected
		if (selectedModelPortfolio == null) {
			 return(
				<div className="row">
					<h3>Choose model portfolio: </h3>
					<div className="col-md-5">
						<Select onModelSelect= {this.onModelSelect}/>
					</div>
				</div>
				
			)
		}
		// Return display when a model is selected
		else {
			//Find the ticker names
			tickerNames = [];
			var tickers = selectedModelPortfolio.tickers;
			for (var i = 0; i < modelPortfolioData.length; i++) {
				tickerNames.push(tickers[i].title);
			}
			//Find the suggested percentages
			suggestedPercentages = [];
			for (var i = 0; i < modelPortfolioData.length; i++) {
				suggestedPercentages.push(tickers[i].percent);
			}
			// Find the last traded prices
			lastTradedPrices = [];
			for (var i = 0; i < modelPortfolioData.length; i++) {
				suggestedPercentages.push(tickers[i].percent);
			}
			return(
			   <div className="row">
					<h3>Choose model portfolio: </h3>
					<div className="col-md-5">
						<Select onModelSelect= {this.onModelSelect}/>
					</div>
					<div className="col-md-7">
					<h3>Vertical table</h3>
					</div>
					<div className="col-md-8">
						<Table />
					</div>
					
					
					
					
				
					
					
					<div className="col-md-6">
						<AddSchool />
					</div>
					<div className="col-md-6">
						{
							this.props.schools.map(function(s,index){
								return(
									<SchoolInfo info={s} key={"school"+index} />
								)         
							})
						}
					</div>
			   </div>
		   )
		}
   } 
});

var Select = React.createClass({
  getInitialState: function () {
    return {
      value: 'defaultUnknown',
      options: modelPortfoliosNames
    };
  },
  handleChange: function (e) {
    this.state.value = e.target.value;
	selectedId = e.target.value;
	this.props.onModelSelect(e.target.value);
  },
  render: function (props) {
    var createItem = function (item, key) {
      return <option key={key} value={item.value}>{item.name}</option>;
    };
    return (
      <div>
        <select onChange={this.handleChange} value={this.state.value}>
          {this.state.options.map(createItem)}
        </select>
        <h1>Favorite letter: {this.state.value}</h1>
      </div>
    );
  }
});

var Table = React.createClass({
  getInitialState: function () {
    return {
      value: 'defaultUnknown'
    };
  },
  render: function () {
    return (
		<div className="col-md-8">
			<table >
				<tr>
					<th>Ticker: </th>
					<TickerNamesRow />
				</tr>
				<tr>
					<th>Suggested distribution: </th>
					<SuggestedPercentagesRow />
				</tr>
				<tr>
					<th>Current price:</th>
					<td>555 77 855</td>
				</tr>
			</table>
        </div>
    );
  }
});

var TickerNamesRow = React.createClass({
	getInitialState: function () {
		return {
			value: 'defaultUnknown'
		};
	},
	render: function () {
		var tickerNamesRow = '';
		for (var i = 0; i < tickerNames.length; i++) {
			tickerNamesRow = tickerNamesRow + '<td>' + tickerNames[i] + ' ' + '</td>';
		}
		return (
			  <div className="content" dangerouslySetInnerHTML={{__html: tickerNamesRow}}></div>
		);
	}
});

var SuggestedPercentagesRow = React.createClass({
	getInitialState: function () {
		return {
			value: 'defaultUnknown'
		};
	},
	render: function () {
		var suggestedPercentagesRow = '';
		for (var i = 0; i < suggestedPercentages.length; i++) {
			suggestedPercentagesRow = suggestedPercentagesRow + '<td>' + suggestedPercentages[i] + '% ' + '</td>';
		}
		return (
			  <div className="content" dangerouslySetInnerHTML={{__html: suggestedPercentagesRow}}></div>
		);
	}
});