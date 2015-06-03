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
<<<<<<< HEAD
		var repoName = '';
		if(req.body.repository && req.body.repository.name){
			repoName = req.body.repository.name
		}
		else{
			console.log(JSON.parse(req.body.payload));
			repoName = JSON.parse(req.body.payload).repository.name;
		}
		
=======
		console.log(req.body);
		
		var repoName = JSON.parse(req.body.payload).repository.name;
>>>>>>> 657d80d2381803d58d44bed1b8c551f184963bf2
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