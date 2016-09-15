var dispatcher = require("../dispatcher");

module.exports = {
    addSchool:function(school){
        dispatcher.dispatch({
           modelPortfolio:modelPortfolio,
           type:"modelPortfolio:addModelPortfolio" 
        });
    },
    deleteModelPortfolio:function(modelPortfolio){
        dispatcher.dispatch({
           modelPortfolio:modelPortfolio,
           type:"modelPortfolio:deleteModelPortfolio" 
        });
    }
}