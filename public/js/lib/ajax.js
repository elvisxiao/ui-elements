/**
* @file 用于Rest结构的Ajax交互，提交的数据均为application/json类型
* @author Elvis
* @version 0.1 
*/ 

/**
* 用于Rest结构的Ajax交互，提交的数据均为application/json类型
* @exports oc.ajax

* @example
* oc.ajax.get('/list', function(res){
    console.log(res);
}, function(res){
    console.log(res.responseText);
})

* @example
* oc.ajax.post('/add', {id: 1, date: '2015-01-01'}, function(res){
    console.log(res);
})

*/
var Ajax = {}

/**
@inner 内部方法
@param {string} url - ajax的url地址
@param {string} method - post、get、put、delete
@param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
@params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入
*/
Ajax._send = function(url, method, data, cbOk, cbError){
    var self = this;
    var params = {
        url: url,
        type: "GET",
        headers: {
            "Content-Type": "application/json",
            // "Accept": "application/json"
        }
    }
    if(method){
        params.type = method;
    }
    if(data){
        params.data = JSON.stringify(data);
    }

    params.success = function(res){
        cbOk(res);
    }
    if(cbError){
        params.error = function(res){
            cbError(res);
        }
        // $.ajax(params, cbOk, cbError).done(cbOK).fail(cbError);
    }
    else{
        params.error = self.error;
        // $.ajax(params, cbOk, cbError).done(cbOk).fail(self.error);
    }

    $.ajax(params);
},

/**
* Get方法
* @param {string} url - ajax的url地址
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.get = function(url, cbOk, cbError) {
	this._send(url, null, null, cbOk, cbError);
}

/**
* Post方法
* @param {string} url - ajax的url地址
* @param {object} data - ajax的主题内容
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.post = function(url, data, cbOk, cbError) {
	this._send(url, "post", data, cbOk, cbError);
}

/**
* Put方法
* @param {string} url - ajax的url地址
* @param {object} data - ajax的主题内容
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.put = function(url, data, cbOk, cbError) {
	this._send(url, "put", data, cbOk, cbError);
}

/**
* Delete方法
* @param {string} url - ajax的url地址
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.delete = function(url, cbOk, cbError) {
	this._send(url, "delete", null, cbOk, cbError);
}

/**
* Ajax出错时，通用处理方法
* @param {object} res - HTTP Response,Ajax是服务器端返回的响应
*/
Ajax.error = function(res){
    oc.dialog.tips('Request error: ' + res.responseText);
    console.log('Request error:', res);
}

module.exports = Ajax;

