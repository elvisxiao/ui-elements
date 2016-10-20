
var Instance = {}


Instance.toFixed = function(number, fixLength) {
    if(!number || !number.toFixed) {
        return '';
    }
    if(number === 0 || number === "0") {
        return 0;
    }
    
    return number.toFixed(fixLength || 2);
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

