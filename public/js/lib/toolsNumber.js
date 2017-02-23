
var Instance = {}


Instance.toFixed = function(number, fixLength) {
    if(number === undefined || number === null || !number.toFixed) {
        return '';
    }
    if(number === 0 || number === "0") {
        return 0;
    }
    
    if(fixLength === undefined || fixLength === null) {
        fixLength = 2;
    }
    return number.toFixed(fixLength);
}

Instance.formatMoney = function(number, fixLength) {
    if(typeof number !== "number") {
    	number = parseFloat(number);
    }
    if(number == 0) {
    	return 0;
    }

    if(fixLength) {
    	number = number.toFixed(fixLength);
    }

    return number.toString().split('').reverse().join('').replace(/(\d{3}(?=\d)(?!\d+\.|$))/g, '$1,').split('').reverse().join('');
}

module.exports = Instance;

