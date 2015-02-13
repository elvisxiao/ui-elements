var dbHelper = require('../db/dbHelper');

var instance = {
    collectionName: 'article',
    add: function(doc, cb){
        dbHelper.insert(this.collectionName, doc, function(record){
            cb(record);
        });
    },
    getList: function(cb){
        dbHelper.getList(this.collectionName, function(docs){
            cb(docs);
        })
    }
}

module.exports = instance;
