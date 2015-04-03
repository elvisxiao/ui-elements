var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var readFile = function(req, res){
    console.log(req.params);
    var fileName = req.params.file;
    var filePath = path.join(path.dirname(__dirname), 'json', fileName);
    console.log(filePath);
    fs.readFile(filePath, 'utf-8', function(err, data){
        res.send(JSON.stringify(data));
    })
}

router.get('/:file', readFile);

router.post('/:file', readFile);

router.put('/:file', readFile);

router.delete('/:file', readFile);

module.exports = router;
