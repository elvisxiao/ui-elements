
var Ajax = {}

Ajax._send = function(url, method, data, cbOk, cbError){
    var params = {
        method   : "GET",
        // sync     : false,
        // handleAs : "json",
        headers  : {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }
    if(method){
        params.method = method;
    }
    if(data){
        params.data = JSON.stringify(data);
    }
   
    $.ajax(params, cbOk, cbError);
},


Ajax.get = function(url, cbOk, cbError) {
	this.send(url, null, null, cbOk, cbError);
}

Ajax.post = function(url, data, cbOk, cbError) {
	this.send(url, null, data, cbOk, cbError);
}

Ajax.put = function(url, data, cbOk, cbError) {
	this.send(url, null, data, cbOk, cbError);
}

Ajax.delete = function(url, cbOk, cbError) {
	this.send(url, null, null, cbOk, cbError);
}


module.exports = Ajax;

