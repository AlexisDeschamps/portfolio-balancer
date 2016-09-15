global.jQuery = require('jquery');
var React = require("react");
var ModelPortfolioInfo = require("./ModelPortfolioInfo.jsx")
var AddModelPortfolio = require("./AddModelPortfolio.jsx");
var modelPortfolioService = require("../services/modelPortfolioService");
var ReactDOM = require('react-dom');
var NotificationSystem = require('react-notification-system');

var selectedId;
var modelPortfoliosNames = [];
var tickerNames = [];
var suggestedPercentages = [];
var lastTradedPrices = [];
var userUnits = [];
var userUnitsForCalculations = [];

var cashAmount = 0;
var leftoverCash;
var earnedCash;
var generateStepsButtonClicked = false;

var userEquityPerTicker = [];
var userProportionsPerTicker = [];
var ratioSuggestedVsUser = [];
var purchaseOrder = [];
var sellOrder = [];
var lastAverageRatioSuggestedVsUser;
var averageRatioSuggestedVsUser;
var absoluteDifference;
var lastAbsoluteDifference;
var lastAbsoluteDifferenceSet = false;
var stillUnbalancedAfterCashBalancing = false;

module.exports = React.createClass({
	getInitialState: function () {
		return {
			gotLastTradedPrices: false,
			generateStepsClicked: false,
			initalizedUserUnitsArray: false
		};
	},
	onModelSelect: function(value) {
		this.setState({value: value});
    },
	onGenerateStepsClick: function() {
		for (var i = 0; i < userUnits.length; i++) {
			if (isNaN(userUnits[i]) || userUnits[i] < 0) {
				this.refs.popUp._addNotification("Pleases insert a valid number of units for ticker " + tickerNames[i] + ".");
				return;
			} 
		}
		if (isNaN(cashAmount) || cashAmount < 0) {
			this.refs.popUp._addNotification("Pleases insert a valid cash amount.");
			return;
		}
		this.setState({generateStepsClicked: true});
		generateStepsButtonClicked = true;
	},
	getLastTradedPrice: function(symbol) {
		var url = 'https://query.yahooapis.com/v1/public/yql';
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
	getLastTradedPrices() {
		$.when.apply($, promises).then(function() {
			lastTradedPrices = [];
			for (var i = 0; i < arguments.length; i++) {
					lastTradedPrices.push(parseFloat(arguments[i].lastTradePrice));
			}
			this.setState({gotLastTradedPrices: true});
		}.bind(this));
	},
	initializeUserUnitsArray() {
		userUnits = [];
			for (var i = 0; i < tickerNames.length; i++) {
				userUnits.push(0);
			}
		this.setState({initalizedUserUnitsArray: true});
	},
   render: function() {
		var inlineBlockDisplayStyle = {
			display: "inline-block",
		};
	    // Modify the received data to create a displayable array   
		var modelPortfolioData = this.props.modelPortfolios;
		modelPortfoliosNames = [];
		modelPortfoliosNames.push({value: 'defaultUnknown', name: 'Select model portfolio...'});
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
				<div className="portfolio-balancer">
					<ModelPortfolioSelect id={"modelPortfolioSelect"} onModelSelect= {this.onModelSelect}/>
				</div>				
			)
		}
		// Return display when a model is selected
		else {
			//Find the ticker names
			tickerNames = [];
			var tickerData = selectedModelPortfolio.tickers;
			for (var i = 0; i < tickerData.length; i++) {
				tickerNames.push(tickerData[i].title);
			}
			//Find the suggested percentages
			suggestedPercentages = [];
			for (var i = 0; i < tickerData.length; i++) {
				suggestedPercentages.push(tickerData[i].percent);
			}
			// Find the last traded prices
			promises = [];
			for (var i = 0; i < tickerNames.length; i++) {
				promises.push(this.getLastTradedPrice(tickerData[i].title));
			}
			// Create asynchronous jquery calls, the component will re-render once the data has been acquired if needed
			if (this.state.gotLastTradedPrices == false) {
				this.getLastTradedPrices();
			}
			// Initalize the user units array with the right amount of entries if needed
			if (this.state.initalizedUserUnitsArray == false) {
				this.initializeUserUnitsArray();
			}
			return(
			   <div className="portfolio-balancer">
					<Notification ref={'popUp'}/>
					<ModelPortfolioSelect id={"modelPortfolioSelect"} onModelSelect= {this.onModelSelect}/> <br></br>
					<br></br>
					<TickersDataTable/>
					<br></br>
					<p style={inlineBlockDisplayStyle}>How much cash are you willing to invest?</p>
					<UserInputText id= 'cashInputText'/> <br></br>
					<br></br>
					<UserInputButton id= 'generateStepsButton' onGenerateStepsClick= {this.onGenerateStepsClick}/>
					<br></br>
					<BalancingSteps />
			   </div>
		    )
		}
    } 
});

var ModelPortfolioSelect = React.createClass({
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
        <select className="browser-default" onChange={this.handleChange} value={this.state.value}>
          {this.state.options.map(createItem)}
        </select>
    );
  }
});

var TickersDataTable = React.createClass({
  render: function () {
    return (
		<table>
			<tbody>
				<TickerNamesRow />
				<SuggestedPercentagesRow />
				<LastTradedPricesRow />
				<UserUnitsRow />
			</tbody>
		</table>
    );
  }
});

var TickerNamesRow = React.createClass({
	render: function () {
		var tickerNamesRow = [];
		for (var i = 0; i < tickerNames.length; i++) {
			tickerNamesRow.push(<td key={'ticker' + tickerNames[i]}>{tickerNames[i]}</td>);
		}
		return (
			<tr>
				<th>Ticker: </th>
			{tickerNamesRow}
			</tr>
		);
	}
});

var SuggestedPercentagesRow = React.createClass({
	render: function () {
		var suggestedPercentagesRow = [];
		for (var i = 0; i < suggestedPercentages.length; i++) {
			suggestedPercentagesRow.push(<td key={'suggestedPercentage' + i}>{suggestedPercentages[i]}%</td>);
		}
		return (
			<tr>
				<th>Distribution: </th>
				{suggestedPercentagesRow}
			</tr>
		);
	}
});

var LastTradedPricesRow = React.createClass({
	render: function () {
		var lastTradedPricesRow = [];
		for (var i = 0; i < lastTradedPrices.length; i++) {
			lastTradedPricesRow.push(<td key={'lastTradedPrice' + i}>{lastTradedPrices[i]}</td>);
		}
		return (
			<tr>
				<th>Current price:</th>
				{lastTradedPricesRow}
			</tr>
		);
	}
});

var UserUnitsRow = React.createClass({
	render: function () {
		var userUnitsRow = [];
		for (var i = 0; i < userUnits.length; i++) {
				userUnitsRow.push(<td key={'inputUserText' + i}><UserInputText inputUnitsTextNumber= {i}/></td>);
		}
		return (
			<tr>
				<th>Current units:</th>
				{userUnitsRow}
			</tr>
		);
	}
});

var UserInputText = React.createClass({
	getInitialState: function() {
    return {id: 'defaultId',
			inputUnitsTextNumber: '-1',
			value: '0'};
  },
   componentWillMount: function() {
	this.setState({id: this.props.id, inputUnitsTextNumber: this.props.inputUnitsTextNumber});
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
	if (this.state.id == 'cashInputText') {
		cashAmount = parseFloat(event.target.value);
	}
	else {
		userUnits[this.state.inputUnitsTextNumber] = parseInt(event.target.value);
	}
  },
  render: function() {
    return (
	<div class="input-field col s6">
      <input
        type="text"
        value={this.state.value}
        onChange={this.handleChange} />
		</div>
    );
  }
});

var UserInputButton = React.createClass({
  render: function() {
    return (
	  <button className="btn waves-effect waves-light cyan lighten-1" type="submit" name="action"
	  onClick={this.props.onGenerateStepsClick}>
	  Generate Steps
	  <i className="material-icons right">send</i>
	  </button>
    );
  }
});

var BalancingSteps = React.createClass({
  getInitialState: function() {
    return {id: 'balancingSteps',
			value: '0'};
  },
  calculatePortfolioStatistics() {
		lastAbsoluteDifference = absoluteDifference;
		// Calculate the amount of equity per ticker
		userEquityPerTicker = [];
		for (var i = 0; i < userUnitsForCalculations.length; i++) {
			userEquityPerTicker.push(userUnitsForCalculations[i] * lastTradedPrices[i]);
		}
		// Calculate the total equity for all tickers
		var totalEquity = 0;
		for (var i = 0; i < userEquityPerTicker.length; i++) {
			totalEquity = totalEquity + userEquityPerTicker[i];
		}
		// Calculate the proportion for each ticker of the total equity
		userProportionsPerTicker = [];
		for (var i = 0; i < userUnitsForCalculations.length; i++) {
			userProportionsPerTicker.push(userEquityPerTicker[i] / totalEquity * 100);
		}
		// Find the ratio of suggested distribution vs user distribution
		ratioSuggestedVsUser = [];
		for (var i = 0; i < userUnitsForCalculations.length; i++) {
			ratioSuggestedVsUser.push(userProportionsPerTicker[i] / suggestedPercentages[i] * 100);
		}
		// Find the average ratio of suggested distribution vs user distribution
		averageRatioSuggestedVsUser = 0;
		for (var i = 0; i < ratioSuggestedVsUser.length; i++) {
			averageRatioSuggestedVsUser = averageRatioSuggestedVsUser + ratioSuggestedVsUser[i];
		}
		averageRatioSuggestedVsUser = averageRatioSuggestedVsUser / ratioSuggestedVsUser.length;
  },
  getPurchaseOrderForCash() {
		while (absoluteDifference != 0) {
			this.calculatePortfolioStatistics();
			// Find the absolute difference between the current averageRatioSuggestedVsUser and 1
			absoluteDifference = Math.abs(100 - averageRatioSuggestedVsUser);
			// Set the last absolute difference to be the same if it has not been set before
			if (lastAbsoluteDifferenceSet == false) {
				lastAbsoluteDifference = absoluteDifference;
				lastAbsoluteDifferenceSet = true;
			}
			// If we are now making the portfolio less balanced, undo the last purchase and break the loop; otherwise, keep going
			if (absoluteDifference > lastAbsoluteDifference) {
				purchaseOrder.pop();
				break;
			}
			else {
				// Find the ticker with the lowest ratio
				var lowestRatioTickerIndex = 0;
				var currentLowestValue = ratioSuggestedVsUser[0];
				for (var i = 1; i < ratioSuggestedVsUser.length; i++) {
					if (ratioSuggestedVsUser[i] < currentLowestValue) {
						currentLowestValue = ratioSuggestedVsUser[i];
						lowestRatioTickerIndex = i;
					}
				}
				// Determine if we can purchase the ticker
				if (lastTradedPrices[lowestRatioTickerIndex] > leftoverCash) {
					stillUnbalancedAfterCashBalancing = true;
					break;
				}
				else {
					// Add the ticker index to the purchase order
					purchaseOrder.push(lowestRatioTickerIndex);
					// Add the ticker to the number of units
					userUnitsForCalculations[lowestRatioTickerIndex] = userUnitsForCalculations[lowestRatioTickerIndex] + 1;
					// Reduce the leftover cash by the price of the ticker to buy
					leftoverCash = leftoverCash - lastTradedPrices[lowestRatioTickerIndex];
				}
			}
		}
  },
  getPurchaseOrderForUnusedCash() {
		while (leftoverCash > 0) {
			this.calculatePortfolioStatistics();
			// Find the ticker with the lowest ratio
			var lowestRatioTickerIndex = 0;
			var currentLowestValue = ratioSuggestedVsUser[0];
			for (var i = 1; i < ratioSuggestedVsUser.length; i++) {
				if (ratioSuggestedVsUser[i] < currentLowestValue) {
					currentLowestValue = ratioSuggestedVsUser[i];
					lowestRatioTickerIndex = i;
				}
			}
			// Determine if we can purchase the ticker
			if (lastTradedPrices[lowestRatioTickerIndex] > leftoverCash) {
				break;
			}
			else {
				// Add the ticker index to the purchase order
				purchaseOrder.push(lowestRatioTickerIndex);
				// Add the ticker to the number of units
				userUnitsForCalculations[lowestRatioTickerIndex] = userUnitsForCalculations[lowestRatioTickerIndex] + 1;
				// Reduce the leftover cash by the price of the ticker to buy
				leftoverCash = leftoverCash - lastTradedPrices[lowestRatioTickerIndex];
			}
		}
  },
  getSellingOrder() {
	var highestRatioTickerIndex = 0;
	while (absoluteDifference != 0) {
			this.calculatePortfolioStatistics();
			// Find the absolute difference between the current averageRatioSuggestedVsUser and 1
			absoluteDifference = Math.abs(100 - averageRatioSuggestedVsUser);
			// Set the last absolute difference to be the same if it has not been set before
			if (lastAbsoluteDifferenceSet == false) {
				lastAbsoluteDifference = absoluteDifference;
				lastAbsoluteDifferenceSet = true;
			}
			// Find the ticker with the highest ratio
			highestRatioTickerIndex = 0;
			var currentHighestValue = ratioSuggestedVsUser[0];
			for (var i = 1; i < ratioSuggestedVsUser.length; i++) {
				if (ratioSuggestedVsUser[i] > currentHighestValue) {
					currentHighestValue = ratioSuggestedVsUser[i];
						highestRatioTickerIndex = i;
				}
			}
			// Check if we have at least one unit to sell
			if (userUnitsForCalculations[highestRatioTickerIndex] < 1) {
				notEnoughCapitalToBalance = true;
				break;
			}
			// Add the ticker index to the sell order
			sellOrder.push(highestRatioTickerIndex);
			// Add the ticker to the number of units
			userUnitsForCalculations[highestRatioTickerIndex] = userUnitsForCalculations[highestRatioTickerIndex] - 1;
			// Reduce the leftover cash by the price of the ticker to buy
			earnedCash = earnedCash + lastTradedPrices[highestRatioTickerIndex];
		}
  },
  render: function() {
	  if (generateStepsButtonClicked == false) {
		  return (<div></div>);
	  }
	  else {
		userUnitsForCalculations = userUnits.slice(0);
		leftoverCash = cashAmount;
		var balanceWithCashIntrusctions = [];
		var spendUnusedCashIntrustions = [];
		var balanceBySellingAndBuyingInstructions = [];
		balancedWithCash = false;
		spentUnusedCash = false;
		balancedBySellingAndBuying = false;
		notEnoughCapitalToBalance = false;
		var part1Header;
		var part2Header;
		var enoughCapitalToBalance;
		// Generate the instructions for balancing with cash
		purchaseOrder = [];
		lastAbsoluteDifferenceSet = false;
		this.getPurchaseOrderForCash();
		var stepCount = 1;
		var count = 0;
		for (var i = 0; i < tickerNames.length; i++) {
			count = 0;
			// Count the number of times the index appears in the purchase order array
			for (var j = 0; j < purchaseOrder.length; j++) {
				if (purchaseOrder[j] == i)
					count = count + 1;
			}
			// Add the HTML
			if (count > 0) {
				balancedWithCash = true;
 				balanceWithCashIntrusctions.push(<p key={'balanceWithCashIntrusctions-' + i}>{stepCount}. Buy {count} unit{count != 1 ? 's' : ''} of {tickerNames[i]}</p>);
				stepCount = stepCount + 1;
			}
		}
		// Generate the instructions for spending unused cash
		stepCount = 1;
		if (leftoverCash > 0) {
			purchaseOrder = [];
			lastAbsoluteDifferenceSet = false;
			this.getPurchaseOrderForUnusedCash();
			for (var i = 0; i < tickerNames.length; i++) {
				// Count the number of times the index appears in the purchase order array
				count = 0;
				for (var j = 0; j < purchaseOrder.length; j++) {
					if (purchaseOrder[j] == i)
						count = count + 1;
				}
				// Add the HTML
				if (count > 0) {
					stillUnbalancedAfterCashBalancing = false;
					spentUnusedCash = true;
					spendUnusedCashIntrustions.push(<p key={'spendUnusedCashIntrusctions-' + i}>{stepCount}. Buy {count} unit{count != 1 ? 's' : ''} of {tickerNames[i]}</p>);
					stepCount = stepCount + 1;
				}
			}
		}
		// Generate the instructions for balacing by buying and selling
		stepCount = 1;
		if (stillUnbalancedAfterCashBalancing) {
			// Sell units as long as it increases balance
			sellOrder = [];
			lastAbsoluteDifferenceSet = false;
			earnedCash = 0;
			this.getSellingOrder();
			// Purchase units with cash earned by selling
			purchaseOrder = [];
			lastAbsoluteDifferenceSet = false;
			leftoverCash = earnedCash;
			this.getPurchaseOrderForUnusedCash();
			for (var i = 0; i < tickerNames.length; i++) {
				// Count the number of times the index appears in the purchase order array
				// and subtract by the number of times it appears in the sell order array
				count = 0;
				for (var j = 0; j < purchaseOrder.length; j++) {
					if (purchaseOrder[j] == i)
						count = count + 1;
				}
				for (var j = 0; j < sellOrder.length; j++) {
					if (sellOrder[j] == i)
						count = count - 1;
				}
				// Add the HTML
				if (count > 0) {
					balancedBySellingAndBuying = true;
					balanceBySellingAndBuyingInstructions.push(<p key={'balanceByBuyingAndSellingInstructions-' + i}>{stepCount}. Buy {count} unit{count != 1 ? 's' : ''} of {tickerNames[i]}</p>);
					stepCount = stepCount + 1;
				}
				else if (count < 0) {
					balancedBySellingAndBuying = true;
					balanceBySellingAndBuyingInstructions.push(<p key={'balanceByBuyingAndSellingInstructions-' + i}>{stepCount}. Sell {Math.abs(count)} unit{Math.abs(count) != 1 ? 's' : ''} of {tickerNames[i]}</p>);
					stepCount = stepCount + 1;
				}
			}
		}
		// Add the HTML part headers
		if (!balancedWithCash && !spentUnusedCash && !balancedBySellingAndBuying && !notEnoughCapitalToBalance) {
			part1Header = <p style={{fontWeight: 'bold'}}>Portfolio is already balanced.</p>;
		}
		else if (!balancedWithCash && !spentUnusedCash && !balancedBySellingAndBuying && notEnoughCapitalToBalance) {
			part1Header = <p style={{fontWeight: 'bold'}}>Not enough capital to balance.</p>;
		}
		else if (balancedWithCash && !spentUnusedCash && !balancedBySellingAndBuying) {
			part1Header = <p style={{fontWeight: 'bold'}}>Balance with cash</p>;
		}
		else if (balancedWithCash && !spentUnusedCash && !balancedBySellingAndBuying) {
			part1Header = <p style={{fontWeight: 'bold'}}>Spend unused cash</p>;
		}
		else if (!balancedWithCash && !spentUnusedCash && balancedBySellingAndBuying  && !notEnoughCapitalToBalance) {
			part1Header = <p style={{fontWeight: 'bold'}}>Balance by buying and selling</p>;
		}
		else if (!balancedWithCash && !spentUnusedCash && balancedBySellingAndBuying  && notEnoughCapitalToBalance) {
			part1Header = <p style={{fontWeight: 'bold'}}>Balance by buying and selling</p>;
			enoughCapitalToBalance = <p style={{fontWeight: 'bold'}}>Not enough capital to balance further.</p>;
		}
		else if(balancedWithCash && spentUnusedCash && !balancedBySellingAndBuying) {
			part1Header = <p style={{fontWeight: 'bold'}}>Part 1: Balance with cash</p>;
			part2Header = <p style={{fontWeight: 'bold'}}>Part 2: Spend unused cash</p>;
		}
		else if (balancedWithCash && !spentUnusedCash && balancedBySellingAndBuying && !notEnoughCapitalToBalance) {
			part1Header = <p style={{fontWeight: 'bold'}}>Part 1: Balance with cash</p>;
			part2Header = <p style={{fontWeight: 'bold'}}>Part 2: Balance by buying and selling:</p>;
		}
		else if (balancedWithCash && !spentUnusedCash && balancedBySellingAndBuying && notEnoughCapitalToBalance) {
			part1Header = <p style={{fontWeight: 'bold'}}>Part 1: Balance with cash</p>;
			part2Header = <p style={{fontWeight: 'bold'}}>Part 2: Balance by buying and selling</p>;
			enoughCapitalToBalance = <p style={{fontWeight: 'bold'}}>Not enough capital to balance further.</p>;
		}
		
		return (
			<div>
				<h5>Instructions List</h5>
				{part1Header}
				{balanceWithCashIntrusctions}
				{part2Header}
				{spendUnusedCashIntrustions}
				{balanceBySellingAndBuyingInstructions}
				{enoughCapitalToBalance}
			</div>
		);
	  }
	}
});

var Notification = React.createClass({
	
  _notificationSystem: null,
  _addNotification: function(inNotificationMessage) {
	var notification = {message: this.notificationMessage, level: 'error', position: 'bc'};
	notification.message = inNotificationMessage;
    this._notificationSystem.addNotification(notification);
  },
  getInitialState: function() {
    return {notificationMessage: 'Notification message'};
  },
  componentDidMount: function() {
    this._notificationSystem = this.refs.notificationSystem;
  },
  render: function() {
    return (
      <div>
        <NotificationSystem ref="notificationSystem" />
      </div>
      );
  }
});