// var progress = require('./progress');
var dialog = require('./dialog');
var security = require('./security');
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
var Ajax = {
    lastParams: null
}

/**
@inner 内部方法
@param {string} url - ajax的url地址
@param {string} method - post、get、put、delete
@param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
@params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入
*/

Ajax._send = function(url, method, data, cbOk, cbError, keepHTML){
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
        if(!keepHTML) { //默认去除xss，可以选择保留----
            data = security.removeXss(data);
        }
        
        params.data = JSON.stringify(data);
    }

    params.success = function(res){
        // progress.done();
        cbOk(res);
    }
    if(cbError){
        params.error = function(res){
            res.status === 404 && Ajax.cb404 && Ajax.cb404();
            // progress.done();
            cbError(res);
        }
    }
    else{
        params.error = Ajax.error;
    }
    // progress.start();
    var handle = $.ajax(params);
    window.app && window.app.ajaxHandles && window.app.ajaxHandles.push(handle);
},

/**
* Get方法
* @param {string} url - ajax的url地址
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.get = function(url, cbOk, cbError, keepHTML) {
    this._send(url, null, null, cbOk, cbError, keepHTML);
}

/**
* Post方法
* @param {string} url - ajax的url地址
* @param {object} data - ajax的主题内容
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.post = function(url, data, cbOk, cbError, keepHTML) {
    this._send(url, "post", data, cbOk, cbError, keepHTML);
}

/**
* Put方法
* @param {string} url - ajax的url地址
* @param {object} data - ajax的主题内容
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.put = function(url, data, cbOk, cbError, keepHTML) {
    this._send(url, "put", data, cbOk, cbError, keepHTML);
}

/**
* Delete方法
* @param {string} url - ajax的url地址
* @param {function} cbOk - 200响应的回调方法，会将返回的response作为参数传入
* @params {function} cbError - 其他返回的响应事件，会将返回的response作为参数传入，可省略，省略时走error方法
*/
Ajax.delete = function(url, cbOk, cbError, keepHTML) {
    this._send(url, "delete", null, cbOk, cbError, keepHTML);
}

/**
* Download文件方法
* @param {string} url - ajax的url地址
* @param {object} data - ajax的主题内容
*/
Ajax.download = function(options){
    if(!options || !options.url) {
        alert('无URL属性');
        return;
    }

    var form = $('<form style="display: none;"></form>');
    if(options.data && typeof options.data === 'object') {
        for(var key in options.data) {
            if(options.data.hasOwnProperty(key)) {
                form.append('<input type="hidden" name="' + key + '" value="' + JSON.stringify(options.data[key]) + '" />')
            }
        }
    }
    
    form.attr('action', options.url).attr('method', options.method || 'GET').submit();
}

/**
* Ajax出错时，通用处理方法
* @param {object} res - HTTP Response,Ajax是服务器端返回的响应
*/
Ajax.error = function(res){
    // progress.done();
    if(res.status === 401 && Ajax.cb401) {
        Ajax.cb401();
    }
    else if(res.status === 404 && Ajax.cb404) {
        Ajax.cb404();
    }
    else if(res.responseText || res.text) {
        dialog.tips('Request error:' + (res.responseText || res.text).toString());
    }
}

module.exports = Ajax;

