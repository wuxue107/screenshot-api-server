var express = require('express');
var renderController = require('../server/controller/render');
var router = express.Router();
/* GET home page. */
router.get(/^\/(pdf\/.+)/,renderController.downloadPdf);

module.exports = router;
