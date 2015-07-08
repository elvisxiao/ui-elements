var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

router.get('/csvPreview', function(req, res) {
	res.render('csvPreview');
});

router.get('/uploaderDemo', function(req, res) {
	console.log('test');
	res.render('uploader');
});

router.get('/tree', function(req, res) {
	res.render('tree');
});

router.get('/ui', function(req, res) {
	res.render('ui');
});

router.get('/siderbar', function(req, res) {
	res.render('siderbar');
});

router.get('/treeSelect', function(req, res) {
	res.render('treeSelect');
});

router.get('/treeDialogSelect', function(req, res) {
	res.render('treeDialogSelect');
});

router.get('/multiSelect', function(req, res) {
	res.render('multiSelect');
});

router.get('/autoComplete', function(req, res) {
	res.render('autoComplete');
});

router.get('/organization', function(req, res) {
	res.render('organization');
});


router.get('/crop', function(req, res) {
	res.render('crop');
});

router.get('/css', function(req, res) {
	res.render('basecss');
});

router.get('/test', function(req, res) {
	res.render('test');
});

router.post('/upload', function(req, res) {
	try{
	// 	console.log(req);
		console.log(req.files);
	// 	console.log(req.body);
	// 	console.log(req.params);
	// 	var fileName = req.body.fileName;
	// 	var data = req.body.fileData;
	// 	var savePath = req.body.savePath || 'upload';
	// 	var fs = require('fs');
	// 	var path = require('path');

	// 	fs.writeFileSync(path.join('public', savePath, fileName), new Buffer(data, 'binary'), {flag: 'a'});

		var file = {savePath: '/upload/' + req.files.file.path, flag: true};
		console.log(file);
		res.send(file);
	}
	catch(err){
		console.log(err);
	}
});

module.exports = router;
