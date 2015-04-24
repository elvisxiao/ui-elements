
var Ajax = {}

Ajax._send = function(url, method, data, cbOk, cbError){
    var self = this;
    var params = {
        url: url,
        type: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }
    if(method){
        params.type = method;
    }
    if(data){
        params.data = JSON.stringify(data);
    }
    if(cbError){
        $.ajax(params, cbOk, cbError);
    }
    else{
        $.ajax(params, cbOk, self.error);
    }
},


Ajax.get = function(url, cbOk, cbError) {
	this._send(url, null, null, cbOk, cbError);
}

Ajax.post = function(url, data, cbOk, cbError) {
	this._send(url, "post", data, cbOk, cbError);
}

Ajax.put = function(url, data, cbOk, cbError) {
	this._send(url, "put", data, cbOk, cbError);
}

Ajax.delete = function(url, cbOk, cbError) {
	this._send(url, "delete", null, cbOk, cbError);
}

Ajax.error = function(res){
    oc.dialog.tips('Request error: ' + res.responseText);
    console.log('Request error:', res);
}

module.exports = Ajax;

