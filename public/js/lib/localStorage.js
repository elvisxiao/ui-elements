/**
* @file 用于操作浏览器的本地存储 - LocalStorage
* @author Elvis Xiao
* @version 0.1 
*/

/**
* 用于操作浏览器的本地存储 - LocalStorage
* @exports oc.localStorage

* @example

//设置一个键值对到本地存储中
* oc.localStorage.set('user', {name: 'elvis xiao', email: 'ivesxiao@gmail.com'});

//根据主键获取存储的值
* oc.localStorage.get('user');

//删除指定key
* oc.localStorage.remove('user');

//清除所有该域下本地存储
* oc.localStorage.clear();
*/
var LocalStorage = {
	/** @property {object} storage - 浏览器本身的localStorage对象 */
	storage : window.localStorage
}

/**
* 存储一个键值对到本地存储中
* @param {string} key - 存储的key值
* @param {object} value - 存储的对象，内部会转化为JSON字符串存储
*/
LocalStorage.set = function(key, value){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return;
	}

	var strVal = JSON.stringify(value);
	this.storage[key] = strVal;
}

/**
根据key从已经存储的数据中取出对应的值
* @param {string} key - 存储的key值
* @return {object} value - 根据key值获取到的对象，如果没有则为null
*/
LocalStorage.get = function(key){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return null;
	} 

	var strVal = this.storage[key] || null;
	var jsonVal = JSON.parse(strVal);

	return jsonVal;
}

/**
* 根据key移除已经存储的对应值
* @param {string} key - 有则移除，无则不做任何操作
*/
LocalStorage.remove = function(key){
	this.storage.removeItem(key);
}

/**
* 清除当前域名下所有的本地存储信息
*/
LocalStorage.clear = function(){
	this.storage.clear();
}

module.exports = LocalStorage;

