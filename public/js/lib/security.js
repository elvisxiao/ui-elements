var Security = {};

Security.removeXss = function(model){
	for(var key in model){
		var val = model[key];
		if(!val){
			continue;
		}
		if(typeof val === 'string'){
			model[key] = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
		else if(typeof val === 'object' && val.length){
			for(var i = 0; i < val.length; i++){
				var one = val[i];
				Security.removeXss(one);
			}
		}
		else if(typeof val === 'object'){
			Security.removeXss(val);
		}
	}

	return model;
}

module.exports = Security;