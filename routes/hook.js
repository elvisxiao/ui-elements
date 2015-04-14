var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	console.log('rep name：', JSON.parse(req.body).payload.repository.name)
	console.log('rep name：' + req.body.payload.repository.name);
	var exec = require('child_process').exec;
	var cmdStr = 'cd ~/bitbucket/ocui && git pull';
	exec(cmdStr, function(err, stdout, stderr){
		console.log(stdout);
	})
	res.send('hook called');
});

module.exports = router;