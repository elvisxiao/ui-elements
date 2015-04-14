var express = require('express');
var router = express.Router();

//bitbucket 的hooks
router.post('/', function(req, res) {
	var pathMap = {
		OCUI: 'ocui',
		tinyp2p: 'tinyp2p',
		DaoYang: 'daoyang'
	}

	try{
		var repoName = JSON.parse(req.body.payload).repository.name;

		var exec = require('child_process').exec;
		var cmdStr = 'cd ~/bitbucket/' + pathMap[repoName] + ' && git pull';
		exec(cmdStr, function(err, stdout, stderr){
			console.log(stdout);
		})
	}
	
	res.send('hook called');
});


module.exports = router;