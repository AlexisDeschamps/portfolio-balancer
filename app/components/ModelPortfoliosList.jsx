global.jQuery = require('jquery');
var React = require("react");
var ModelPortfolioInfo = require("./ModelPortfolioInfo.jsx")
var AddModelPortfolio = require("./AddModelPortfolio.jsx");
var modelPortfolioService = require("../services/modelPortfolioService");
var ReactDOM = require('react-dom');
var NotificationSystem = require('react-notification-system');

var modelPortfolioData;
var selectedId;
var selectedModelPortfolio;
var modelPortfoliosNames = [];
var tickerIsCustom = [];
var tickerNames = [];
var suggestedPercentages = [];
var lastTradedPrices = [];
var userUnits = [];
var userUnitsForCalculations = [];
var generateStepsButtonClicked = false;

var cashAmount = 0;
var leftoverCash;
var earnedCash;

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
	componentWillMount: function() {
		modelPortfolioData = this.props.modelPortfolios;
		modelPortfoliosNames = [];
		modelPortfoliosNames.push({value: 'defaultUnknown', name: 'Select model portfolio...'});
		for (i = 0; i < modelPortfolioData.length; i++) {
			modelPortfoliosNames.push({value: modelPortfolioData[i]._id, name: modelPortfolioData[i].title});
		}
	},
	getInitialState: function () {
		return {
			generateStepsClicked: false,
			customPortfolioClicked: false
		};
	},
	onModelSelect: function() {
		// Find the selected object
		if (selectedId == 'defaultUnknown') {
			selectedModelPortfolio = null;
			tickerIsCustom = [];
			tickerNames = [];
			suggestedPercentages = [];
			lastTradedPrices = [];
			userUnits = [];
		}
		else {
			for (var i = 0; i < modelPortfolioData.length; i++) {
				if (modelPortfolioData[i]._id == selectedId) {
					selectedModelPortfolio = modelPortfolioData[i];
				}
			}
		}
		this.setState({});
		if (this.refs.tickerDataTable != null) {
			this.refs.tickerDataTable.onModelSelect();
		}
    },
	onCreateCustomClick: function() {
		selectedId = 'custom';
		this.setState({});
		if (this.refs.tickerDataTable != null) {
			this.refs.tickerDataTable.onCustomClick();
		}
	},
	onGenerateStepsClick: function() {
		// Verify names
		for (var i = 0; i < tickerNames.length; i++) {
			if (!tickerNames[i]) {
				this.refs.popUp._addNotification("Please insert a valid ticker for row " + (i + 1) + ".");
				return;
			} 
		}
		// Verify distributions
		for (var i = 0; i < suggestedPercentages.length; i++) {
			if (!(suggestedPercentages[i] > 0)) {
				this.refs.popUp._addNotification("Please insert a valid distribution percentage for ticker " + tickerNames[i] + ".");
				return;
			} 
		}
		// Verify prices
		for (var i = 0; i < lastTradedPrices.length; i++) {
			if (!(lastTradedPrices[i] > 0)) {
				this.refs.popUp._addNotification("Please either insert a valid ticker or a custom price for ticker " + tickerNames[i] + ".");
				return;
			} 
		}
		// Verify units
		for (var i = 0; i < userUnits.length; i++) {
			if (!(userUnits[i] >= 0)) {
				this.refs.popUp._addNotification("Pleases insert a valid number of units for ticker " + tickerNames[i] + ".");
				return;
			} 
		}
		var totalDistribution = 0;
		// Verify total distributionvar totalDistribution = 0;
		for (var i = 0; i < suggestedPercentages.length; i++) {
			totalDistribution = totalDistribution + suggestedPercentages[i];
		}
		if (totalDistribution < 99.9 | totalDistribution > 100.1) {
			this.refs.popUp._addNotification("Please insert distributions that total up to a 100%.");
			return;
		}
		// Verify the cash amount
		if (!(cashAmount >= 0)) {
			this.refs.popUp._addNotification("Pleases insert a valid cash amount.");
			return;
		}
		this.setState({generateStepsClicked: true});
		generateStepsButtonClicked = true;
	},
	onCustomPortfolioClick: function() {
		this.setState({customPortfolioClicked: true});
	},
   render: function() {
		// Return display when no model is selected
		if (selectedId == null || selectedId == 'defaultUnknown') {
			 return(
				<div className="row valign-wrapper">
						<div className="col s9">
							<ModelPortfolioSelect id="modelPortfolioSelect" onModelSelect= {this.onModelSelect}/>
						</div>
						<div className="col s3">
							<UserInputButton id='customModelPortfolioButton' onCreateCustomClick={this.onCreateCustomClick }/>
						</div>
				</div>				
			)
		}
		// Return display when a model is selected
		else {
			return(
			   <div>
					<Notification ref={'popUp'}/>								
					<div className="row valign-wrapper">
						<div className="col s9">
							<ModelPortfolioSelect id="modelPortfolioSelect" onModelSelect= {this.onModelSelect}/>
						</div>
						<div className="col s3">
							<UserInputButton id='customModelPortfolioButton' onCreateCustomClick={this.onCreateCustomClick }/>
						</div>
					</div>				
					<TickersDataTable ref={'tickerDataTable'}/>
					<br></br>
					<br></br>
					<div className="row valign-wrapper">
						<div className="col s5">					
							<p>How much cash are you willing to invest?</p>
						</div>						
						<div className="col s7">		
							<UserInputText key='cashInputText' id= 'cashInputText' placeholder={0}/>
						</div>		
					</div>
					<UserInputButton id= 'generateStepsButton' onGenerateStepsClick={this.onGenerateStepsClick}/>
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
	this.props.onModelSelect();
  },
  render: function (props) {
    var createItem = function (item, key) {
      return <option key={key} value={item.value}>{item.name}</option>;
    };
    return (
        <select className="browser-default" onChange={this.handleChange} value={selectedId}>
          {this.state.options.map(createItem)}
        </select>
    );
  }
});

var TickersDataTable = React.createClass({
	getInitialState: function () {
		return {
			gotLastTradedPrices: false,
			initalizedUserUnitsArray: false
		};
	},
	onDeleteTickerClick: function(index) {
		tickerNames.splice(index, 1);
		suggestedPercentages.splice(index, 1);
		lastTradedPrices.splice(index, 1);
		userUnits.splice(index, 1);
		this.setState({});
	},
	onAddTickerClick: function() {
		tickerIsCustom.push(true);
		tickerNames.push('');
		suggestedPercentages.push(0);
		lastTradedPrices.push(-1);
		userUnits.push(0);
		this.setState({});
	},
	componentWillMount() {
		if (selectedId == 'custom')
			this.onCustomClick();
		else if (selectedId != 'defaultUnknown' && selectedId != null)
			this.onModelSelect();
	},
	onModelSelect: function() {
		var tickerData = selectedModelPortfolio.tickers;
		// Set ticker types
		tickerIsCustom = [];
		for (var i = 0; i < tickerData.length; i++) {
			tickerIsCustom.push(false);
		}
		//Find the ticker names
		tickerNames = [];
		for (var i = 0; i < tickerData.length; i++) {
			tickerNames.push(tickerData[i].title);
		}
		//Find the suggested percentages
		suggestedPercentages = [];
		for (var i = 0; i < tickerData.length; i++) {
			suggestedPercentages.push(tickerData[i].percent);
		}
		// Find the last traded prices
		lastTradedPrices = [];
		promises = [];
		for (var i = 0; i < tickerNames.length; i++) {
			promises.push(this.getLastTradedPrice(tickerData[i].title));
		}
		// Create asynchronous jquery calls, the component will re-render once the data has been acquired if needed
		if (this.state.gotLastTradedPrices == false) {
			// Initalize with dummy values
			for (var i = 0; i < tickerNames.length; i++) {
				lastTradedPrices.push(0);
			}
			this.getLastTradedPrices();
		}
		// Initalize the user units array with the right amount of entries if needed
		if (this.state.initalizedUserUnitsArray == false) {
			this.initializeUserUnitsArray();
		}
		this.setState({});
    },
	onCustomClick: function() {
		tickerIsCustom = [];
		tickerNames = [];
		suggestedPercentages = [];
		lastTradedPrices = [];
		userUnits = [];
		this.onAddTickerClick();
	},
	getTickerPrice: function (index) {
		// Find the last traded prices
		promise = [];
		promise.push(this.getLastTradedPrice(tickerNames[index]));
		$.when.apply($, promise).then(function() {
			for (var i = 0; i < arguments.length; i++) {
					var tickerPrice = parseFloat(arguments[i].lastTradePrice);
					if (tickerPrice)
						lastTradedPrices[index] = (parseFloat(arguments[i].lastTradePrice));
					else
						lastTradedPrices[index] = -1;
			}
			this.setState({gotLastTradedPrices: true});
		}.bind(this));
	},
	getLastTradedPrice: function(symbol) {
		var url = 'https://query.yahooapis.com/v1/public/yql';
			var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

			return $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
			.then(function (data) {
				if (data.query.results != null) 
					return {lastTradePrice: data.query.results.quote.LastTradePriceOnly}
				else
					return -1;
			})
			.fail(function (jqxhr, textStatus, error) {
				var err = textStatus + ", " + error;
				console.log('Request failed: ' + err);}
			);
    },
	getLastTradedPrices() {
		$.when.apply($, promises).then(function() {
			for (var i = 0; i < arguments.length; i++) {
					lastTradedPrices[i] = (parseFloat(arguments[i].lastTradePrice));
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
  render: function () {
	var tableBody = [];
	for (var i = 0; i < tickerNames.length; i++) {
		var tickerName;
		if (tickerIsCustom[i] == false) {
			tickerName = <UserInputText key={'userInputTickerName' + i} id={'userInputTickerName'} index={i} placeholder={'Ticker Name'} value={tickerNames[i]} getTickerPrice={this.getTickerPrice}/>
		}
		else {
			tickerName = <UserInputText key={'userInputTickerName' + i} id={'userInputTickerName'} index={i} placeholder={'Ticker Name'} value={tickerNames[i]} getTickerPrice={this.getTickerPrice}/>
		}
		var suggestedPercentage;
		if (tickerIsCustom[i] == false) {
			suggestedPercentage = <UserInputText key={'userInputSuggestedPercentage' + i} id={'userInputSuggestedPercentage'} index={i} value={suggestedPercentages[i]}/>
		}
		else {
			suggestedPercentage = <UserInputText key={'userInputSuggestedPercentage' + i} id={'userInputSuggestedPercentage'} index={i} placeholder={'0'} value={suggestedPercentages[i]}/>
		}
		var tickerPrice;
		if (lastTradedPrices[i] != -1) {
			tickerPrice = <UserInputText key={'userInputPrice' + i} id={'userInputPrice'} index={i} value={lastTradedPrices[i]}/>
		}
		else {
			tickerPrice = <UserInputText key={'userInputPrice' + i} id={'userInputPrice'} index={i} value={'...'}/>;
		}
		tableBody.push(
			<tr key={'tr' + i}>
				<td key={'tickerNameTD' + i}>{tickerName}</td>
				<td key={'suggestedPercentageTD' + i}>{suggestedPercentage}</td>
				<td key={'ticekrPriceTD' + i}>{tickerPrice}</td>
				<td key={'userUnitsTD' + i}><UserInputText key={'userInputUnits' + i} id={'userInputUnits'} index={i} placeholder={'0'}/></td>
				<td key={'deleteIconTD' + i}>
					<btn key={'deleteTickerButton' + i} className="btn-floating right btn-small waves-effect waves-light cyan lighten-1"
						onClick={this.onDeleteTickerClick.bind(this, i)}>
						<i key={'deleteIcon' + i} className="material-icons">remove</i>
					</btn>
				</td>
			</tr>
		);
	}
    return (
	<div>
		<table>
			<thead>
				<tr>
					<th data-field="Ticker">Ticker</th>
					<th data-field="Distribution">Distribution (%)</th>
					<th data-field="Price">Price ($)</th>
					<th data-field="Units">Units</th>
				</tr>
			</thead>
			<tbody>
				{tableBody}
			</tbody>
		</table>
		<br></br>
		<div style={{display: 'flex', justifyContent: 'center'}}>
			<btn className="btn-floating btn-small waves-effect waves-light cyan lighten-1"
				onClick={this.onAddTickerClick.bind(this)}>
				<i className="material-icons">add</i>
			</btn>
		</div>
	</div>
    );
  }
});

var UserInputText = React.createClass({
	getInitialState: function() {
    return {id: 'defaultId',
			index: '-1',
			placeholder: 'Default hint',
			value: '0'};
  },
   componentWillMount: function() {
	this.setState({id: this.props.id,
					index: this.props.index,
					placeholder: this.props.placeholder,
					value: this.props.value
				});
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({id: nextProps.id,
					index: nextProps.index,
					placeholder: nextProps.placeholder,
					value: nextProps.value
				});
	},
  handleChange: function(event) {
    this.setState({value: event.target.value});
	if (this.state.id == 'cashInputText') {
		cashAmount = parseFloat(event.target.value);
	}
	else if (this.state.id == 'userInputTickerName') {
		tickerNames[this.state.index] = event.target.value;
		this.props.getTickerPrice(this.state.index);
	}
	else if (this.state.id == 'userInputSuggestedPercentage') {
		suggestedPercentages[this.state.index] = parseFloat(event.target.value);
	}
	else if (this.state.id == 'userInputPrice') {
		lastTradedPrices[this.state.index] = parseFloat(event.target.value);
	}
	else if (this.state.id == 'userInputUnits') {
		userUnits[this.state.index] = parseInt(event.target.value);
	}
  },
  render: function() {
    return (
		<input
			type="text"
			placeholder={this.state.placeholder}
			value={this.state.value}
			onChange={this.handleChange} />
		);
	}
});

var UserInputButton = React.createClass({
	componentWillMount() {
		this.setState({id: this.props.id});
	},
	render: function() {
		if (this.state.id == 'generateStepsButton') {
			return (
						<button className="btn waves-effect waves-light cyan lighten-1" type="submit" name="action"
							onClick={this.props.onGenerateStepsClick}>
							Generate Steps
							<i className="material-icons right">send</i>
						</button>
			);
		}
		else if (this.state.id == 'customModelPortfolioButton') {
			return (
					<button className="btn waves-effect waves-light cyan lighten-1" type="submit" name="action"
						onClick={this.props.onCreateCustomClick}>
						<i className="material-icons right">create</i>
						Custom
					</button>
			);
		}
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
				userUnitsForCalculations[lowestRatioTickerIndex] = userUnitsForCalculations[lowestRatioTickerIndex] - 1;
				leftoverCash = leftoverCash + lastTradedPrices[lowestRatioTickerIndex];
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