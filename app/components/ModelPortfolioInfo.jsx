var React = require("react");
var actions = require("../actions/ModelPortfolioActions");

module.exports = React.createClass({
    deleteModelPortfolio: function(e){
        e.preventDefault();
        actions.deleteModelPortfolio(this.props.info);
    },
    render:function(){
        return(
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.info.name}
                    <span className="pull-right text-uppercase delete-button" onClick={this.deleteModelPortfolio}>&times;</span>
                </div>
                <div className="panel-body">{this.props.info.tagline}</div>
            </div>
        )
    }
})