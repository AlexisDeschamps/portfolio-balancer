var $ = require("jquery");
var promise = require("es6-promise");
var resourceUrl = "http://localhost:7777/api/models";

module.exports = {
    addModel: function (model) {
        var Promise = promise.Promise;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: resourceUrl,
                data: JSON.stringify(model),
                method: "POST",
                dataType: "json",
                contentType: "application/json",
                success: resolve,
                error: reject
            });
        });
    },
    getModels: function () {
        var Promise = promise.Promise;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: resourceUrl,
                method: "GET",
                dataType: "json",
                success: resolve,
                error: reject
            });
        });
    },
    deleteModel: function (model) {
        var Promise = promise.Promise;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: resourceUrl + "/" + model._id,
                method: "DELETE",
                dataType: "json",
                success: resolve,
                error: reject
            });
        });
    }
}