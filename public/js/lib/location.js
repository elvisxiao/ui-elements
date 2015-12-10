
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

Instance.setHash = function(hash, params) {
    var searchStr = Instance._generateString(params);
    var url = hash + (searchStr? '?' + searchStr : '');
    var state = {
	 	url : url
	};

	top.history.pushState(state, "", url);
}

Instance.setSearch = function(params) {
	var searchStr = Instance._generateString(params);

	if(searchStr) {
		var url = '?' + searchStr;
		var state = {
		 	url : url
		};

		top.history.pushState(state, "", url);
	}
}

Instance.setUrl = function(pathname, search, hash) {
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
}

module.exports = Instance;

