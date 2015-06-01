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
		console.log(req.body);
		
		var repoName = JSON.parse(req.body.payload).repository.name;
		if(req.body.repository.name){
			repoName = req.body.repository.name
		}
		else{
			repoName = JSON.parse(req.body.payload).repository.name;
		}
		
		console.log('repo name:' + repoName);
		var exec = require('child_process').exec;
		var cmdStr = 'cd ~/bitbucket/' + pathMap[repoName] + ' && git pull';
		console.log('cmd:' + cmdStr);
		exec(cmdStr, function(err, stdout, stderr){
			console.log(stdout);
		})
	}
	catch(err){
		console.log('hook error:', err);
	}
	
	res.send('hook called');
});


module.exports = router;