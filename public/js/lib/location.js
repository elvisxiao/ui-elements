
var Instance = {}

Instance._generateString = function(params) {
	if(typeof params === 'string') {
		return params;
	}
	else if(typeof params === 'object') {
		var arr = [];
	    for(var key in params) {
	    	arr.push(key + '=' + params[key]);
	    }

	    return arr.join('&');
	}

	return null;
}

Instance.getString = function(params) {
	return this._generateString(params);
}

Instance.getParams = function(frame) {
	if(!frame) {
		frame = window;
	}
	
	var params = {};

	var searchString;
	searchString = frame.location.search;
    if(searchString && searchString.indexOf('=') > -1) { //将hash的参数转为paras对象，传入widget
    	searchString = searchString.slice(1);
    	var paraStrings = searchString.split('&');
    	paraStrings.map(function(one) {
    		var keyValue = one.split('=');
    		var key = keyValue[0];
    		var val = decodeURI(keyValue[1]);
    		if(val.indexOf(',') > -1) {
    			val = val.split(',');
    		}
    		if(params[key]) {
    			if(typeof params[key] !== 'object') {
    				params[key] = [params[key]];
    			}
    			params[key].push(val);
    		}
    		else {
    			params[key] = val;
    		}
    	})
    }
    
	return params;
}

Instance.setHash = function(hash, params, needReload) {
    var searchStr = Instance._generateString(params);
    var url = hash + (searchStr? '?' + searchStr : '');
    var state = {
	 	url : url
	};

	top.history.pushState(state, "", url);

	if(typeof hash === "boolean" || typeof params === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}

Instance.setSearch = function(params, needReload) {
	var searchStr = Instance._generateString(params);

	if(searchStr) {
		var url = '?' + searchStr;
		var state = {
		 	url : url
		};

		top.history.pushState(state, "", url);
	}

	if(typeof params === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}

Instance.setUrl = function(pathname, search, hash, needReload) {
	var url = pathname;
	var searchStr = Instance._generateString(search);
	if(searchStr) {
		url += '?' + searchStr;
	}
	if(hash) {
		url += hash;
	}
	
	var state = {
	 	url : url
	};

	top.history.pushState(state, "", url);

	if(typeof pathname === "boolean" || typeof search === "boolean" || typeof hash === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}

module.exports = Instance;

