var express = require('express');
var renderController = require('../server/controller/render');

var router = express.Router();
router.post('/pdf', renderController.renderPdf);
router.post('/book', renderController.renderBook);

router.post('/imgs', renderController.renderImages);
router.post('/img', renderController.renderImage);

module.exports = router;
