var dispatcher = require("../dispatcher");
var modelPortfolioService = require("../services/modelPortfolioService");

function ModelPortfolioStore() {
    var listeners = [];

    function onChange(listener) {
        getModelPortfolios(listener);
        listeners.push(listener);
    }
    
    function getModelPortfolios(cb){
        modelPortfolioService.getModelPortfolios().then(function (res) {
            cb(res);
        });
    }

    function addModelPortfolio(modelPortfolio) {
        modelPortfolioService.addModelPortfolio(modelPortfolio).then(function (res) {
            console.log(res);
            triggerListeners();
        });
    }

    function deleteModelPortfolio(modelPortfolio) {
        modelPortfolioService.deleteModelPortfolio(modelPortfolio).then(function (res) {
            console.log(res);
            triggerListeners();
        });
    }

    function triggerListeners() {
        getModelPortfolios(function (res) {
            listeners.forEach(function (listener) {
                listener(res);
            });
        });
    }

    dispatcher.register(function (payload) {
        var split = payload.type.split(":");
        if (split[0] === "modelPortfolio") {
            switch (split[1]) {
                case "addModelPortfolio":
                    addModelPortfolio(payload.modelPortfolio);
                    break;
                case "deleteModelPortfolio":
                    deleteModelPortfolio(payload.modelPortfolio);
                    break;
            }
        }
    });

    return {
        onChange: onChange
    }
}

module.exports = ModelPortfolioStore();