
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


Instance.listToTree = function(list, idKey, parentIdKey, rootId, limitedLevel, ignoreDuty) {
    if(!list || !list.length) {
        return null;
    }
    list = list.slice(0);
    if(!idKey) {
        idKey = 'id';
    }
    if(!parentIdKey) {
        parentIdKey = 'parentId';
    }
    if(!rootId) {
        rootId = 1;
    }

    var rootNode = {};
    rootNode[idKey] = rootId;
    rootNode[parentIdKey] = 0;
    list.sort(function(a, b) {
        return a.ancestor - b.ancestor;
    });

    var len = list.length;
    var map = {};
    map[rootId] = rootNode;

    var getLevel = function(item) {
        item = $.extend({}, item);
        var level = 1;
        while(item[parentIdKey] != rootId && item[parentIdKey] > 0) {
            item = map[item[parentIdKey]];
            level ++;
        }

        return level;
    }

    for(var i = 0; i < len; i ++) {
        var item = list[i];
        var id = item[idKey];
        var parentId = item[parentIdKey];
        if(!map[parentId]) {
            console.log('PIS Tree 数据错误，节点未找到父节点；', item);
            if(!ignoreDuty) {
                return null;
            }
            else {
                continue;
            }
        }
        var level = getLevel(item);
        if(limitedLevel !== undefined && level > limitedLevel) {
            continue;
        }

        if(!map[parentId].items) {
            map[parentId].items = [];
        }
        map[parentId].items.push(item);
        map[id] = item;
    }

    return map[rootId];
}

module.exports = Instance;

