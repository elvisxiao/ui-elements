var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

router.get('/uploaderDemo', function(req, res) {
	console.log('test');
	res.render('uploader');
});

router.get('/tree', function(req, res) {
	res.render('tree');
});

router.get('/treeSelect', function(req, res) {
	res.render('treeSelect');
});

router.get('/treeDialogSelect', function(req, res) {
	res.render('treeDialogSelect');
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
		res.send('ok');
	}
	catch(err){
		console.log(err);
	}
});

module.exports = router;
