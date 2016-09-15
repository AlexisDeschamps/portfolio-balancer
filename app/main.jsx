var React = require("react");
var ReactDOM = require("react-dom");
var modelPortfoliosStore = require("./stores/modelPortfoliosStore");

var _modelPortfolios = [];
var getModelPortfoliosCallback = function(modelPortfolios){
    _modelPortfolios = modelPortfolios;
    render();
};
modelPortfoliosStore.onChange(getModelPortfoliosCallback);

var ModelPortfoliosList = require("./components/ModelPortfoliosList.jsx");

function render(){
    ReactDOM.render(<ModelPortfoliosList modelPortfolios={_modelPortfolios} />, document.getElementById("container"));    
}