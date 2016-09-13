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
var userUnits = [];

module.exports = React.createClass({
	getInitialState: function () {
		return {
			gotLastTradedPrices: 'false'
		};
	},
	onModelSelect: function(value) {
		this.setState({value: value});
    },
	getLastTradedPrice: function(symbol) {
		var url = 'http://query.yahooapis.com/v1/public/yql';
			var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

			return $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
			.then(function (data) {
				return {lastTradePrice: data.query.results.quote.LastTradePriceOnly}
			})
			.fail(function (jqxhr, textStatus, error) {
				var err = textStatus + ", " + error;
				console.log('Request failed: ' + err);}
			);
    },
   render: function() {
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
		// Return display when no model is selected
		if (selectedModelPortfolio == null) {
			 return(
				<div className="row">
					<h4>Choose model portfolio: </h4>
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
			promises = [];
			for (var i = 0; i < modelPortfolioData.length; i++) {
				promises.push(this.getLastTradedPrice(tickers[i].title));
			}
			// Create asynchronous jquery calls, the component will re-render once the data has been acquired
			$.when.apply($, promises).then(function() {
				lastTradedPrices = [];
				for (var i = 0; i < arguments.length; i++) {
					lastTradedPrices.push(arguments[i].lastTradePrice);
				}
				this.setState({gotLastTradedPrices: true});
			}.bind(this));
			// Initalize the user units array with the right amount of entries
			userUnits = [];
			for (var i = 0; i < modelPortfolioData.length; i++) {
				userUnits.push('');
			}
			return(
			   <div className="row">
					<h4>Choose model portfolio: </h4>
					<div className="col-md-5">
						<Select onModelSelect= {this.onModelSelect}/>
					</div>
					<div className="col-md-8">
						<Table />
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
      </div>
    );
  }
});

var Table = React.createClass({
  render: function () {
    return (
		<div className="col-md-8">
			<table >
				<tr>
					<th>Ticker: </th>
					<TickerNamesRow />
				</tr>
				<tr>
					<th>Distribution: </th>
					<SuggestedPercentagesRow />
				</tr>
				<tr>
					<th>Current price:</th>
					<LastTradedPricesRow />
				</tr>
				<tr>
					<th>Current units:</th>
					<UserUnitsRow />
				</tr>
			</table>
			<p>How much cash are you going to invest?</p>
			<UserInputText id= 'cashInputText'/>
			<p>Start selling to balance once cash has run out: </p>
			<UserInputCheckbox id= 'sellInputCheckbox'/>
			<UserInputButton id= 'generateStepsButton'/>
        </div>
    );
  }
});

var TickerNamesRow = React.createClass({
	render: function () {
		var tickerNamesRow = [];
		for (var i = 0; i < tickerNames.length; i++) {
			tickerNamesRow.push(<td>{tickerNames[i]}</td>);
		}
		return (
			<div>
				{tickerNamesRow}
			</div>
		);
	}
});

var SuggestedPercentagesRow = React.createClass({
	render: function () {
		var suggestedPercentagesRow = [];
		for (var i = 0; i < suggestedPercentages.length; i++) {
			suggestedPercentagesRow.push(<td>{suggestedPercentages[i]}%</td>);
		}
		return (
			<div>
				{suggestedPercentagesRow}
			</div>
		);
	}
});

var LastTradedPricesRow = React.createClass({
	render: function () {
		var lastTradedPricesRow = [];
		for (var i = 0; i < lastTradedPrices.length; i++) {
			lastTradedPricesRow.push(<td>{lastTradedPrices[i]}</td>);
		}
		return (
			<div>
				{lastTradedPricesRow}
			</div>
		);
	}
});

var UserUnitsRow = React.createClass({
	render: function () {
		var userUnitsRow = [];
		for (var i = 0; i < userUnits.length; i++) {
				userUnitsRow.push(<td><UserInputText id = {'unitUserInput' + i}/></td>);
		}
		return (
			<div>
				{userUnitsRow}
			</div>
		);
	}
});

var UserInputText = React.createClass({
  getInitialState: function() {
    return {id: 'defaultId',
			value: '0'};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    return (
      <input
        type="text"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
});

var UserInputCheckbox = React.createClass({
  getInitialState: function() {
    return {id: 'defaultId',
			value: '0'};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    return (
      <input
        type="checkbox"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
});

var UserInputButton = React.createClass({
  getInitialState: function() {
    return {id: 'defaultId',
			value: '0'};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    return (
      <button type="button"
	  onclick={this.handleChange}>
	  Generate Steps
	  </button>
    );
  }
});