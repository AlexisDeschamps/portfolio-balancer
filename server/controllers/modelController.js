var mongoose = require("mongoose");
var Model = require("../data/model");
var _ = require("underscore");

var router = require("express").Router();
router.route("/models/:id?").get(getModels).post(addModel).delete(deleteModel);

function getModels(req, res) {
    Model.find(function (err, models) {
        if (err)
            res.send(err);
        else
            res.json(models);
    });
}

function addModel(req, res) {
    var model = new Model(_.extend({}, req.body));
    model.save(function (err) {
        if (err)
            res.send(err);
        else
            res.json(model);
    });
}

function deleteModel(req, res) {
    var id = req.params.id;
    Model.remove({ _id: id }, function (err, removed) {
        if (err)
            res.send(err)
        else
            res.json(removed);
    });
}

module.exports = router;