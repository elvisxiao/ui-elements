var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	// console.log('commit code', req.body);
	var exec = require('child_process').exec;
	var cmdStr = 'git pull';
	exec(cmdStr, function(err, stdout, stderr){
		console.log(stdout);
	})
	res.send('hook called');
});



module.exports = router;