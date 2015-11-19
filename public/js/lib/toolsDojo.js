
var Instance = {}

Instance.destroyByNode = function(node) {
    if(node.children && node.children.length) {
        var widget = dojo.dijit.registry.byNode(node.children[0]);
        if (widget) {
            widget.destroyDescendants();
            widget.destroyRecursive();
        }
    }
}

module.exports = Instance;

