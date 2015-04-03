var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var readFile = function(req, res){
    console.log(req.params);
    console.log(req.query);
    var fileName = req.query.file;
    var filePath = path.join(path.dirname(__dirname), 'json', fileName);
    console.log(filePath);
    fs.readFile(filePath, 'utf-8', function(err, data){
    	res.send(req.query.callback + '(' + data + ')');
    })
}

router.get('/', readFile);

router.post('/', readFile);

router.put('/', readFile);

router.delete('/', readFile);

module.exports = router;
