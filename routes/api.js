var express = require('express');
var renderController = require('../server/controller/render');

var router = express.Router();
router.post('/pdf', renderController.renderPdf);
router.post('/book', renderController.renderBook);

router.post('/imgs', renderController.renderImages);
router.post('/img', renderController.renderImage);

router.get('/book-page', renderController.renderBookPage);
router.post('/book-tpl', renderController.renderBookTpl);
router.post('/wkhtmltopdf-book', renderController.renderWkHtmlToPdfBook);
router.post('/wkhtmltopdf-pdf', renderController.renderWkHtmlToPdf);

module.exports = router;
