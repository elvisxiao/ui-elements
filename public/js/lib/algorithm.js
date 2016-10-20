
var Instance = {}


Instance.depthFirstInTree = function(treeData, targetId, key) {
    if(!key) {
        key = 'items';
    }

    if(! (treeData instanceof Array) ) {
        treeData = treeData[key];
    }
    var ret = [];

    var find = function(list, arr, isFind) {
        for(var i = 0; i < list.length; i ++) {
            if(isFind) {
                return;
            }
            var model = list[i];
            arr.push(model);
            if(model.id == targetId) {
                ret = arr;
                isFind = true;
                return;
            }
            if(model.items && model.items.length) {
                find(model.items, arr.concat([]));
            }
            arr.pop();
        }
        if(i === list.length) {
            arr.pop();
        }
    };
    find(treeData, [], false);

    return ret.reverse();
}

module.exports = Instance;

