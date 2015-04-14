var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	console.log('commit code', req.params);
	res.send('commit code');
});

router.post('/', function(req, res) {
	console.log('commit code', req.body);
	res.send('commit code');
});



module.exports = router;