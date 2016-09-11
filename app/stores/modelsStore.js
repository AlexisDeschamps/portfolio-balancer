var dispatcher = require("../dispatcher");
var modelService = require("../services/modelService");

function ModelStore() {
    var listeners = [];

    function onChange(listener) {
        getModels(listener);
        listeners.push(listener);
    }
    
    function getModels(cb){
        modelService.getModels().then(function (res) {
            cb(res);
        });
    }

    function addModel(model) {
        modelService.addModel(model).then(function (res) {
            console.log(res);
            triggerListeners();
        });
    }

    function deleteModel(model) {
        modelService.deleteModel(model).then(function (res) {
            console.log(res);
            triggerListeners();
        });
    }

    function triggerListeners() {
        getModels(function (res) {
            listeners.forEach(function (listener) {
                listener(res);
            });
        });
    }

    dispatcher.register(function (payload) {
        var split = payload.type.split(":");
        if (split[0] === "model") {
            switch (split[1]) {
                case "addModel":
                    addModel(payload.model);
                    break;
                case "deleteModel":
                    deleteModel(payload.model);
                    break;
            }
        }
    });

    return {
        onChange: onChange
    }
}

module.exports = ModelStore();