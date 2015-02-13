
var LocalStorage = {
	storage : window.localStorage
}

LocalStorage.set = function(key, value){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return;
	}

	var strVal = JSON.stringify(value);
	this.storage.key = strVal;
}

LocalStorage.get = function(key){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return null;
	} 

	var strVal = this.storage[key] || null;
	var jsonVal = JSON.parse(strVal);

	return jsonVal;
}

LocalStorage.remove = function(key){
	this.storage.removeItem(key);
}

LocalStorage.clear = function(){
	this.storage.clear();
}

module.exports = LocalStorage;

