var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	console.log('commit code');
	res.send('commit code');
});


module.exports = router;