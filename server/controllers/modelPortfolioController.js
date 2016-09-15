var mongoose = require("mongoose");
var ModelPortfolio = require("../data/modelPortfolio");
var _ = require("underscore");

var router = require("express").Router();
router.route("/modelPortfolios/:id?").get(getModelPortfolios).post(addModelPortfolio).delete(deleteModelPortfolio);

function getModelPortfolios(req, res) {
    ModelPortfolio.find(function (err, modelPortfolios) {
        if (err)
            res.send(err);
        else
            res.json(modelPortfolios);
    });
}

function addModelPortfolio(req, res) {
    var modelPortfolio = new ModelPortfolio(_.extend({}, req.body));
    modelPortfolio.save(function (err) {
        if (err)
            res.send(err);
        else
            res.json(modelPortfolio);
    });
}

function deleteModelPortfolio(req, res) {
    var id = req.params.id;
    ModelPortfolio.remove({ _id: id }, function (err, removed) {
        if (err)
            res.send(err)
        else
            res.json(removed);
    });
}

module.exports = router;