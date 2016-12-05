
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

Instance.formatParams = function(searchStr) {
	if(!searchStr || typeof searchStr !== 'string') {
		return searchStr;
	}
	if(searchStr.indexOf('=') === -1) {
		return {};
	}
	if(searchStr.indexOf('?') === 0) {
		searchStr = searchStr.slice(1);
	}
	var params = {};
	var paraStrings = searchStr.split('&');
	
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

	return params;
}

Instance.getParams = function(frame) {
	if(!frame) {
		frame = window;
	}
	
	searchString = frame.location.search;
	var params = Instance.formatParams(searchString);
	if(!params) {
		params = {};
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
	var params1 = {};
	var index = url.indexOf('?');
	if(index > 0) {
		params1 = Instance.formatParams(url.slice(index + 1));
		url = url.slice(0, index);
	}
	var searchStr = '';
	if(search) {
		var params2 = Instance.formatParams(search);
		params2 = $.extend(params1, params2);
		searchStr = Instance._generateString(params2);
	}
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

Instance.replaceUrl = function(pathname, search, hash, needReload) {
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
	
	window.history.replaceState(state, "", url);
	
	if(typeof pathname === "boolean" || typeof search === "boolean" || typeof hash === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}
