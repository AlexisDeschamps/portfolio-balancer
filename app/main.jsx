var React = require("react");
var ReactDOM = require("react-dom");
var schoolsStore = require("./stores/schoolsStore");

var _schools = [];
var getSchoolsCallback = function(schools){
    _schools = schools;
    render();
};
schoolsStore.onChange(getSchoolsCallback);

var SchoolsList = require("./components/SchoolsList.jsx");

function render(){
    ReactDOM.render(<SchoolsList schools={_schools} />, document.getElementById("container"));    
}

var modelsStore = require("./stores/modelsStore");
var _models = [];
var getModelsCallback = function(models){
    _models = models;
    render();
};
modelsStore.onChange(getModelsCallback);
