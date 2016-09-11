global.jQuery = require('jquery');
var React = require("react");
React.Bootstrap = require('react-bootstrap');
React.Bootstrap.Select = require('react-bootstrap-select');
var SchoolInfo = require("./SchoolInfo.jsx")
var AddSchool = require("./AddSchool.jsx");
var PortfolioModels = require("./PortfolioModels.jsx");
var schoolService = require("../services/schoolService");

var testArray = [
        { value: null, name: 'Select…' },
        { value: 'a', name: 'A' },
        { value: 'b', name: 'B' },
        { value: 'c', name: 'C' }
      ];

var modelPortfolios = [];

var Select = React.createClass({
  getInitialState: function () {
    return {
      value: '?',
      options: modelPortfolios
    };
  },
  handleChange: function (e) {
    this.state.value = e.target.value;
    this.forceUpdate();
  },
  render: function () {
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

module.exports = React.createClass({
   render:function(){
	    // Modify the received data to create a displayable array   
		var inputs = this.props.schools;
		modelPortfolios = [];
		for (i = 0; i < inputs.length; i++) {
			modelPortfolios.push({value: inputs[i]._id, name: inputs[i].name});
		}
        return(
           <div className="row">
				<h3>Choose model portfolio</h3>
				<div className="col-md-5">
                    <Select />
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
});