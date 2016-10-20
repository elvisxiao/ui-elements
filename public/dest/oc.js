(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{"./dialog":7,"./security":14}],2:[function(require,module,exports){

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


},{}],3:[function(require,module,exports){
/*!
 * CSV-js: A JavaScript library for parsing CSV-encoded data.
 * Copyright (C) 2009-2013 Christopher Parker <http://www.cparker15.com/>
 *
 * CSV-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CSV-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CSV-js.  If not, see <http://www.gnu.org/licenses/>.
 */

(function (window, undefined) {
    'use strict';

    // Define local CSV object.
    var CSV = {};

    /**
     * Split CSV text into an array of lines.
     */
    function splitLines(text, lineEnding) {
        var strLineEnding = lineEnding.toString(),
            bareRegExp    = strLineEnding.substring(1, strLineEnding.lastIndexOf('/')),
            modifiers     = strLineEnding.substring(strLineEnding.lastIndexOf('/') + 1);

        if (modifiers.indexOf('g') === -1) {
            lineEnding = new RegExp(bareRegExp, modifiers + 'g');
        }

        // TODO: fix line splits inside quotes
        return text.split(lineEnding);
    }

    /**
     * If the line is empty (including all-whitespace lines), returns true. Otherwise, returns false.
     */
    function isEmptyLine(line) {
        return (line.replace(/^[\s]*|[\s]*$/g, '') === '');
    }

    /**
     * Removes all empty lines from the given array of lines.
     */
    function removeEmptyLines(lines) {
        var i;

        for (i = 0; i < lines.length; i++) {
            if (isEmptyLine(lines[i])) {
                lines.splice(i--, 1);
            }
        }
    }

    /**
     * Joins line tokens where the value of a token may include a character that matches the delimiter.
     * For example: "foo, bar", baz
     */
    function defragmentLineTokens(lineTokens, delimiter) {
        var i, j,
            token, quote;

        for (i = 0; i < lineTokens.length; i++) {
            token = lineTokens[i].replace(/^[\s]*|[\s]*$/g, '');
            quote = '';

            if (token.charAt(0) === '"' || token.charAt(0) === '\'') {
                quote = token.charAt(0);
            }

            if (quote !== '' && token.slice(-1) !== quote) {
                j = i + 1;

                if (j < lineTokens.length) {
                    token = lineTokens[j].replace(/^[\s]*|[\s]*$/g, '');
                }

                while (j < lineTokens.length && token.slice(-1) !== quote) {
                    lineTokens[i] += delimiter + (lineTokens.splice(j, 1))[0];
                    token = lineTokens[j].replace(/[\s]*$/g, '');
                }

                if (j < lineTokens.length) {
                    lineTokens[i] += delimiter + (lineTokens.splice(j, 1))[0];
                }
            }
        }
    }

    /**
     * Removes leading and trailing whitespace from each token.
     */
    function trimWhitespace(lineTokens) {
        var i;

        for (i = 0; i < lineTokens.length; i++) {
            lineTokens[i] = lineTokens[i].replace(/^[\s]*|[\s]*$/g, '');
        }
    }

    /**
     * Removes leading and trailing quotes from each token.
     */
    function trimQuotes(lineTokens) {
        var i;

        // TODO: allow for escaped quotes
        for (i = 0; i < lineTokens.length; i++) {
            if (lineTokens[i].charAt(0) === '"') {
                lineTokens[i] = lineTokens[i].replace(/^"|"$/g, '');
            } else if (lineTokens[i].charAt(0) === '\'') {
                lineTokens[i] = lineTokens[i].replace(/^'|'$/g, '');
            }
        }
    }

    /**
     * Converts a single line into a list of tokens, separated by the given delimiter.
     */
    function tokenizeLine(line, delimiter) {
        var lineTokens = line.split(delimiter);

        defragmentLineTokens(lineTokens, delimiter);
        trimWhitespace(lineTokens);
        trimQuotes(lineTokens);

        return lineTokens;
    }

    /**
     * Converts an array of lines into an array of tokenized lines.
     */
    function tokenizeLines(lines, delimiter) {
        var i,
            tokenizedLines = [];

        for (i = 0; i < lines.length; i++) {
            tokenizedLines[i] = tokenizeLine(lines[i], delimiter);
        }

        return tokenizedLines;
    }

    /**
     * Converts an array of tokenized lines into an array of object literals, using the header's tokens for each object's keys.
     */
    function assembleObjects(tokenizedLines) {
        var i, j,
            tokenizedLine, obj, key,
            objects = [],
            keys = tokenizedLines[0];

        for (i = 1; i < tokenizedLines.length; i++) {
            tokenizedLine = tokenizedLines[i];

            if (tokenizedLine.length > 0) {
                if (tokenizedLine.length > keys.length) {
                    throw new SyntaxError('not enough header fields');
                }

                obj = {};

                for (j = 0; j < keys.length; j++) {
                    key = keys[j];

                    if (j < tokenizedLine.length) {
                        obj[key] = tokenizedLine[j];
                    } else {
                        obj[key] = '';
                    }
                }

                objects.push(obj);
            }
        }

        return objects;
    }

    /**
     * Parses CSV text and returns an array of objects, using the first CSV row's fields as keys for each object's values.
     */
    CSV.parse = function (text, lineEnding, delimiter, ignoreEmptyLines) {
        var config = {
                lineEnding:       /[\r\n]/,
                delimiter:        ',',
                ignoreEmptyLines: true
            },

            lines, tokenizedLines, objects;

        // Empty text is a syntax error!
        if (text === '') {
            throw new SyntaxError('empty input');
        }

        if (typeof lineEnding !== 'undefined') {
            if (lineEnding instanceof RegExp) {
                config.lineEnding = lineEnding;
            } else {
                config.lineEnding = new RegExp('[' + String(lineEnding) + ']', 'g');
            }
        }

        if (typeof delimiter !== 'undefined') {
            config.delimiter = String(delimiter);
        }

        if (typeof ignoreEmptyLines !== 'undefined') {
            config.ignoreEmptyLines = !!ignoreEmptyLines;
        }

        // Step 1: Split text into lines based on line ending.
        lines = splitLines(text, config.lineEnding);

        // Step 2: Get rid of empty lines. (Optional)
        if (config.ignoreEmptyLines) {
            removeEmptyLines(lines);
        }

        // Single line is a syntax error!
        if (lines.length < 2) {
            throw new SyntaxError('missing header');
        }

        // Step 3: Tokenize lines using delimiter.
        tokenizedLines = tokenizeLines(lines, config.delimiter);

        // Step 4: Using first line's tokens as a list of object literal keys, assemble remainder of lines into an array of objects.
        objects = assembleObjects(tokenizedLines);

        return objects;
    };

    // Expose local CSV object somehow.
    if (typeof module === 'object' && module && typeof module.exports === 'object') {
        // If Node module pattern is supported, use it and do not create global.
        module.exports = CSV;
    } else if (typeof define === 'function' && define.amd) {
        // Node module pattern not supported, but AMD module pattern is, so use it.
        define([], function () {
            return CSV;
        });
    } else {
        // No AMD loader is being used; expose to window (create global).
        window.CSV = CSV;
    }
}(typeof window !== 'undefined' ? window : {}));
},{}],4:[function(require,module,exports){
var dropdown = require('./dropdown');

var BUSelect = function(options){
	this.config = {
		container: 'body',
		dataList: null,
		limited: null,
        showLevel: null,
		onlyLast: false //禁止选中非末级几点
	};

    this.onchange = null;
	
	this.ele = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}
	
	$(this.config.container).addClass('buSlc');
	var self = this;

	self.formatData = function(){
        if(self.config.dataList.items) {
            self.treeData = $.extend({}, self.config.dataList);
            return;
        }

        var rootTree = {
            "id"          : 1,
            "fid"         : 0,
            "items"    : [],
            "name"        : "PIS",
            "description" : "",
            "level"       : 1
        };

        var treeMap = {};
        treeMap[1] = rootTree;

        self.config.dataList.map(function(relation){
            var fid = relation["ancestor"];
            fTree = treeMap[fid];
            if(!fTree || !fTree.level){
                return true;
            }
            var tree = {
                "id"          : relation["descendant"],
                "fid"         : fid,
                "items"       : [],
                "name"        : relation["categoryName"],
                "description" : relation["description"],
                "level"       : fTree["level"] + 1,
                "segments"    : relation["segments"],
            };
            fTree["items"].push(tree);
            treeMap[tree["id"]] = tree;
        })
        
        self.treeData = rootTree;
        console.log('format data', rootTree);
    }

	self.initSelect = function(){
        $(self.config.container).addClass('zBuSelect');
        var div = $('<div class="mixSelectWrap"><p><input class="form-control zIpt" type="text" placeholder="Search here ..." /></p></div>');

        self.renderTree(self.treeData, div, 0);

        self.dropdownText = div[0].outerHTML;

        self.bindEvents();
    },

    self.renderTree = function(dataList, ele, level){
        if(!dataList || (self.config.showLevel && level > self.config.showLevel)){
            return;
        }

        var ul = $('<ul></ul>');

        if(dataList && dataList.length === undefined){ 
            self.renderTree(dataList.items, ul, 1);

            ul.appendTo(ele);

            return;
        }
        
        var len = dataList.length;

        for(var i = 0; i < len; i++){
            var one = dataList[i];
            one.level = level;
            var li = $('<li><p style="padding-left: ' + level * 15 + 'px" data-id="' + one.id + '">' + one.name + '</p></li>');
            
            li.appendTo(ul);

            if(one.items && one.items.length > 0){
                this.renderTree(one.items, li, level + 1);
            }
        }

        if(ul.find('li').length > 0){
        	ul.appendTo(ele);
            //非最后一级节点不允许选择 -----
            if(self.config.onlyLast){
            	ul.prev('p').addClass('disabled');
            }
        }
    }
	
	self.getResult = function(){
        var ret = [];
        $(self.config.container).find('.zBadge').each(function(){
            var badge = $(this);
            
            ret.push( parseInt(badge.attr('data-id')) );
        });

        return ret;
    }

    self.getResultModels = function(){
        var ids = this.getResult();

        var models = [];

        (function(target) {
            if(!target || !target.items || !target.items.map) {
                return;
            }

            for(var i = 0; i < target.items.length; i ++) {
                var one = target.items[i];
                if($.inArray( parseInt(one.descendant || one.id), ids) !== -1){
                    one.parent = target;
                    models.push(one);
                }
                arguments.callee.call(this, one);
            }
        })(self.config.dataList);


        return models;
    }

    //获取某个节点的Name----
    self.getNameById = function(id) {
        var ele = $(self.dropdownText);
        return ele.find('p[data-id="' + id + '"]:eq(0)').text();
    }
    
    //获取某个节点的级别，从1开始
    self.getLevelById = function(id) {
        var ele = $(self.dropdownText);
        return ele.find('p[data-id="' + id + '"]:eq(0)').parents('li').length;
    }

    //获取某个节点的id
    self.getIdByName = function(name) {
        var ele = $(self.dropdownText);
        var find = null;
        ele.find('p[data-id]:contains(' + name + ')').each(function() {
            var text = $(this).text();
            if(text === name) {
                find = $(this).attr('data-id');
                return find;
            }
        })
        return find;
    }

    self.setResult = function(list, disabled){
        var repoItem = $(self.config.container).html('');
        if(! (list && list.length) ){
            return;
        }

        for(var i = 0; i < list.length; i ++){
            var one = list[i];
            var name = one.name;
            if(!name) {
                name = self.getNameById(one.id);
            }
            repoItem.append('<label class="zBadge" data-id="' + one.id + '"><i class="icon-cancel-circle"></i>' + name + '</label>');
        }

        if(disabled){
            repoItem.find('.zBadge .icon-cancel-circle').remove();
        }

        self.onchange && self.onchange();
    }

    self.bindEvents = function(){
        var repoItem = $(self.config.container);
        repoItem.off('click').on('click', '.zBadge .icon-cancel-circle', function(e){
            e.stopPropagation();
            $(this).parent().remove();
            dropdown.remove(repoItem);
            self.onchange && self.onchange();
        })
        .on('click', function(e){
            e.stopPropagation();
            dropdown.remove(repoItem);
            var drop = dropdown.show(this, '', self.dropdownText);
            
            var ul = drop.find('.mixSelectWrap>ul');
            repoItem.find('.zBadge').each(function(){
                var badge = $(this);
                var id = this.getAttribute('data-id');
                var p = ul.find('p[data-id="' + id + '"]').addClass('active').data('target', badge);
                p.parent().find('>ul').hide();
            })

            drop.on('click', 'ul li p:not(.disabled)', function(e){
                var p = $(this);
                if(p.hasClass('active')) {
                    p.removeClass('active').data('target').remove();
                    p.data('target', null);
                    p.parent().find('>ul').show();

                    self.onchange && self.onchange();
                }
                else {
                    p.addClass('active');
                    var label = $('<label class="zBadge" data-id="' + p.attr('data-id') + '"><i class="icon-cancel-circle"></i>' + p.html() + '</label>');
                    label.appendTo(repoItem);
                    p.data('target', label);
                    p.parent().find('>ul').hide().find('p').each(function(){
                        var one = $(this).removeClass('active');
                        one.data('target') && one.data('target').remove();
                        one.data('target', null);
                    })

                    if(self.config.limited > 0) {
                        var len = repoItem.find('.zBadge').length;
                        
                        if(len - self.config.limited > 0){
                            repoItem.find('.zBadge:eq(' + (len - 2) + ')').remove();
                        }
                        
                        dropdown.remove(repoItem);
                    }
                    
                    self.onchange && self.onchange();
                }
            })
            .on('input', '.zIpt', function(){
                var val = $.trim(this.value).toUpperCase();

                drop.find('ul p').hide().each(function(){
                    var oneNode = $(this);
                    if(oneNode.html().toUpperCase().indexOf(val) !== -1){
                        oneNode.show();
                        oneNode.parents('li').find('>p').show();
                    }
                });
            });
        });

        $('body').off('click', '.zDropdown').on('click', '.zDropdown', function(e){
            e.stopPropagation();
        });

        $('body').on('click', function(){
            dropdown.remove(repoItem);
        });
    }

	self.formatData();
	self.initSelect();
}

module.exports = BUSelect;
},{"./dropdown":8}],5:[function(require,module,exports){
var Instance = {};

Instance.processRow = function(row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
        var innerValue = row[j] === null ? '' : row[j].toString();
        if (row[j] instanceof Date) {
            innerValue = row[j].toLocaleString();
        };
        var result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
            result = '"' + result + '"';
        if (j > 0)
            finalVal += ',';
        finalVal += result;
    }

    return finalVal + '\n';
}

Instance.getCsvString = function(rows) {
    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += Instance.processRow(rows[i]);
    }

    return csvFile;
}

Instance.export = function(filename, rows) {
    var csvString = Instance.getCsvString(rows);
    
    var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

module.exports = Instance;
},{}],6:[function(require,module,exports){
 
/**
* @file 用于Javascript Date类型的扩展
* @author Elvis
* @version 0.1 
*/ 

/**
* 用于Javascript Date类型的扩展
* @exports oc.date

* @example
* // returns 2015年01月01日
* oc.date.format('2015-01-01', 'yyyy年mm月dd日')
* @example
* // returns 一天的毫秒数（24 * 60 * 60000）
* oc.date.compare('2015-01-02', '2015-01-01')
*/
var ZDate = {};

/**
* 根据传入格式，格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.format = function(date, format){
    if(!date) {
        return '';
    }
    if(date.toString().indexOf('-') > 0 && date.toString().length === 10){
        date = date.toString().replace(/-/g, '/');
    }
    else if(/^\d{8}$/.test(date)) {
        date = date.toString().replace(/(\d{4})(\d{2})/g, '$1/$2/');
    };
    
    var reg = {
        yyyy: 'year',
        hh: 'hours',
        mm: 'month',
        dd: 'date',
        hh: 'hours',
        MM: 'minites',
        ss: 'seconds',
        ms: 'millSeconds'
    }
    
    var date = new Date(date);
    var model = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: date.getHours(),
        minites: date.getMinutes(),
        seconds: date.getSeconds(),
        millSeconds: date.getMilliseconds()
    }

    if(!format){
        format = 'yyyy-mm-dd';
    }
    
    for(var key in reg){
        var param = reg[key];
        var val = model[param];
        if(val.toString().length < 2){
            val = '0' + val.toString();
        }
        format = format.replace(key, val);
    }

    return format;
}

/**
* 根据传入格式，返回UTC时间的毫秒数
* @param {date} date 时间值 - 可以为Timespane
* @returns {number} UTC时间毫秒数
*/
ZDate.getUTCTimespan = function(date) {
    var date = new Date(date);
    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), 
        date.getUTCSeconds(), date.getUTCMilliseconds() );

    return date.getTime();
}

/**
* 根据传入格式，使用UTC时间格式化输出
* 格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.formatUTC = function(date, format) {
    if(!date) {
        return '';
    }
    var date = ZDate.getUTCTimespan(date);
    
    return ZDate.format(date, format);
}

/**
* 根据传入格式，使用PDT时间格式化输出
* 格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.formatPDT = function(date, format) {
    if(!date) {
        return '';
    }
    var date = ZDate.getUTCTimespan(date);
    
    var pdtDate = date - 8 * 60 * 60000;
    
    return ZDate.format(pdtDate, format);
}

/**
* 根据传入格式，格式必须为 '2015-12-12 13:01:01'
* 格式化本地时间的Timespan
* @param {str} 时间字符串 - '2015-01-01'、'2015-01-01 12'、 '2015-01-01 12:11'、'2015-01-01 12:12:12'格式
* @returns {number} number timespan
*/
ZDate.getLocaleTimespan = function(str) {
    if(!str || typeof str !== 'string') {
        return null;
    }

    str = str.replace(/(^\s*)|(\s*$)/g, ""); 
    if(str.length < 10) {
        return null;
    }

    if(str.length === 10) { //2015-12-11格式
        str += ' 00:00:00';
    }
    else if(str.length === 13) { //2015-12-11 12 格式
        str += ':00:00';
    }

    return new Date(str).getTime();
}

/**
* 比较时间大小，返回date1 - date2得到的timespane
* @param {date} date1 - 时间被减数: 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {date}  date2 - 时间减数: 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @returns {number} date1 - date2得到的timespane
*/
ZDate.compare = function(date1, date2){
    if(typeof date1 == "string"){
        date1 = date1.replace(/-/g, '/');
    }
    if(typeof date2 == "string"){
        date2 = date2.replace(/-/g, '/');
    }

    var date1 = new Date(date1).getTime();
    var date2 = new Date(date2).getTime();

    return date1 - date2;
}   

/**
* 根据传入的年，获取该年一共有多少周
* @param {number} year 四位的年（2015）
* @returns {number} 这一年一共有多少周，（52/53）
*/
ZDate.getWeeksByYear = function(year){
    var ret = 52;

    var year = parseInt(year + "");
    
    var has53Years = [1994,2000,2005,2011,2016,2022,2028,2033,2039,2044,2050,2056,2061,2067,2072,2078,2084,2089,2095,2101,2107,2112,2118,2124,2129,2135,2140,2146,2152,2157,2163,2168,2174,2180,2185,2191,2196,2203,2208,2214,2220,2225,2231,2236,2242,2248,2253,2259,2264,2270,2276,2281,2287,2292,2298,2304,2310,2316,2321,2327,2332,2338,2344,2349,2355,2360,2366,2372,2377,2383,2388,2394];
    
    if($.inArray(year, has53Years) !== -1){
        ret ++;
    }

    return ret;
}

/**
* 根据传入的date字符串或者timespan，返回该天在这一年中的第几周中：201406 - 2015年06周
* @param {object} date 传入的date字符串（2014-12-12或者2014/12/12)，或者timespan，默认值为JS当天
* @returns {string} 该天在这一年中的第几周中，如：201406 - 2015年06周
*/
ZDate.getWeekString = function(date) {
    if (!date) {
        date = new Date();
    }
    if (typeof date === 'string') {
        if(date.indexOf('-') > -1){
            date = date.replace(/-/g, '/');
        }
        else{
            var year = date.slice(0, 4);
            var month = date.slice(4, 6);
            var day = date.slice(6);
            date = year + '/' + month + '/' + day;
        }
    }
    date = new Date(date);

    if (date.getMonth() == 11 && date.getDate() > 20) {
        var anotherDay = new Date(date);
        anotherDay.setDate(anotherDay.getDate() + 6 - anotherDay.getDay());

        if (anotherDay.getFullYear() > date.getFullYear()) {
            return anotherDay.getFullYear() * 100 + 1;
        }
    }
    var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    var day = firstDayOfYear.getDay();
    firstDayOfYear.setDate(8 - firstDayOfYear.getDay());

    if (firstDayOfYear > date) {
        return date.getFullYear() * 100 + 1;
    }
    var week = Math.floor((date - firstDayOfYear) / (1000 * 60 * 60 * 24 * 7));

    return date.getFullYear() * 100 + week + 2;
}

/**
* 根据传入的date字符串或者timespan，返回该天在这一年中的第几周中：201406 - 2015年06周
* @param {string} week 传入的周字符串，格式为:201510，代表2015年的第十周
* @returns {object} 该周的起始时间值
*/
ZDate.getStartDateByWeek = function(week) {
    if (!week) {
        return '';
    }

    if (typeof week === 'string') {
        week = parseInt(week);
    }

    var year = Math.floor(week / 100);
    var w = week % 100;
    var weekDate = new Date(year, 0, 1);

    weekDate.setDate((w - 1) * 7 + 1 - weekDate.getDay());

    return weekDate;
}

/**
* 根据传入的周，获取下一周
* @param {string} week 传入的周字符串，格式为:201510，代表2015年的第十周
* @returns {string} 该周的下一周
*/
ZDate.getNextWeek = function(week) {
    if (typeof week === 'string') {
        week = week.replace(/-/g, '');
        week = parseInt(week);
    }
    var year = Math.floor(week / 100);
    var w = week % 100;
    if (w < 52) {
        return year * 100 + w + 1;
    } 
    if (w == 53) {
        return (year + 1) * 100 + 1;
    } 
 
    if (this.getWeeksByYear(year) == 52) {
        return (year + 1) * 100 + 1;
    } 

    return year * 100 + w + 1;
}


/**
* 周选择器，类似与日期选择控件一样，用来选择周，如201523代表2015年第23周
* @param {object} ipt 输入周的输入框对象或者jquery选择器
*/
ZDate.weekPicker = function(ipt){
    var ipt = $(ipt);
    var initVal = $.trim(ipt.val());

    var reanderTable = function(){
        var table = $('<table class="zWeekPicker"></table>');
        var thead = $('<thead></thead>').appendTo(table);
        var curr = new Date();
        if(!initVal){
            initVal = ZDate.getWeekString(curr).toString();
        }
        var year = initVal.slice(0, 4);
        var week = initVal.slice(4);
        
        thead.append('<tr><th colspan="100"><i class="icon-arrow-left"></i><span class="spanYear">' + year + '</span><i class="icon-arrow-right"></i></th></tr>');

        var tbody = $('<tbody></tbody>').appendTo(table);

        var weekCount = ZDate.getWeeksByYear(year);

        var tr = $('<tr></tr>').appendTo(tbody);
        for(var i = 0; i < weekCount; i++){
            if(i % 7 === 0){
                tr = $('<tr></tr>').appendTo(tbody);
            }
            var str = (i + 1).toString();
            if(i < 9){
                str = '0' + str;
            }
            tr.append('<td>' + str + '</td>')
        }
       
        tbody.find('td:contains(' + week + '):not(.zWeekPickerTag)').addClass('active');

        var weekStart = ZDate.getStartDateByWeek(year + week);

        var weekEnd = weekStart.getTime() + 6 * 24 * 60 * 60000;
        weekEnd = ZDate.format(weekEnd, 'mmdd');
        weekStart = ZDate.format(weekStart, 'mmdd');
        tbody.find('tr:last-child').append('<td colspan="10" class="zWeekPickerTag"><i class="icon-clock2"></i><span>' + weekStart + ' - ' + weekEnd + '</span></td>');

        table.on('click', 'thead i', function(e){
            var i = $(this);
            var eleYear = i.parent().find('.spanYear');
            var year = parseInt(eleYear.text());
            if(i.hasClass('icon-arrow-left')){
                year --;
            }
            else{
                year ++;
            }
            weekCount = ZDate.getWeeksByYear(year);
            if(weekCount == 52){
                table.find('td:contains(53)').remove();
            }
            else if(table.find('td:contains(53)').length === 0){
                // table.find('tbody tr:last-child').append('<td>53</td>');
                $('<td>53</td>').insertBefore(table.find('td.zWeekPickerTag'));
            }
            eleYear.html(year);
        })
        .on('mouseenter', 'tbody td:not(.zWeekPickerTag)', function(){
            var thisWeek = this.innerHTML;
            var thisYear = $(this).parents('table:eq(0)').find('.spanYear').html();
            var weekStart = ZDate.getStartDateByWeek(thisYear + thisWeek);
            var weekEnd = weekStart.getTime() + 6 * 24 * 60 * 60000;
            weekEnd = ZDate.format(weekEnd, 'mmdd');
            weekStart = ZDate.format(weekStart, 'mmdd');
            tbody.find('td.zWeekPickerTag span').html(weekStart + ' - ' + weekEnd);
        })
        .on('mouseleave', 'tbody', function() {
            var weekStart = ZDate.getStartDateByWeek(year + week);
            var weekEnd = new Date(weekStart).getTime() + 6 * 24 * 60 * 60000;
            weekEnd = ZDate.format(weekEnd, 'mmdd');
            weekStart = ZDate.format(weekStart, 'mmdd');
            
            tbody.find('td.zWeekPickerTag span').html(weekStart + ' - ' + weekEnd);
        })
        .on('click', function(e){
            e.stopPropagation();
        })

        $('body').on('click', function(){
            table.hide();
        })
        table.appendTo('body');

        return table;
    }

    var setTablePosition = function(ipt){
        var ele = $('.zWeekPicker');
        if(ele.length === 0){
            ele = reanderTable();
        }
        var offset = ipt.offset();
        var val = $.trim(ipt.val());

        if(!val || val.length !== 6) {
            val = ZDate.getWeekString(new Date()).toString();
        }
        var year = val.slice(0, 4);
        var week = val.slice(4);
        var weekStart = ZDate.getStartDateByWeek(year + week);
        var weekEnd = weekStart.getTime() + 6 * 24 * 60 * 60000;
        weekEnd = ZDate.format(weekEnd, 'mmdd');
        weekStart = ZDate.format(weekStart, 'mmdd');
        ele.find('.spanYear').html(year);
        ele.find('td.active').removeClass('active');
        ele.find('td:contains(' + week + '):not(.zWeekPickerTag)').addClass('active');
        ele.find('.zWeekPickerTag>span').html(weekStart + ' - ' + weekEnd);
        var left = offset.left;
        if(left + ele.outerWidth() > $('body').width()) {
            left = offset.left - ele.outerWidth() + ipt.outerWidth();
        }
        ele.css({
            'left': left,
            'top': offset.top + ipt.outerHeight(),
            'display': 'block'
        })
        
        ele.off('click', 'tbody td:not(.zWeekPickerTag)').on('click', 'tbody td:not(.zWeekPickerTag)', function(){
            ele.hide();
            var year = ele.find('.spanYear').text();
            var week = $(this).html();
            var text = year + week
            ipt.val(text);
            
            ipt.change();
            // ev = document.createEvent("HTMLEvents");  
            // ev.initEvent("change", false, true);  
            // ipt[0].dispatchEvent(ev);  
        })
    }

    ipt = $(ipt);

    ipt.on('click', function(e){
        e.stopPropagation();
        setTablePosition(ipt);
    })
}   


module.exports = ZDate;
},{}],7:[function(require,module,exports){
/**
* @file 以遮盖形式弹出错误提示，对话框等
* @author Elvis Xiao
* @version 0.1 
*/

/**
* 以遮盖形式弹出错误提示，对话框等
* @exports oc.dialog

* @example
* oc.dialog.tips('服务器端报错了', 2000)
* @example
* oc.dialog.confirm('确定要删除？', function(){
    console.log('well，真的删掉了');
}, function(){
    console.log('原来你只是逗我玩的');
})
*/
var Dialog = {
    template: '<div class="zDialogCover"><div class="zDialog"><div class="zDialogHd"></div><div class="zDialogBd"></div><div class="zDialogFt"><button class="zDialogOk" type="button">确 认</button><button class="zDialogCancel" type="button">取 消</button></div></div></div>'
};


/**
* 移除所有由oc.dialog生成的对话框
*/
Dialog.removeMadal = function(){
    this.removeAllTips();
    this.close();
    Dialog.resetBody();
},

/**
* 移除所有由dialog.open以外的对话框
*/
Dialog.removeAllTips = function(){
    $(".zLoading, .tips").remove();
    Dialog.resetBody();
},

/**
* 展示一个过了指定时间即消失的提示信息，一般内容简短
* @param {string} msg - 需要弹出的信息
* @param {number} time - 信息显示时长，单位为毫秒，可省略，默认为1500
* @param {function} callback - 时间到了之后回调的方法
*/
Dialog.tips = function(msg, time, cb){
    if(!msg) {
        return;
    }
    if(time === undefined){
        time = 1500;
    }
    if(typeof time === 'function'){
        cb = time;
        time = 1500;
    }
    var dialog = $(Dialog.template).addClass('tips');
    dialog.find('.zDialogFt').remove();
    dialog.find('.zDialogBd').html(msg);
    if(time > 0) {
        dialog.find('.zDialogHd').remove();
        
        setTimeout(function() {
            dialog.remove();
            cb && cb();
            Dialog.resetBody();
        }, time)
    }
    else {
        dialog.find('.zDialogHd').append('Tips<i class="zDialogClose close">×</i>');
        dialog.on('click', '.zDialogClose', function() {
            dialog.remove();
            cb && cb();
            Dialog.resetBody();
        })
    }
    dialog.appendTo('body');
    $(document.body).addClass('zDialogOn');
    
    return dialog;
}

/**
* 展示一个Loading信息，一般用于Ajax时的等待过程，使用较少
* @param {string} msg - 需要弹出的信息
* @param {number} time - 信息显示时长，单位为毫秒，可省略，默认为1500
* @param {function} callback - 时间到了之后回调的方法
*/
Dialog.loading = function(msg){
    this.removeMadal();
    var dialog = $(Dialog.template).addClass('tips');
    dialog.find('.zDialogHd, .zDialogFt').remove();
    dialog.find('.zDialogBd').html('<div class="zLoadingIcon"></div>' + msg);
    dialog.appendTo('body');

    return dialog;
}

Dialog.resetBody = function() {
    if($('.zDialogCover').length === 0) {
        $(document.body).removeClass('zDialogOn');
    }
}

/**
* 类似window.confirm，确认对话框
* @param {string} msg - 需要弹出的信息
* @param {function} cbOK - 用户点击了确认后的回调
* @param {function} cbNO - 用户点击取消后的回调
* @param {boolean} required - 如果弹出框中有个input输入框，则此参数用来设置此输入框是否必填
*/
Dialog.confirm = function(msg, cbOK, cbNO, required, autoRemove){
    var confirm = $(Dialog.template);
    confirm.find('.zDialogBd').html(msg);
    confirm.find('.zDialogHd').remove();

    confirm.appendTo('body').on('click', '.zDialogOk, .zDialogCancel', function(){
        var ipt = confirm.find('input, textarea');
        var val = '';
        if(ipt.length > 0){
            val = ipt.val();
        }
        
        if($(this).hasClass('zDialogOk')){
            if(required === true && ipt.length > 0 && (!val) ){
                Dialog.tips('message is required.');
                ipt.focus();
                return;
            }
            if(autoRemove !== false) {
                cbOK && cbOK(val);
                confirm.remove();
                Dialog.resetBody();
            }
            else {
                if(val) {
                    cbOK && cbOK(val, function() {
                        confirm.remove();
                        Dialog.resetBody();
                    });
                }
                else {
                    cbOK && cbOK(function() {
                        confirm.remove();
                        Dialog.resetBody();
                    });
                }   
            }
        }
        else{
            cbNO && cbNO(val);
            confirm.remove();
            Dialog.resetBody();
        }
    }).on('click', 'input, textarea', function(){
        confirm.removeClass('has-error');
    });

    confirm.focus();
    $(document.body).addClass('zDialogOn');
    
    return confirm;
}

/**
* 打开一个相对比较复杂的弹出框，需要手动关闭
* @param {string} title - 弹出标题
* @param {string} content - 弹出部分的内容，一般为html
* @param {function} cb - 弹出框完全展现之后的回调接口
*/
Dialog.open = function(title, content, cb, showFoot){
    this.removeMadal();
    if(!content){
        content = title;
        title = '';
    }

    var dialog = $(Dialog.template);
    dialog.find('.zDialogHd').append(title + '<i class="zDialogClose close">×</i>');
    dialog.find('.zDialogBd').append(content);
    if(typeof cb !== true && showFoot !== true) {
        dialog.find('.zDialogFt').remove();
    }

    dialog.appendTo(document.body);
    $(document.body).addClass('zDialogOn');
    
    if(cb && typeof cb == 'function') {
        setTimeout(cb, 300);
    }
    
    dialog.on('click', '.close, .zDialogClose, .zDialogCancel', function(){
        dialog.onclose && dialog.onclose();
        dialog.onClose && dialog.onClose();
        dialog.remove();
        Dialog.resetBody();
    })

    
    return dialog;
}

/**
* 关闭由oc.dialog.open打开的所有对话框
*/
Dialog.close = function(ele){
    if(ele) {
        ele = $(ele);
        if(!ele.hasClass('zDialogCover')) {
            ele = ele.parents('.zDialogCover');
        }
    }
    else {
        ele = $(".zDialogCover");
    }
    ele.remove();
    Dialog.resetBody();
}

Dialog.tooltips = function(msg, ele) {
    ele = $(ele);
    var tips = $('<span class="zTooltips none">' + msg + '</span>');
    
    tips.appendTo('body');
    tips.fadeIn(500, function() {
        setTimeout(function() {
            tips.fadeOut(500, function() {
                tips.remove();
            })
        }, 1500)
    });
    
    tips.css({
        left: ele.offset().left - parseInt(tips.css('width')) - 20,
        top: ele.offset().top
    })
    
    return tips;
}

Dialog.warn = function(msg, ele) {
    ele = $(ele);
    
    var removeTips = function(ele) {
        if(!ele) {
            return;
        }
        ele = ele.target || ele.srcElement || ele;
        ele = $(ele);
        var tips = ele.data('target');
        if(tips) {
            tips.data('timer') && clearTimeout(tips.data('timer'));
            tips.remove();
            ele.data('target', null);
        }
    };

    if(ele.data('target')) {
        removeTips(ele);
    }

    ele.off('click', removeTips);
    ele.on('click', removeTips);
    ele.on('blur', removeTips);

    var tips = $('<span class="zTooltips warn none">' + msg + '</span>');
    ele.after(tips);
    tips.fadeIn(200, function() {
        var timer = setTimeout(function() {
            removeTips();
        }, 5000);
        tips.data('timer', timer);
    });
    
    tips.css({
        left: ele.position().left,
        top: ele.position().top + ele.height() + 10
    });
    
    ele.data('target', tips);
    return tips;
}



module.exports = Dialog;



},{}],8:[function(require,module,exports){
module.exports = {
    show: function(target, title, content, defaultDirect) {
        var target = $(target);
        if(target.data('zTarget')){
            return;
        }
        var elePop = $('<div class="zDropdown" tabindex="1"><div class="zDropdownBd"></div></div>');
        
        elePop.find('.zDropdownBd').append(content);
        if(title){
            var hd = $('<div class="zDropdownHd"></div>').append(title);
            elePop.prepend(hd);
        }

        elePop.appendTo('body');
        this._setPosition(target, elePop, title, defaultDirect);
        elePop.data('zTarget', target);
        target.data('zTarget', elePop);

        return elePop;
    },
    
    remove: function(ele){
        if(!ele){
            ele = $('.zDropdown');
        }
        else{
            ele = $(ele);
            if(!ele.hasClass('zDropdown')){
                ele = ele.data('zTarget');
            }
        }

        if(ele && ele.each){
            ele.each(function(){
                var one = $(this);
                var target = one.data('zTarget');
                one.remove();
                one.data('zTarget', null);
                target && target.data('zTarget', null);
            })
        }
    },

    _setPosition: function(target, elePop, hasTitle, defaultDirect){
        var position = target.offset();
        var left = position.left;
        var top = position.top;
        var win = $(window);
        
        var origin = {
            upTop: top - elePop.outerHeight() - 8,
            downTop: top + target.outerHeight() + 8,
            leftLeft: left,
            rightLeft: left - elePop.outerWidth() + target.outerWidth()
        }

        //设置左边距离
        var targetLeft = origin.leftLeft;

        if(defaultDirect === "right" && origin.rightLeft > win.scrollLeft() ){
            targetLeft = origin.rightLeft;
            elePop.addClass('zDropdownRight');
        }
        else if( left + elePop.outerWidth() > win.scrollLeft() + win.width() ){
            targetLeft = origin.rightLeft;
            elePop.addClass('zDropdownRight');
        }

        //设置顶部距离
        var targetTop = origin.downTop;
        if(defaultDirect === "up" && origin.upTop > win.scrollTop()){
            targetTop = origin.upTop;
            elePop.addClass('zDropdownUp');
        }
        else if((targetTop + elePop.height() > win.outerHeight() + win.scrollTop()) ){ //下面位置不够放时，尝试放到上面去
            targetTop = origin.upTop;
            //判断上面位置是否足够放置，如果不行，去上或下高度比较大的一个
            if(targetTop < win.scrollTop() ){
                var alignTop = top - win.scrollTop();
                var alignBottom = win.outerHeight() - alignTop - target.outerHeight();
                var maxHeight = alignTop > alignBottom? alignTop : alignBottom;
                elePop.css('height', maxHeight - 20);
                if(hasTitle){
                    elePop.find('.zDropdownBd').css('height', maxHeight - 40);
                }
                if(alignBottom > alignTop){
                    targetTop = origin.downTop;
                }
                else{//下面的位置比上面高度小，放上去
                    targetTop = top - elePop.outerHeight() - 8;
                    elePop.addClass('zDropdownUp');
                }
            }
            else{ //上面位置够，放上去
                elePop.addClass('zDropdownUp');
            }
        }
        

        elePop.css({
            left: targetLeft,
            top: targetTop,
            "min-width": target.outerWidth()
        })
    }
}

},{}],9:[function(require,module,exports){
/** 
* @file CSV文件预览与标记 
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* CSV文件预览与标记
* @class FileView
* @constructor
* @param {object} options 配置变量对象：<br /> container为容器对象<br />canEdit：csv是否允许编辑状态<br />maxHeight：最大高度<br />heads：指定头部列
* @example
* var fileView = new FileView({
    container: '#container',
    maxHeight: 400
})
*/

var dialog = require('./dialog.js');
var ui = require('./ui.js');
var FileView = function(options){
    /** @memberof FileView */

    /**@property {function} csv 读取csv文件的第三方库文件*/
    this.csv = require('./asset/csv');

    /**@property {object} ele - 最外层Jquery对象*/
    this.ele = null;

    /**@property {object} _dataList - 根据CSV内容，格式化后的Model集合 */
    this._dataList = [];

    /**@property {boolean} canEdit - 生成后的表格是否允许编辑 */
    this.canEdit = true;

    /**@property {number} maxHeight - 容器最大高度，超过此高度后将出现滚动条 */
    this.maxHeight = 800;

    /**@property {object} config - 初始化配置文件<br>
    *container: 容器选择器<br>
    *canEdit: csv是否可编辑<br>
    *maxHeight: 最大允许的高度，超出后会出现滚动条<br>
    *heads：指定头部列名
    */

    this.config = {
        container: 'body',
        canEdit: true,
        maxHeight: 800,
        heads: [],
        removeEmptyLine: false,
        afterLoad: null,
        validHeads: null
    };

    for(var key in options){
        if(this.config.hasOwnProperty(key)){
            this.config[key] = options[key];
        }
    }

    var self = this;

    /** 
    * @method _render 初始化界面
    * @memberof FileView 
    * @instance
    */
    self._render = function(){
        self.ele = $('<div class="zUploader"></div>');
        var uploadList = $('<div class="zUploaderList"></div>');
        uploadList.append(self._renderNoFile());
        self.ele.append(uploadList);
        self.ele.appendTo(self.config.container);
    }

    /** 
    * @method _renderNoFile 没有文件时，显示的界面
    * @memberof FileView 
    * @instance */
    self._renderNoFile = function(){
        var div = $('<div class="zUploaderNoFile" style="padding:15px 0 0 0;"></div>');
        div.append('<span class="zUploaderFileBtn "><input type="file" accept=".csv,.xls" /><span class="zUploaderBtnText">点击选择文件</span></div>');
        div.append('<p>或将文件拖到这里, 暂仅支持CSV/XLS格式的文件</p>');

        return div;
    }

    /**
    * 绑定容器中的相关事件
    * @method _bindEvent
    * @memberof FileView 
    * @instance 
    */
    self._bindEvent = function(){
        self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
            self._readFilesToTable(this.files[0]);
            var ipt = self.ele.find('.zUploaderFileBtn input[type="file"]');
            ipt.replaceWith(ipt[0].outerHTML);
        });

        self.ele.find('.zUploaderNoFile')[0].addEventListener("drop", function(e){
            $(this).css('border', '3px dashed #e6e6e6');
            e.preventDefault();
            self._readFilesToTable(e.dataTransfer.files[0]);
        })
        self.ele.on('dragenter', '.zUploaderNoFile', function(e){
            e.preventDefault();
            $(this).css('border', '3px dashed #aaa');
        }).on('dragleave', '.zUploaderNoFile', function(e){
            e.preventDefault();
            $(this).css('border', '3px dashed #e6e6e6');
        });
        $(document).on({
            dragleave: function(e){e.preventDefault();},
            drop: function(e){e.preventDefault();},
            dragenter: function(e){e.preventDefault();},
            dragover: function(e){e.preventDefault();},
        })
        
        self.ele.on('change', '.zFileTable tbody td input', function(){
            var val = this.value;
            var ele = $(this);
            var td = ele.parent();
            var index = td.attr('data-index');

            var indexArr = index.split(',');
            var i = indexArr[0];
            var j = indexArr[1];
            self._dataList[i][j] = val;
        })
    }

    /**
    * 根据文件类型分方式读取文件内容
    * @method read
    * @param {object} file - 需要读取的文件对象
    * @param {function} cb - 文件读取完成后的回调函数
    * @memberof FileView
    * @instance
    */
    self.read = function(file, cb) {
        //excel文件，使用服务器上传并读取---
        if(file.name.indexOf('.csv') === -1) {
            self.readXls(file, cb);
        }
        else {
            self.readCsv(file, cb);
        }
    }



    /**
    * 读取Excel文件内容
    * @method readXls
    * @param {object} file - 需要读取的文件对象
    * @param {function} cb - 文件读取完成后的回调函数
    * @memberof FileView 
    * @instance
    */
    self.readXls = function(file, cb){
        var xhr = new XMLHttpRequest();

        xhr.open('POST', "/product/util/xlsReader.jsp", true);
        var data = new FormData();
        data.append('file', file);
        xhr.upload.onerror = function(err){
            oc.dialog.tips('上传文件时发生错误，请稍后再试');
            ui.loading(self.ele, true);
            cb();
        }
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status !== 200) {
                oc.dialog.tips('文件传输中断:' + xhr.statusText);
                ui.loading(self.ele, true);
                cb();
                return;
            }
            if(xhr.readyState == 4 && xhr.status == 200) { 
                ui.loading(self.ele, true);
                try {
                    self._dataList = JSON.parse(xhr.response);
                    if(self.config.removeEmptyLine) {
                        self._dataList = self._dataList.filter(function(one) {
                            var isEmptyLine = true;
                            for(var key in one) {
                                if(one[key].toString().trim()) {
                                    isEmptyLine = false;
                                }
                            }
                            return !isEmptyLine;
                        });
                    }
                    cb();
                }
                catch(err) {
                    oc.dialog.tips('文件解析错误:' + err);
                    cb();
                }
            }
        }
        ui.loading(self.ele);
        xhr.send(data);
    }

    /**
    * 读取CSV文件内容
    * @method readCsv
    * @param {object} file - 需要读取的文件对象
    * @param {function} cb - 文件读取完成后的回调函数
    * @memberof FileView 
    * @instance
    */
    self.readCsv = function(file, cb){
        var reader = new FileReader();
        var tryGB2312 = false;
        reader.onload = function(e){
            $('input[type="file"]').replaceWith($('<input type="file" accept=".csv,.xls">'));
            var content = reader.result;
            if(content.indexOf('�') !== -1 && !tryGB2312){
                reader.readAsText(file, "GB2312");
                tryGB2312 = true;
                return;
            }
            self._formatFileContent(content);
            cb();
        }
        
        reader.readAsText(file);
    }
    
    /**
    * 将CSV文件内容写成格式化的Model对象数组，并存入_dataList变量中 
    * @method _formatFileContent 
    * @param {string} content - 需要读取的文件内容
    * @memberof FileView
    * @instance
    */
    self._formatFileContent = function(content){
        var models = null;
        try {
            models = self.csv.parse(content);
        }
        catch(e) {
            console.log('转换csv失败：', e);
            dialog.tips('文件读取失败，请检查文件格式', -1);
            return;
        }

        var firstItem = models[0];
        var keys = [];
        for(var key in firstItem){
            keys.push(key);
        }
        self._dataList = [];
        self._dataList.push(keys);

        for(var i = 0; i < models.length; i++){
            var item = models[i];
            var datas = [];
            var isEmptyLine = true;
            for(var key in item) {
                var value = $.trim(item[key]);
                if(value) {
                    isEmptyLine = false;
                }
                datas.push(value);
            }

            if(!isEmptyLine || !self.config.removeEmptyLine) {
                self._dataList.push(datas);
            }
        }
    }

    /**
    * 根据文件内容生成用Table展示出来
    * @method _readFilesToTable
    * @param {object} file - 需要读取的文件对象
    * @memberof FileView
    * @instance
    */
    self._removeEmptyCols = function(){
        var keys = self._dataList[0].concat();
        keys = keys.reverse();
        var realLength = 0;
        for(var i = 0; i < keys.length; i ++) {
            if($.trim(keys[i]) || realLength !== 0) {
                realLength ++;
            }
        }
        keys.reverse();
        self._dataList = self._dataList.map(function(one) {
            return one.slice(0, realLength);
        })
    }

    /**
    * 根据文件内容生成用Table展示出来
    * @method _readFilesToTable
    * @param {object} file - 需要读取的文件对象
    * @memberof FileView
    * @instance
    */
    self._readFilesToTable = function(file){
        self.read(file, function() {
            $('.zFileTableContainer').remove();
            var tableContainer = $('<div class="zFileTableContainer"><table class="zFileTable"></table></div>');
            if(self.config.maxHeight){
                tableContainer.css('max-height', self.config.maxHeight + 'px');
            }
            var ret = tableContainer.find('.zFileTable');
            if(self._dataList && self._dataList.length > 0) {
                self._removeEmptyCols();
                var keys = self._dataList[0];
                if(self.config.validHeads && self.config.validHeads.length) {
                    if(self.config.validHeads.length !== keys.length) {
                        oc.dialog.tips("File head error: " + self.validHeads.join(','));
                        return;
                    }
                    self.config.validHeads.map(function(key, index) {
                        if(keys[index].toString().trim() !== key.toString().trim()) {
                            oc.dialog.tips("File head error: " + self.config.validHeads.join(','));
                            return;
                        }
                    });
                }
                var keysLen = keys.length;
                var thead = $('<thead></thead>');
                var tbody = $('<tbody></tbody>');
                var theadTr = $('<tr><th>NO.</th></tr>').appendTo(thead);
                for(var i = 0; i < keysLen; i++){
                    theadTr.append('<th>' + keys[i] + '</th>');
                }

                for(var i = 1; i < self._dataList.length; i++){
                    var item = self._dataList[i];
                    var tr = $('<tr><td>' + i + '</td></tr>');
                    for(var j = 0; j < keysLen; j++){
                        var text = item[j];
                        if(self.config.canEdit) {
                            text = '<span class="tdSpan">' + text + '</span><input class="tdIpt" type="text" value="' + text + '" />'
                        }
                        tr.append('<td data-val="true", data-index="' + i + ',' + j + '">' + text + '</td>');
                    }
                    tbody.append(tr);
                }
                ret.append(thead);
                ret.append(tbody);
            }
            var uploadList = self.ele.find('.zUploaderList');
            uploadList.find('.zFileTable').remove();
            tableContainer.appendTo(uploadList);
            
            self.config.afterLoad && self.config.afterLoad();
        })
    }
    
    /**
    * 将Table设置为编辑状态
    * @method setEditTable 
    * @param {object} table - Jquery对象
    * @memberof FileView
    * @instance
    * @example
    * fileView.config.canEdit = true;
    * fileView.setEditTable(fileView.ele.find('table'))
    */
    self.setEditTable = function(table){
        if(self.config.canEdit === true){
            table.find('tbody td[data-val]').each(function(){
                var td = $(this);
                var text = td.html();
                td.html('<span class="tdSpan">' + text + '</span><input class="tdIpt" type="text" value="' + text + '" />');
            });           
        }
    }

    /**
    * 获取格式化后的数据
    * @method getDataList 
    * @return {object} models - 对象数组
    * @memberof FileView
    * @instance
    * @example
    * var dataList = fileView.getDataList()
    */
    self.getDataList = function(){
        var models = [];
        if (!self._dataList || self._dataList.length === 0){
            return null;
        }

        var keys = self._dataList[0];
        if(self.config.heads && self.config.heads.length > 0){
            if(self.config.heads.length > keys.length){
                self.config.heads = self.config.heads.slice(0, keys.length);
            }
            keys = keys.slice(self.config.heads.length);
            keys = self.config.heads.concat(keys);
        }
        var keyLength = keys.length;
        for (var i = 1; i < self._dataList.length; i++){
            var line = self._dataList[i];
            var one = {};
            for (var j = 0; j < keyLength; j++){
                one[keys[j]] = $.trim(line[j]);
            }
            models.push(one);
        }

        return models;
    }

    /**
    * 标记表格中某些格
    * @method mark 
    * @param {object} msgList - 对象数组：{row: 1, col: 1} 
    * @memberof FileView
    * @instance
    * @example
    //标记坐标为（0，0），（3，2）的格子
    *fileView.mark([{row:0, col:0}, {row:3, col:2}]);
    */
    self.mark = function(msgList){
        var length = msgList.length;
        for(var i = 0; i < length; i++){
            var msgItem = msgList[i];
            var dataIndex = msgItem.row + ',' + msgItem.col;
            var td = self.ele.find('tbody td[data-index="' + dataIndex + '"]');
            td.addClass('zFileTableMark').attr('title', msgItem.msg);
        }
    }

    /**
    * 清除表格中某些格
    * @method clearMark 
    * @memberof FileView
    * @instance
    * @example
    * fileView.clearMark();
    */
    self.clearMark = function(){
        self.ele.find('tbody .zFileTableMark').removeAttr('title').removeClass('zFileTableMark');
    }

    self._render();
    self._bindEvent();
}


module.exports = FileView;


},{"./asset/csv":3,"./dialog.js":7,"./ui.js":27}],10:[function(require,module,exports){
/** 
* @file 前端图片裁剪预览
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* 前端图片裁剪预览
* @class ImageCrop
* @constructor
* @param {object} options 配置变量对象：<br /> container为容器对象
* @example
* var imageCrop = new ImageCrop({
    container: '#container'
})
*/
var ImageCrop = function(options){
	/** @memberof ImageCrop */

    /** @property {object} options 配置变量对象：<br /> container为容器对象, remoteImg: 初始化时，加载远程图片 */
    this.config = {
		container: 'body',
        remoteImg: 0
	};

    /** @property {object} ele - 最外层Jquery对象 */
	this.ele = null;  

    /** @property {object} canvas - canvas元素 */
	this.canvas = null;

    /** @property {object} ctx - canvas.getContext()的返回值 */
	this.ctx = null;   

    /** @property {object} img - 当前的图片 */
	this.img = null;   

    /** @property {object} filter - Jquery对象，裁剪框 */
	this.filter = null;   

    /** @property {number} scaleHeight - 未放大或者缩小的初始高度 */
	this.scaleHeight = 0; 

    /** @property {number} scaleWidth - 未放大或者缩小的初始宽度 */
	this.scaleWidth = 0; 


	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

    var self = this;

    /** @method _render 初始化界面
    *@memberof ImageCrop 
    *@instance
    */
	self.render = function(){
		self.ele = $('<div class="zImageCrop"></div>');
		var wrap = $('<div class="zImageCropWrap"></div>').appendTo(self.ele);
		wrap.append('<canvas class="zImageCropCanvas"></canvas>');
        wrap.append('<span class="zImageCropCover zImageCropCoverTop"></span>');
        wrap.append('<span class="zImageCropCover zImageCropCoverRight"></span>');
        wrap.append('<span class="zImageCropCover zImageCropCoverLeft"></span>');
        wrap.append('<span class="zImageCropCover zImageCropCoverBottom"></span>');
		wrap.append('<span class="zImageCropFilter"><i class="zCutDown"></i><i class="zCutLeft"></i><i class="zCutRight"></i><i class="zCutUp"></i></span>');
		self.ele.append('<div class="zImageCropControl"><span class="iptFile"><input type="file" accept="image/*">Open</span><span class="zCutRange"><b>－</b><input type="range" min="50" max="500" step="1"><b>＋</b><span class="zRangePercent">0%</span></span><span class="zCutImageSize">0 × 0</span><button class="btnCut">Cut</button></div>');
        self.ele.append('<h3 class="zImageCropDropInfo mt50">Drop image here</h3>');
		self.canvas = self.ele.find('canvas')[0];
		self.ctx = self.canvas.getContext('2d');
		self.img = new Image();
		self.filter = self.ele.find('.zImageCropFilter');

		self.ele.appendTo(self.config.container);

        if(self.config.remoteImg){
            self.readFile(self.config.remoteImg);
        }

		self.bindEvents();
	}

    /** 
    * 支持拖拽更换图片
    * @method supportDrop 
    * @memberof ImageCrop 
    * @instance
    */
    self.supportDrop = function(){
        self.ele.on('dragover', function(e){
            e.stopPropagation();    
            e.preventDefault();
        })
        .on('dragenter', function(e){
            e.stopPropagation();    
            e.preventDefault();
            self.ele.addClass('zImageCropDrag');
        })
        .on('dragleave', function(e){
            e.stopPropagation();    
            e.preventDefault();
            self.ele.removeClass('zImageCropDrag');
        })

        self.ele.on('drop', function(e){
            e.stopPropagation();    
            e.preventDefault();
            self.ele.removeClass('zImageCropDrag');
            var file = e.originalEvent.dataTransfer.files;
            self.readFile(file[0]);
        })
    }

    /** 
    * 图片加载完成后显示该图片
    * @method imgLoaded 
    * @memberof ImageCrop 
    * @instance
    */
    self.imgLoaded = function(){
        self.ele.find('.zImageCropDropInfo').hide();
        self.ele.find('.zImageCropFilter').css('display', 'block');
        self.drawImage();
        self.scaleWidth = self.img.width;
        self.scaleHeight = self.img.height;

        self.ele.find('.zCutImageSize').html(self.img.width + ' × ' + self.img.height);
        self.ele.find('.zCutRange input').val(100);
        self.ele.find('.zRangePercent').html('100%');
    }
    /** 
    * 通过FileReader读取文件内容
    * @method readFile 
    * @param {object} file - 需要读取的文件对象
    * @memberof ImageCrop 
    * @instance
    */
    self.readFile = function(file){
        var reader = new FileReader();


        reader.onload = function(e){
            self.img.src = this.result;
            self.imgLoaded();
        }

        if(typeof file === 'object'){
            if(!/image\/.*/.test(file.type)){
                if(window.oc){
                    oc.dialog.tips('Only image file is accept');
                }
                else{
                    alert('Only image file is accept');
                }
                return;
            }

            reader.readAsDataURL(file);
        }
        else{  //远程图片
            // self.img = new Image();
            self.img.src = file;
            self.img.onload = self.imgLoaded;
        }
        
    }

    /**
    * 事件绑定相关
    * @method bindEvents 
    * @memberof ImageCrop 
    * @instance
    */
	self.bindEvents = function(){
		self.downWidth = self.filter.width();
        self.downHeight = self.filter.height();
        self.downLeft = self.filter.position().left;
        self.downTop = self.filter.position().top;
        self.downPosition = {};
        
        var reader = new FileReader();
        
        self.supportDrop();
		self.ele.on('change', 'input[type="file"]', function(){
            self.readFile(this.files[0]);
        })
        .on('input', '.zImageCropControl input[type="range"]', function(){
            self.ele.find('.zImageCropControl .zRangePercent').html(this.value + '%');
            self.range();
        })
        .on('click', '.zImageCropControl b', function(){
            var range = parseInt(self.ele.find('.zImageCropControl .zRangePercent').html());
            if(this.innerHTML === '－'){
                range -= 10;
                (range < 50) && (range = 50);
            }
            else{
                range += 10;
                (range > 500) && (range = 500);
            }
            self.ele.find('.zImageCropControl .zRangePercent').html(range + '%');
            self.ele.find('.zImageCropControl input[type="range"]').val(range);
            self.range();
        })
        .on('click', '.btnCut', self.cutImage)
		.on('mousedown', '.zImageCropFilter', function(e){
			if(e.which === 1){
                self.downPosition = e.originalEvent;
                downLeft = self.filter.position().left;
                downTop = self.filter.position().top;
       
                $(document).off('mousemove');
                $(document).on('mousemove', function(e){
                	self.moveFilter(e);
                });
            }
            else{
            	console.log('off move');
                $(document).off('mousemove');
            }
		})
		.on('mousedown', '.zImageCropFilter i', function(e){
			e.stopPropagation();
            self.downWidth = self.filter.width();
            self.downHeight = self.filter.height();
            self.downLeft = self.filter.position().left;
            self.downTop = self.filter.position().top;

            var ele = $(this);
            if(e.which === 1){
                self.downPosition = e.originalEvent;
                $(document).off('mousemove');
                $(document).on('mousemove', function(e){
                    self.moveFilterIcon(e, ele);
                });
            }
            else{
            	console.log('off move');
                $(document).off('mousemove');
            }
		})

		$(document).on('mouseup', function(){
            $(document).off('mousemove');
        })
	}

    /** 使用Canvas绘制图片
    * @method drawImage 
    * @memberof ImageCrop 
    * @instance
    */
	self.drawImage = function(){
        if(!self.img.src){
            return;
        }
        self.canvas.width = self.img.width;
        self.canvas.height = self.img.height;
        $(self.canvas).parent().css({
            'margin-left': self.canvas.width / -2.0,
            'margin-top': self.canvas.height / -2.0,
        });
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        self.ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height);

        self.resetCover();
    }

    /** 放大或者缩小图片
    * @method range 
    * @memberof ImageCrop 
    * @instance
    */
    self.range = function(){
        var rangeVal = self.ele.find('.zImageCropControl input[type="range"]').val();
        self.canvas.width = self.scaleWidth * rangeVal / 100.0;
        self.canvas.height = self.scaleHeight * rangeVal / 100.0;

        $(self.canvas).parent().css({
            'margin-left': self.canvas.width / -2.0,
            'margin-top': self.canvas.height / -2.0,
        });
        self.ctx.drawImage(self.img, 0, 0, self.canvas.width, self.canvas.height);
        self.resetFilter();
        self.resetCover();
    }

    /** 根据选择框进行图片裁剪
    * @method cutImage 
    * @memberof ImageCrop 
    * @instance
    */
    self.cutImage = function(){
        if(!self.img.src){
            return;
        }

        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
        var currRange = self.ele.find('.zImageCropControl input[type="range"]').val() / 100;
        var width = self.filter.width();
        var height = self.filter.height();
        self.canvas.width = width;
        self.canvas.height = height;

        $(self.canvas).parent().css({
            'margin-left': self.canvas.width / -2.0,
            'margin-top': self.canvas.height / -2.0,
        });

        self.ctx.drawImage(self.img, self.filter.position().left / currRange, self.filter.position().top / currRange, 
           width / currRange, height / currRange, 0, 0, width, height);

        self.resetFilter();
        self.resetCover();
        
        self.ele.find('.zImageCropCover').css({
            width: 0,
            height: 0
        })
        self.ele.find('.zImageCropControl input[type="range"]').val(100);
        self.ele.find('.zImageCropControl .zRangePercent').html('100%');
        self.ele.find('.zImageCropControl .zCutImageSize').html(width + ' × ' + height);
        self.scaleWidth = width / currRange;
        self.scaleHeight = height / currRange;
        self.img.src = self.canvas.toDataURL("image/png"); 
    }

    /** 移动选择框时的处理函数
    * @method moveFilter 
    * @memberof ImageCrop 
    * @instance
    */
    self.moveFilter = function(e){
    	var currentPosition = e.originalEvent;
   		
        var left = downLeft + currentPosition.clientX - self.downPosition.clientX;
        var top = downTop + currentPosition.clientY - self.downPosition.clientY;
        if(left < 0){
            left = 0;
        }
        if(top < 0){
            top = 0;
        }
        self.resetFilter();

        self.resetCover();
    }

    /** 
    * 裁剪图片后，重置选择框的位置到初始状态
    * @method resetFilter 
    * @memberof ImageCrop 
    * @instance
    */
    self.resetFilter = function(){
        var parent = $(self.canvas).parent();
        var left = parseInt(parent.css('margin-left')) + self.ele.width() / 2;
        var right = self.ele.width() - self.canvas.width - left;
        var top = parseInt(parent.css('margin-top')) + self.ele.height() / 2;
        var bottom = self.ele.height() - self.canvas.height - top;

        left < 0? (left *= -1) : (left = 0);
        right < 0? (right *= -1) : (right = 0);
        bottom < 0? (bottom *= -1) : (bottom = 0);
        top < 0? (top *= -1) : (top = 0);

        self.filter.css({
            width: 'auto',
            height: 'auto',
            left: left,
            right: right,
            top: top,
            bottom: bottom
        })
    }

    /**
    * 裁剪图片后，重置遮罩框的位置到初始状态
    * @method resetCover 
    * @memberof ImageCrop 
    * @instance
    */
    self.resetCover = function(){
        var position = self.filter.position();

        self.ele.find('.zImageCropCoverTop').css({
            height: position.top,
            width: '100%',
            left: 0,
            top: 0
        });
        self.ele.find('.zImageCropCoverBottom').css({
            height: self.canvas.height - position.top - self.filter.height() - 2,
            width: '100%',
            bottom: '2px',
            left: 0
        });
        self.ele.find('.zImageCropCoverRight').css({
            width: self.canvas.width - self.filter.width() - position.left,
            height: self.filter.height() + 2,
            top: position.top,
            right: 0
        });
        self.ele.find('.zImageCropCoverLeft').css({
            width: position.left,
            height: self.filter.height() + 2,
            top: position.top,
            left: 0
        });
    }

    /** 
    * 拖动改变裁剪框大小
    * @method moveFilterIcon 
    * @memberof ImageCrop 
    * @instance
    */
    self.moveFilterIcon = function(e, i){
    	
    	e.stopPropagation();

        var currentPosition = e.originalEvent;
        var ele = $(i);
        var parent = ele.parent();
        // console.log(currentPosition.clientX - self.downPosition.clientX);
        var addWidth = currentPosition.clientX - self.downPosition.clientX;
        var addHeight = currentPosition.clientY - self.downPosition.clientY;

        var width = self.downWidth + addWidth;
        var height = self.downHeight + addHeight;

        var canvasParent = $(self.canvas).parent();
        var left = parseInt(canvasParent.css('margin-left')) + self.ele.width() / 2;
        var right = self.ele.width() - self.canvas.width - left;
        var top = parseInt(canvasParent.css('margin-top')) + self.ele.height() / 2;
        var bottom = self.ele.height() - self.canvas.height - top;

        if(i.hasClass('zCutRight')){
            var max = self.canvas.width + right - self.downLeft;
            if(right < 0 && max < width){
                width = max;
            }
            else if(right > 0){
                max = self.canvas.width - self.downLeft;
                if(max < width){
                    width = max;
                }
            }
            
            parent.css({
                width: width
            })
        }
        else if(i.hasClass('zCutDown')){
            var max = self.canvas.height + bottom - self.downTop;
            if(bottom < 0 && max < height){
                height = max;
            }
            else if(bottom > 0){
                max = self.canvas.height - self.downTop;
                if(max < height){
                    height = max;
                }
            }
            
            parent.css({
                height: height
            })
        }
        else if(i.hasClass('zCutLeft')){
            if(left < 0 && self.downLeft + left <= -1 * addWidth){
                addWidth = (self.downLeft + left) * -1;
            }
            else if(left > 0 && self.downLeft <= -1 * addWidth){
                addWidth = -1 * self.downLeft;
            }
            parent.css({
                left: self.downLeft + addWidth,
                width: self.downWidth - addWidth + 2
            })
        }
        else if(i.hasClass('zCutUp')){
            if(top < 0 && self.downTop + top <= -1 * addHeight){
                addHeight = (self.downTop + top) * -1;
            }
            else if(top > 0 && self.downTop <= -1 * addHeight){
                addHeight = -1 * self.downTop;
            }
            parent.css({
                top: self.downTop + addHeight,
                height: self.downHeight - addHeight + 2
            })
        }
        

        self.resetCover();
    }


    self.render();
}

module.exports = ImageCrop;
},{}],11:[function(require,module,exports){
(function(){
	// window.$ = require('../jquery-2.1.3.min.js');
	window.oc = {};
	
	oc.ui = require('./ui');
	oc.algorithm = require('./algorithm');
	oc.dialog = require('./dialog');
	oc.localStorage = require('./localStorage');
	oc.FileView = require('./fileView');
	oc.Uploader = require('./uploader');
	oc.select = require('./select');
	oc.TreeSelect = require('./treeSelect');
	oc.BUSelect = require('./buSelect');
	oc.TreeDialogSelect = require('./treeDialogSelect');
	oc.Tree = require('./tree');
	oc.ImageCrop = require('./imageCrop');
	oc.Sidebar = require('./sidebar');
	oc.TreeOrganization = require('./treeOrganization');
	oc.TreePIS = require('./treePIS');
	oc.ajax = require('./ajax');
	oc.date = require('./date');
	oc.Table = require('./table');
	oc.location = require('./location');
	oc.tools = {
		dojo: require('./toolsDojo'),
		csv: require('./csvExport'),
		table: require('./toolsTable'),
		number: require('./toolsNumber'),
		form: require('./toolsForm')
	}
	var cssPath = $('script[data-occss]').attr('data-occss');
	if(cssPath) {
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
		cssPath = cssPath.replace('oc.css', 'icons/style.css');
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
	}
	else {
		if(location.href.indexOf('ocdebug') > -1) {
			// $("<script>").attr({type: "text/javascript", src: 'http://172.16.1.233:3009/dest/oc.js'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://localhost:3009/dest/oc.css'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://localhost:3009/icons/style.css'}).appendTo("head");
		}
		else {
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://static.oceanwing.com/webapp/js/oc/oc.css'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://static.oceanwing.com/webapp/js/oc/icons/style.css'}).appendTo("head");
		}
	}

	window.z && (window.z = oc.dialog);
	$(function() {
		window.z && (window.z = oc.dialog);
	})
	setTimeout(function() {
		window.z && (window.z = oc.dialog);
	}, 1000)
})()
},{"./ajax":1,"./algorithm":2,"./buSelect":4,"./csvExport":5,"./date":6,"./dialog":7,"./fileView":9,"./imageCrop":10,"./localStorage":12,"./location":13,"./select":15,"./sidebar":16,"./table":17,"./toolsDojo":18,"./toolsForm":19,"./toolsNumber":20,"./toolsTable":21,"./tree":22,"./treeDialogSelect":23,"./treeOrganization":24,"./treePIS":25,"./treeSelect":26,"./ui":27,"./uploader":28}],12:[function(require,module,exports){
/**
* @file 用于操作浏览器的本地存储 - LocalStorage
* @author Elvis Xiao
* @version 0.1 
*/

/**
* 用于操作浏览器的本地存储 - LocalStorage
* @exports oc.localStorage

* @example

//设置一个键值对到本地存储中
* oc.localStorage.set('user', {name: 'elvis xiao', email: 'ivesxiao@gmail.com'});

//根据主键获取存储的值
* oc.localStorage.get('user');

//删除指定key
* oc.localStorage.remove('user');

//清除所有该域下本地存储
* oc.localStorage.clear();
*/
var LocalStorage = {
	/** @property {object} storage - 浏览器本身的localStorage对象 */
	storage : window.localStorage
}

/**
* 存储一个键值对到本地存储中
* @param {string} key - 存储的key值
* @param {object} value - 存储的对象，内部会转化为JSON字符串存储
*/
LocalStorage.set = function(key, value){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return;
	}

	var strVal = JSON.stringify(value);
	this.storage[key] = strVal;
}

/**
根据key从已经存储的数据中取出对应的值
* @param {string} key - 存储的key值
* @return {object} value - 根据key值获取到的对象，如果没有则为null
*/
LocalStorage.get = function(key){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return null;
	} 

	var strVal = this.storage[key] || null;
	var jsonVal = JSON.parse(strVal);

	return jsonVal;
}

/**
* 根据key移除已经存储的对应值
* @param {string} key - 有则移除，无则不做任何操作
*/
LocalStorage.remove = function(key){
	this.storage.removeItem(key);
}

/**
* 清除当前域名下所有的本地存储信息
*/
LocalStorage.clear = function(){
	this.storage.clear();
}

module.exports = LocalStorage;


},{}],13:[function(require,module,exports){

var Instance = {}

Instance._generateString = function(params) {
	if(typeof params === 'string') {
		return params;
	}
	else if(typeof params === 'object') {
		var arr = [];
	    for(var key in params) {
	    	arr.push(key + '=' + params[key]);
	    }

	    return arr.join('&');
	}

	return null;
}

Instance.getString = function(params) {
	return this._generateString(params);
}

Instance.getParams = function(frame) {
	if(!frame) {
		frame = window;
	}
	
	var params = {};

	var searchString;
	searchString = frame.location.search;
    if(searchString && searchString.indexOf('=') > -1) { //将hash的参数转为paras对象，传入widget
    	searchString = searchString.slice(1);
    	var paraStrings = searchString.split('&');
    	paraStrings.map(function(one) {
    		var keyValue = one.split('=');
    		var key = keyValue[0];
    		var val = decodeURI(keyValue[1]);
    		if(val.indexOf(',') > -1) {
    			val = val.split(',');
    		}
    		if(params[key]) {
    			if(typeof params[key] !== 'object') {
    				params[key] = [params[key]];
    			}
    			params[key].push(val);
    		}
    		else {
    			params[key] = val;
    		}
    	})
    }
    
	return params;
}

Instance.setHash = function(hash, params, needReload) {
    var searchStr = Instance._generateString(params);
    var url = hash + (searchStr? '?' + searchStr : '');
    var state = {
	 	url : url
	};

	top.history.pushState(state, "", url);

	if(typeof hash === "boolean" || typeof params === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}

Instance.setSearch = function(params, needReload) {
	var searchStr = Instance._generateString(params);

	if(searchStr) {
		var url = '?' + searchStr;
		var state = {
		 	url : url
		};

		top.history.pushState(state, "", url);
	}

	if(typeof params === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}

Instance.setUrl = function(pathname, search, hash, needReload) {
	var url = pathname;
	var searchStr = Instance._generateString(search);
	if(searchStr) {
		url += '?' + searchStr;
	}
	if(hash) {
		url += hash;
	}
	
	var state = {
	 	url : url
	};

	top.history.pushState(state, "", url);

	if(typeof pathname === "boolean" || typeof search === "boolean" || typeof hash === "boolean" || needReload === true) {
		window.app && window.app.loadPage();
	}
}

module.exports = Instance;


},{}],14:[function(require,module,exports){
var Security = {};

Security.removeXss = function(model){
	for(var key in model){
		var val = model[key];
		if(!val){
			continue;
		}
		if(typeof val === 'string'){
			model[key] = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
		else if(typeof val === 'object' && val.length){
			for(var i = 0; i < val.length; i++){
				var one = val[i];
				Security.removeXss(one);
			}
		}
		else if(typeof val === 'object'){
			Security.removeXss(val);
		}
	}

	return model;
}

module.exports = Security;
},{}],15:[function(require,module,exports){
var dropdown = require('./dropdown');

var instance = function(ele, showFilter){
    initSelect(ele, showFilter);
}


var getSelectedText = function(slc) {
    var ret = [];
    slc.find('option').each(function() {
        if(this.selected) {
            ret.push($(this).text());
        }
    })

    return ret;
}

var initSelect = function(ele, showFilter){
    if(!ele){
        ele = $('.zSlc');
    }
    if(showFilter === undefined) {
        showFilter = true;
    }

    ele.each(function(){
        var slc = $(this);
        divSlc = slc.next('.zSlcWrap');
        var ipt = divSlc.find('input');
        if(divSlc.length === 0){
            divSlc = $('<div class="zSlcWrap"></div>');
            ipt = $('<input class="zIpt" type="text" readonly/>').appendTo(divSlc).data('showFilter', showFilter);
            var position = slc.position();
            divSlc.css({
                position: 'relative',
                display: slc.css('display'),
                width: slc.outerWidth(),
                height: slc.outerHeight()
            })
            slc.after(divSlc);
        }
        
        var initVal = getSelectedText(slc).join(', ');
        ipt.val(initVal || "");
        slc.hide();
    });
}

var initEvent = function(){
    $(function(){
        initSelect();
        
        $('body')
        .on('click', function(){
            dropdown.remove($('.zSlcBd').parents('.zDropdown'));
        })
        .off('click', '.zSlcWrap>input.zIpt')
        .on('click', '.zSlcWrap>input.zIpt', function(e){
        	e.stopPropagation();
            var ele = $(this);
            if(ele.data('zTarget') && ele.data('zTarget').length > 0){
                dropdown.remove();
            	return;
            }

            dropdown.remove();

            var slcWrap = ele.parent();
            var slc = slcWrap.prev('.zSlc');
            var content = $('<div class="zSlcBd"></div>');

            if(ele.data('showFilter')){
                content.append('<div class="zFilter"><input type="text" class="zIpt w" /></div>').addClass('zSlcHasFilter');
            }

            slc.find('option, optgroup').each(function(){
            	var item = $(this);
                var p = $('<p data-val="' + item.attr('value') + '" class="' + item.attr('class') + '" style="' + item.attr('style') + '">' + item.html() + '</p>').appendTo(content);
                if(this.nodeName === "OPTGROUP"){
                    p.removeAttr('data-val').attr('disabled', 'disabled').attr('slcGroup', 'true').html(item.attr('label'));
                }
            	else{
                    if(item.attr('disabled')){
                        p.attr('disabled', item.attr('disabled'));
                    }
                    if(item[0].selected){
                        p.attr('selected', item[0].selected? 'selected' : '');
                    }
                }
            });

            dropdown.show(ele, '', content[0].outerHTML);

            var eleDropdown = ele.data('zTarget');
            eleDropdown.focus();
            eleDropdown.on('keydown', function(e) {
                if(e.keyCode == 65 && (e.ctrlKey || e.metaKey)) {
                    eleDropdown.find('.zSlcBd>p').trigger('click');
                    return false;
                }
            })
        })
        .off('click', '.zSlcBd')
        .on('click', '.zSlcBd', function(e){
            e.stopPropagation();
        })  
        .off('input', '.zSlcBd>.zFilter>.zIpt')
        .on('input', '.zSlcBd>.zFilter>.zIpt', function(){
            var val = this.value.toUpperCase();
            slcBd = $(this).parents('.zSlcBd');
            var ps = slcBd.find('>p').hide();
            for(var i = 0; i < ps.length; i++){
                var oneP = $(ps[i]);
                if(oneP.attr('disabled') || oneP.html().toUpperCase().indexOf(val) !== -1){
                    oneP.show();
                }
            }
        })
        .off('click', '.zSlcBd>p')    
        .on('click', '.zSlcBd>p', function(e){
        	e.stopPropagation();
        	var p = $(this);
        	if(p.attr('disabled')){
        		return;
        	}

        	var ipt = $(this).parents('.zDropdown').data('zTarget');
        	var slc = ipt.parent().prev('.zSlc');
        	
        	var slcVal = p.attr('data-val');
        	var slcOption = slc.find('option[value="' + slcVal + '"]');
        	if(!slcVal || !slcOption.length){
        		slcVal = p.text();
        		slcOption = slc.find('option:contains("' + slcVal + '")').filter(function(){
        			return this.innerText == slcVal;
        		});
        	}
        	
        	if(!slc.attr('multiple')){
                ipt.val(slcOption.text());
                slc.find('option').attr('selected', false);
                slcOption.prop('selected', true);
				dropdown.remove(ipt);
                ipt.change();
        	}
        	else{
        		if(p.attr('selected')){
        			p.removeAttr('selected');
        			slcOption[0].selected = false;
                    slcOption.prop('selected', false);
        		}
        		else{
        			p.attr('selected', 'selected');
                    slcOption[0].selected = true;
        			slcOption.prop('selected', true);
        		}
                var vals = getSelectedText(slc).join(', ');
                ipt.val(vals || '');
                ipt.change();
                slc.change();
        	}
        })
    })  
}

initEvent();

module.exports = instance;

},{"./dropdown":8}],16:[function(require,module,exports){
/** 
* @file 侧边栏
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* 侧边栏
* @class Sidebar
* @constructor
* @param {object} dataList - 配置数据文件
* @param {object} container - 容器Jquery选择器或Jquery对象

* @example
* var dataList = [
    {
        name: 'test1',
        hash: '#test1',
        children: [
            {
                name: 'test2',
                hash: '#test2',
            },
            {
                name: 'test2',
                hash: '#test2',
            },
            {
                name: 'test2',
                hash: '#test2',
            }
        ]
    },
    {
        name: 'test222',
        hash: '#test222',
        children: [
            {
                name: 'test2',
                hash: '#test2',
            },
            {
                name: 'test2',
                hash: '#test2',
            },
            {
                name: 'test2',
                hash: '#test2',
            }
        ]
    }
];

new oc.Sidebar(dataList, '#sideBarContainer');
*/

var Sidebar = function(dataList, container){
	this.container = container;
	this.dataList = dataList;
	
	var self = this;
	
	/**
    * 生成Siderbar结构
    * @method _render 
    * @memberof Sidebar
    * @instance
    */
	self._render = function(){
		var aside = $('<aside class="zSideBar"><ul class="zSideBarUl"></ul></aside>');
		var ul = aside.find('ul');
		self.dataList.map(function(model){
			var li = $('<li><a>' + model.name + '</a></li>');
			li.appendTo(ul);

			if(model.hash){
				li.find('>a').attr('href', model.hash);
			}
			if(model.children){
				li.addClass('hasMore').append('<ul></ul>');
				var subUl = li.find('ul');
				model.children.map(function(childItem){
					var subLi = $('<li><a>' + childItem.name + '</a></li>');
					subLi.appendTo(subUl);
					
					if(childItem.hash){
						subLi.find('>a').attr('href', childItem.hash);
					}
				})
			}
		})
		
		aside.appendTo($(container));
	}

	self._render();
}

module.exports = Sidebar;
},{}],17:[function(require,module,exports){
var toolsDojo = require('./toolsDojo');

/**
 * @param  {string} param -- url or array list 
 * @return {object}
 */
var Table = function() {
	this.pageNo = 1;    // 当前的页码数，默认为1
	this.pageSize = 10; //单页显示行数，默认值为10
    this.sortKey;
    this.sortUp;
    
    this.showPager = true; //是否显示分页信息
    this.hasNext; //是否有下一页---

	this.showSearchBox = false; // 是否显示搜索框 
    this.exportFile = '';
	this.showBtnExport = false; //是否显示导出按钮
    this.showCheckbox = false;

    this.total = null; // 用于服务器端数据获取------
    this.originDataList = null;
	this.dataList = null;  //原始数据保存区
    this.filterDataList = null;      //根据条件查询出来的所有数据保存区, 暂时不用
    this.pageData;        //当前页的数据
    this.tdDataList = null;
    this.filterTdDataList = null;
    
    this.ajaxCallback; //服务器端加载数据的回调函数
    this.afterLoad;   //数据重新加载后调用，一般在翻页，搜索后

    this.table = $('<table class="table ocTable"></table>');
	//表头的配置对象
	this.headMapping = {
		id: {text: 'ID', width: 50, sort: true, },
        name: {text: '姓名', width: 100, sort: true, export: false},
        department: '部门',
        sex: '性别',
        param1: {text: '参数1', width: 100},
	};

	var self = this;

    self.load = function(dataList, ajaxTotal) {
        self.table.removeClass('zLoadingCover');
        if(typeof ajaxTotal === 'number') {
            self.total = ajaxTotal;
        }
        if(typeof ajaxTotal === 'boolean') {
            self.hasNext = ajaxTotal;
        }
        self.originDataList = $.extend(true, [], dataList);

        self.filterDataList = self.dataList = $.extend(true, [], dataList);

        var body = self._renderBody();
        
        self.table.find('tbody').replaceWith(body);
        if(self.showPager) {
            var foot = self._renderFoot();
            self.table.find('tfoot').replaceWith(foot);
        }
        else {
            self.table.find('tfoot').remove();
        }

        // self._buildTdData();
        self.filterDataList = self.dataList;
        
        self.afterLoad && self.afterLoad();
    }

    self.loading = function() {
        self.dataList = self.filterDataList = null;
        self.table.find('tbody').html('<tr><td colspan="100"><i class="zLoadingIcon"></i> Loading ...</td></tr>');
    }

	//build Table的Caption部分
	self._renderCaption = function() {
		var caption = $('<caption></caption>');
        
        if(this.showBtnExport) {
            caption.append('<button type="text" class="btnExport btn btn-gray btn-sm fr" style="margin-bottom: 5px;">Export</button>');
        }
        if(this.showSearchBox) {
            caption.append('<label class="form-inline w200"><input type="text" class="searchBox form-control input-sm" placeholder="Search here ..." /></label>');
        }

        return caption;
	}
    
	//build Table的头部 -----
	self._renderHead = function() {
		var thead = $('<thead><tr></tr></thead>');
		var tr = thead.find('tr');
        if(self.showCheckbox) {
            tr.append('<th style="width: 40px"><input class="cbxOcTable" type="checkbox" /></th>');
        }
		for(var key in self.headMapping) {
			var params = self.headMapping[key];
			var text = params.text;
            if(text === undefined) {
                text = key;
            }

            var th = $('<th>' + text + '</th>');

            if(params.sort) {
            	th.attr('data-sort', key);
            }
            if(params.export === false) {
            	th.attr('data-export', false);
            }
            if(params.width) {
            	th.css('width', params.width + 'px');
            }

            tr.append(th);
		}

        return thead;
	}

    self._getDefault = function(val) {
        if(val === undefined || val === null) {
            return '';
        }
        return val;
    }
    
    self._getVal = function(model, key) {
        var arr = key.split('.');
        var tdVal = model[key];
        if(arr.length > 1) {
            tdVal = model;
            for(var i = 0; i < arr.length; i++) {
                tdVal = tdVal[arr[i]];
                if(!tdVal) {
                    break;
                }
            }
        }
        
        return tdVal;
    }

	//build每一行的数据, 请根据实际情况复写----
	self.renderTr = function(model) {
		var tr = $('<tr></tr>');
        for(var key in self.headMapping) { 
            var arr = key.split('.');   //支持嵌套Model的render-----
            var tdVal = self._getVal(model, key);
            
            tr.append('<td>' + self._getDefault(tdVal) + '</td>');
        }

        return tr;
	}
    
    self.filter = function(fn) {
        if(!fn || typeof fn !== 'function') {
            return;
        }

        self.filterDataList = self.dataList.filter(function(model) {
            return fn(model);
        })

        self.pageNo = 1;

        self._reloadBody();
        self._reloadFoot();
    }

    //filterData改变的情况下，需要更新td数据, 暂时不用
    self._buildTdData = function() {
        //让ui先更新，后处理数据----
        self.dataList = self.dataList.map(function(model) {
            self._setTrModel(model);
            return model;
        })
    }

    self._setTrModel = function(model) {
        var trModel = {};
        var tr = self.renderTr(model);
        var tds = tr.find('>td');
        var i = 0;
        for(var key in self.headMapping) {
            // var val = self._getVal(model, key);
            var val = $(tds[i]).text();
            // trModel[key] = val;

            if(/^[1-9][0-9]*(\.)?[0-9]*$/.test(val)) {
                val = parseFloat(val);
            }
            trModel[key] = val;

            i++;
        }

        model.trModel = trModel;
    }

    self._getValByMappingKey = function(model, key) {
        var tdVal = self._getVal(model, key);
        var text = self._getDefault(tdVal);
        return text;
    }

    self._getPageData = function() {
        if(self.total || typeof self.hasNext === 'boolean') {
            return self.dataList;
        }

        var start = self.pageSize * (self.pageNo - 1);
        var dataList = self.filterDataList;
        if(self.showPager) {
            var len = self.pageSize > dataList? dataList.length: self.pageSize;
            self.pageData = self.filterDataList.slice(start, len + start);
        }
        else {
            self.pageData = self.filterDataList;
        }
        
        return self.pageData;
    }

    self._renderBody = function() {
        var tbody = $('<tbody></tbody>');

        if(!self.filterDataList) {
            tbody.append('<tr><td colspan="100"><i class="zLoadingIcon"></i> Loading ...</td></tr>');
            return tbody;
        }

        if(self.filterDataList.length) {
            self.pageData = self._getPageData();
            for(var i = 0; i < self.pageData.length; i ++) {
                var model = self.pageData[i];
                var tr = self.renderTr(model);
                if(self.showCheckbox) {
                    tr.prepend('<td><input type="checkbox" class="cbxOcTable"></td>');
                }
                tbody.append(tr);
            }
        }
        else {
            self.pageData = [];
            tbody.append('<tr class="trEmpty"><td colspan="100">No data</td></tr>');
        }

        return tbody;
    }

    self._renderFoot = function() {
        if(self.pageNo) {
            self.pageNo = parseInt(self.pageNo);
        }
        else {
            self.pageNo = 1;
        }
        if(self.pageSize) {
            self.pageSize = parseInt(self.pageSize);
        }
        var tfoot = $('<tfoot><tr><td colspan="100"><form><nav><ul class="pagination"></ul></nav></form></td></tr></tfoot>');
        var nav = tfoot.find('nav');
        var ul = tfoot.find('ul');
        
        if(!self.dataList || self.dataList.length == 0) {
            return tfoot;
        }

        if(self.hasNext !== undefined) { //只显示上一页，下一页的分页信息
            var prevLi = $('<li><a href="#" title="Previous" data-page="' + (self.pageNo - 1) + '">Prev</a></li>').appendTo(ul);
            var nextLi = $('<li><a href="#" title="Next" data-page="' + (self.pageNo + 1) + '">Next</a></li>').appendTo(ul);
            if(!self.hasNext) {
                nextLi.addClass('disabled');
            }
            if(self.pageNo == 1) {
                prevLi.addClass('disabled');
            }
            nav.parent().prepend('<span class="form-inline pr" style="top: 5px">Current page ' + self.dataList.length + ' items, show <input type="number" name="pageSize" class="form-control w40" min="1" max="2000" value="' + self.pageSize + '" title="1 ~ 2000之间的整数" /> rows each page.' );
        }
        else { //带页码的分页信息
            ul.append('<li><a href="#" title="First" data-page="1">&laquo;</a></li>');
            ul.append('<li><a href="#" title="Previous" data-page="' + (self.pageNo - 1) + '">‹</a></li>');

            var total = self.total || self.filterDataList.length;
            var totalPage = parseInt(total / self.pageSize);
            if(totalPage * self.pageSize < total) {
                totalPage ++;
            }

            var start = self.pageNo - 2;
            if(start < 1) {
                start = 1;
            }

            var end = start + 4;
            if(end > totalPage) {
                end = totalPage;
                start = end - 4;
                start < 1 && (start = 1);
            }

            while(start <= end) {
                var li = $('<li><a href="#" data-page="' + start + '">' + start + '</a></li>').appendTo(ul);
                if(start === self.pageNo) {
                    li.addClass('active');
                }
                start ++;
            }

            ul.append('<li><a href="#" title="Next" data-page="' + (self.pageNo + 1) + '">›</a></li>');
            ul.append('<li><a href="#" title="Last" data-page="' + totalPage + '">&raquo;</a></li>');
            if(self.pageNo === 1) {
                ul.find('li:lt(2)').addClass('disabled');
            }
            if(self.pageNo === totalPage || totalPage === 0) {
                var last = ul.find('li:last-child').addClass('disabled');
                last.prev().addClass('disabled');
            }
            nav.parent().prepend('<span class="form-inline pr" style="top: 5px">Total ' + total + ' rows in ' + totalPage + ' pages, show <input type="number" name="pageSize" class="form-control w40" min="1" max="2000" value="' + self.pageSize + '" title="1 ~ 2000之间的整数" /> rows each page.' );
            nav.append('<span class="form-inline"><input type="number" name="pageNo" class="form-control w40" min="1" max="' + totalPage + '" /><button class="btn btn-default" type="submit">GO</button></span>');
        }
        

        return tfoot;
    }

    self._render = function() {

        var caption = self._renderCaption();
        var thead = self._renderHead();
        var tbody = self._renderBody();
        var foot = self._renderFoot();

        self.table.html('').off('click');
        self.table.append(caption);
        self.table.append(thead);
        self.table.append(tbody);
        self.table.append(foot);

        self._bindEvents();
    }

    self.placeAt = function(container) {
        var container = $(container);
        toolsDojo.destroyByNode(container[0]);
        container.html('');

        self._render();
        self.table.appendTo(container);
    }
    
    //根据搜索条件、重新加载tbody中的数据----
    self._reloadBody = function() {
        self.table.removeClass('zLoadingCover');
        var tbody = self.table.find('tbody').replaceWith(self._renderBody());

        self.afterLoad && self.afterLoad();
    }

    self._reloadFoot = function() {
        self.table.find('tfoot').replaceWith(self._renderFoot());
    }

    //服务器端加载数据----------
    self._loadData = function () {
        if(!self.pageNo) {
            self.pageNo = 1;
        }
        // self.table.find('tbody').html('<tr><td colspan="100"><i class="zLoadingIcon mr5"></i>Loading...</td></tr>');
        self.table.addClass('zLoadingCover');
        var params = {
            pageNo: self.pageNo,
            pageSize: self.pageSize
        }
        if(self.sortKey) {
            params.orderBy = self.sortKey;
            params.desc = self.sortUp? "asc": "desc";
        }
        
        self.ajaxCallback && self.ajaxCallback(params, function(dataList) {
            self.dataList = dataList;
            if(!self.pageNo) {
                self.pageNo = 1;
            }
            self._reloadBody();
            self._reloadFoot();
        });
    }

    self.export = function(){
        var text = this._renderExport();
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm1";
        tempForm.method = "post";
        tempForm.action = '/product/owerp/util/csv.jsp';
        tempForm.charset = "UTF-8";
        var fileNameInput = document.createElement("input");
        fileNameInput.type="hidden";
        fileNameInput.name = "name";
        fileNameInput.value = this.exportFile + '.csv';
        tempForm.appendChild(fileNameInput);
        var contentInput = document.createElement("input");
        contentInput.type="hidden";
        contentInput.name = "content";
        contentInput.value = text;
        tempForm.appendChild(contentInput);
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    }

    self._renderExport = function(){  // 导出数据默认调用方法，可以重写.....
        var exportTable = "<table>";
        var tHead = this._renderHead();
        exportTable += tHead[0].outerHTML;
        var tbody = $('<tbody></tbody>');
        self.filterDataList.map(function(model) {
            tbody.append(self.renderTr(model)[0]);
        })
        exportTable += tbody[0].outerHTML;
        exportTable += '</table>';
        table = $(exportTable);
        table.find('[data-export="false"]').each(function(){
            var index = $(this).index();
            table.find('thead tr th:eq(' + index + ')').remove();
            table.find('tbody tr').find('td:eq(' + index + ')').remove();
        })
        var text = table.html();
        text = text.replace(/(<thead[^>]*>)|(<tbody[^>]*>)|(<\/thead>)|(<\/tbody>)|(<tr[^>]*>)/g, '');
        text = text.replace(/(<th[^>]*>)|(<td[^>]*>)/g, '\"');
        text = text.replace(/(<\/th>)|(<\/td>)/g, '\t\",');
        text = text.replace(/,<\/tr>/g, '\n');
        text = text.replace(/(<[^>]*>)|(<\/[^>]*>)/g, "");  //去除别的html标签
        return text;
    }

    self._bindFootEvents = function() {
        self.table.on('click', 'tfoot .pagination li a', function(e) {
            e.preventDefault();
            var a = $(this);
            if(a.parent().hasClass('active') || a.parent().hasClass('disabled')) {
                return;
            }
            self.pageNo = parseInt(a.attr('data-page'));
            //服务器端加载数据--------
            if(self.total || typeof self.hasNext === 'boolean') {
                self._loadData();

                return;
            }

            self._reloadBody();
            self._reloadFoot();
        })
        .on('click', 'thead th[data-sort]', function() {
            if(!self.dataList) {
                return;
            }
            var th = $(this);
            th.parent().find('th').not(th).removeClass('sortUp').removeClass('sortDown');
            var key = th.attr('data-sort');
            var sortUp = true;

            if(th.hasClass('sortUp')) {
                th.removeClass('sortUp').addClass('sortDown');
                sortUp = false;
            }
            else{
                th.removeClass('sortDown').addClass('sortUp');
            }

            self.pageNo = 1;

            //服务器端加载数据--------
            if(self.total || typeof self.hasNext === 'boolean') {
                self.sortKey = key;
                self.sortUp = sortUp;
                self._loadData();

                return;
            }

            self.filterDataList.sort(function(a, b) {
                var valA, valB;
                if(a.trModel) {
                    valA = a.trModel[key];
                    valB = b.trModel[key];
                }
                else {
                    valA = self._getValByMappingKey(a, key);
                    valB = self._getValByMappingKey(b, key);
                }

                if(typeof valA === 'number') {
                    return sortUp? valA - valB : valB - valA;
                }

                return sortUp? valA.toString().localeCompare(valB) : valB.toString().localeCompare(valA); 
            })
            self._reloadBody();
        })
        .on('submit', 'tfoot form', function() {
            var form = self.table.find('tfoot form');
            self.pageSize = parseInt(form.find('input[name="pageSize"]').val());
            self.pageNo = parseInt(form.find('input[name="pageNo"]').val() || 1);

            //服务器端加载数据--------
            if(self.total || typeof self.hasNext === 'boolean') {
                self._loadData();

                return false;
            }

            self._reloadBody();
            self._reloadFoot();

            return false;
        })
    }

    //搜索匹配所有列
    self.search = function(searchStr) {
        if(!self.dataList || !self.dataList.length) {
            return;
        }
        if(!self.dataList[0].trModel) {
            self._buildTdData();
        }

        self.pageNo = 1;
        self.filterDataList = self.dataList.filter(function(model) {
            var ret = false;
            var trModel = model.trModel;
            for(var key in trModel) {
                if(trModel[key].toString().toUpperCase().indexOf(searchStr) !== -1) {
                    ret = true;
                    break;
                }
            }

            return ret;
        })

        self._reloadBody();
        self._reloadFoot();
    }

    self._bindEvents = function() {
        //search----
        self.table.off('input').on('input', 'caption .searchBox', function() {
            var searchStr = $.trim(this.value).toUpperCase();
            self.timer && clearTimeout(self.timer);
            self.timer = setTimeout(function(){
                self.search(searchStr);
            }, 500);
        })
        .off('click')
        .on('click', 'thead input:checkbox.cbxOcTable', function() {
            var checked = this.checked;
            self.table.find('tbody input:checkbox.cbxOcTable').each(function() {
                $(this).prop('checked', checked).change();
            })
        })
        .on('click', 'tbody input:checkbox.cbxOcTable', function() {
            self.table.find('thead input:checkbox.cbxOcTable').prop('checked', false).change();
        })
        .on('click', 'caption .btnExport', function() {
            self.export();
        })

        self._bindFootEvents();
    }
}


module.exports = Table;
},{"./toolsDojo":18}],18:[function(require,module,exports){

var Instance = {}

Instance.destroyByNode = function(node) {
    if(node && node.children && node.children.length) {
    	if(window.dojo && dojo.dijit && dojo.dijit.registry) {
    		var widget = dojo.dijit.registry.byNode(node.children[0]);
	        if (widget) {
	            widget.destroyDescendants();
	            widget.destroyRecursive();
	        }
    	}
    }
}

module.exports = Instance;


},{}],19:[function(require,module,exports){
var dialog = require('./dialog');

var Instance = {}

Instance.loadingButton = function(btn, noDisable) {
	btn = $(btn);
    if(btn[0].nodeName !== "BUTTON") {
    	btn = btn.find('button[type="submit"]:eq(0)');
    }
	var text = btn.html();
	btn.html('<i class="zLoadingIcon"></i>').attr('data-html', text);
	if(!noDisable) {
		btn.attr('disabled', 'disabled');
	}
};

Instance.resetButton = function(btn) {
	btn = $(btn);
    if(btn[0].nodeName !== "BUTTON") {
    	btn = btn.find('button[type="submit"]:eq(0)');
    }

	var text = btn.attr('data-html');
	btn.removeAttr('disabled').html(text)
};

Instance.validity = function(ele) {
	ele = $(ele);

	try {
		if('INPUT,TEXTAREA,SELECT'.indexOf(ele[0].nodeName.toUpperCase()) === -1) {
			ele = ele.find('input, textarea, select').filter(':visible');
		}

		var valid = true;
		ele.each(function() {
			var validity = this.validity;
			if(!validity.valid) {
				valid = false;

				var errMsg = '';
				if(this.title) {
					errMsg = this.title;
				}
				else if(this.validationMessage) {
					errMsg = this.validationMessage;
				}
				else if(validity.customError) {
					errMsg = 'Custome validity is not pass.';
				}
				else if(validity.patternMismatch) {
					errMsg = 'Format is not creact';
				}
				else if(validity.rangeOverflow) {
					errMsg = 'Value is to large';
				}
				else if(validity.rangeUnderflow) {
					errMsg = 'Value is to small';
				}
				else if(validity.stepMisMatch) {
					errMsg = 'Not allowed value';
				}
				else if(validity.tooLong) {
					errMsg = 'Value is too long';
				}
				else if(validity.typeMismatch) {
					errMsg = 'Value is not matched';
				}
				else if(validity.valueMissing) {
					errMsg = 'Value is required';
				}
				else {
					errMsg = 'Format is not creact';
				}

				dialog.warn(errMsg, this);
				this.focus();

				return false;
			}
		});

		return valid;
	}
	catch(err) {
		console.log('validity错误：', err);
		return true;
	}
};

Instance.getValueByParam = function(model, param) {
	if(param.indexOf('.') === -1) {
		return model[param];
	}
	param = param.split('.');
	var value = model;
	for(var i = 0; i < param.length; i ++) {
		var key = param[i];
		value = value[key];
		if(value === undefined) {
			return undefined;
		}
	}

	return value;
};

Instance.fill = function(form, model) {
	form = $(form);
	var ipts = form.find('input[name]:visible, select[name]:visible, textarea[name]:visible');

	ipts.each(function() {
		var name = this.name;
		var value = Instance.getValueByParam(model, name) || '';
		if(this.type == 'radio') {
			ipts.filter('[name="' + name + '"]').prop('checked', false);
			ipts.filter('[name="' + name + '"][value="' + value + '"]').prop('checked', true);
		}
		else if(this.type == 'checkbox') {
			var iptValue = this.value;
			if(value == iptValue || (value && value.indexOf && value.indexOf(iptValue) !== -1) ) {
				this.checked = true;
			}
			else {
				this.checked = false;
			}
		}
		else {
			$(this).val(value);
		}
	});
};

//isReplace: 如果为true, 相同key值将被替换，否则则生成数组, 默认替换---
Instance.setValueByParam = function(model, param, value, isReplace) {
	var target = null;
	if(param.indexOf('.') === -1) {
		if(!model[param] || isReplace) {
			model[param] = value;
		}
		else {
		    model[param] = model[param] instanceof Array? model[param] : [model[param]];
		    model[param].push(value);
		}
	}
	else {
		param = param.split('.');
		var target = model;
		for(var i = 0; i < param.length - 1; i ++) {
			var key = param[i];
			if(!target[key]) {
				target[key] = {};
			}
			target = target[key];
		}

		arguments.callee.call(this, target, param.slice(-1)[0], value, isReplace);
	}
}

Instance.getJson = function(form, removeEmpty) {
	var form = $(form);
	var model = {};
	var ipts = form.find('input[name]:visible, select[name]:visible, textarea[name]:visible');

	ipts.each(function() {
		var name = this.name;
		var value = this.value;

		if(this.type == 'checkbox') {
			this.checked && Instance.setValueByParam(model, name, value);
		}
		else if(this.type === 'radio') {
			this.checked && Instance.setValueByParam(model, name, value, true);
		}
		else if(!removeEmpty || value) {
			Instance.setValueByParam(model, name, value, true);
		}
	});

	return model
}

module.exports = Instance;


},{"./dialog":7}],20:[function(require,module,exports){

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


},{}],21:[function(require,module,exports){
var instance = {}

var setThWidth = function(originTable){
	var newTable = originTable.next('.zTableFixHead');
	newTable.find('thead tr').each(function(i){
		var tr = $(this);
		var trOrigin = originTable.find('tr:eq(' + i + ')');
		tr.find('th').each(function(j){
			var th = $(this);
			var thOrigin = trOrigin.find('th:eq(' + j + ')');
			th.css('width', thOrigin.outerWidth());
		})
	})
}

var setStyle = function(originTable){
	var newTable = originTable.next('.zTableFixHead');
	originTable.parent().scrollTop(0);
	var position = originTable.position();

	newTable.css({
		position: 'absolute',
		left: position.left,
		width: originTable.width(),
		top:  position.top
	})
}

var setScrollLeft = function(originTable){
	var newTable = originTable.next('.zTableFixHead');

	newTable.css({
		left: originTable.position().left
	})
}

instance.fixHead = function(eles){
	eles = $(eles);
	eles.each(function(){
		var table = $(this);
		
		table.next('.zTableFixHead').remove();
		newTable = $(this).clone().addClass('zTableFixHead');
		newTable.find('tbody, tfoot').remove();

		var originHead = table.find('thead');
		table.after(newTable);

		setThWidth(table);
		setStyle(table);

		table.parent().on('scroll', function(){
			if(timer){
				clearTimeout(timer);
			}
			else{
				var timer = setTimeout(function(){
					eles.each(function(){
						var table = $(this);
						setScrollLeft(table);
					})
				}, 100);
			}
		})
	})

	$(window).on('resize', function(){
		if(timer){
			clearTimeout(timer);
		}
		else{
			var timer = setTimeout(function(){
				eles.each(function(){
					var table = $(this);
					setThWidth(table);
					setStyle(table);
				})
			}, 100);
		}
	})
}


module.exports = instance;

},{}],22:[function(require,module,exports){
/** 
* @file 生成无限级的树形结构
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* 生成无限级的树形结构
* @class Tree
* @constructor
* @param {object} options 配置变量对象：<br /> container：容器对象，默认为document.body<br />data：初始树形结构的数据<br />showLevel：初始展开的级别，默认为1
* @example
var tree = new oc.Tree({
    data: {
	    "id": "1",
	    "name": "Root category",
	    "description": "",
	    "items": [{
	        "id": "2",
	        "name": "ERP's",
	        "description": "",
	        "items": [{
	            "id": "3",
	            "name": "email sent related",
	            "description": "",
	            "items": null
	        }, {
	            "id": "4",
	            "name": "ERP's others",
	            "description": "",
	            "items": null
	        }]
	    }]
	}
});
*/

var Tree = function(options){
	this.config = {
		container: 'body',
		data: null,
		showLevel: 1
	};
	this.ele = null;
	this.addClickCallback = null;
	this.editClickCallback = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	var self = this;

	/** 
	* 初始化界面
	* @method render
    * @memberof Tree 
    * @instance
    */
	self.render = function(){
		self.ele = $('<ul class="zTree"></ul>');
		var li = $('<li class="zTreeItem"><p>' + self.config.data.name + '</p></li>').data(self.config.data);
		li.appendTo(self.ele);
		
		self._renderRecusive(self.config.data.items, li, 0);
		$(this.config.container).find('.zTree').remove();
		$(this.config.container).append(self.ele);

		self._bindEvents();
	}

	/** 
	* 查询节点，采用开头匹配的模式进行搜索
	* @method filter 
	* @param {string} keyword - 关键字
    * @memberof Tree 
    * @instance
    */
	self.filter = function(keyword){
		self.removeFilterTag();
		if(!keyword){
            return;
        }
        keyword = keyword.toUpperCase();
        self.ele.find('.zTreeItem:gt(0)').removeClass('active').each(function(){
            var item = $(this);
            var name = item.find('>p').html().toUpperCase();
            if(name.indexOf(keyword) === 0){
                item.parents('.zTreeItem').addClass('active');
                item.addClass('treeTag');
            }
        })
	}

	/** 
	* 搜索标记后，移除标记用
	* @method removeFilterTag 
    * @memberof Tree 
    * @instance
    */
	self.removeFilterTag = function(){
		self.ele.find('.treeTag').removeClass('treeTag');
	}

	/** 
	* 递归生成树节点
	* @method _renderRecusive 
	* @param {object} dataList - 树节点的数组对象
	* @param {object} ele - 父节点
	* @param {number} level - 父节点的级别
    * @memberof Tree 
    * @instance
    */
	self._renderRecusive = function(dataList, ele, level){
		if(!dataList){
			return;
		}
		var len = dataList.length;
		if(len > 0){
			ele.addClass('hasMore');
		}
		if(level < this.config.showLevel){
			ele.addClass('active');
		}
		var ul = $('<ul></ul>');
		
		for(var i = 0; i < len; i++){
			var one = dataList[i];
			var li = $('<li class="zTreeItem" draggable="true"><p>' + one.name + '</p></li>');
			if(one.description){
				li.addClass('zTreeItemDes').find('>p').attr('title', one.description).append('<span class="spanDesc"> - ' + one.description + '</span>');
			}
			li.appendTo(ul).data(one);
			if(one.items && one.items.length > 0){
				self._renderRecusive(one.items, li, level + 1);
			}
		}
		if(len > 0){
			ul.appendTo(ele);
		}
	}

	/** 
	* 绑定内部事件
	* @method _bindEvents 
    * @memberof Tree 
    * @instance
    */
	self._bindEvents = function(){
		self.ele.on('click', '.zTreeItem p', function(){
			$(this).parent().toggleClass('active');
		})
		.on('mouseenter', '.zTreeItem p', function(){
			$('<span class="zTreeControl"><i class="icon-plus2"></i><i class="icon-cog"></i><i class="icon-minus2 none"></i></span>').hide().appendTo(this).fadeIn(1000);
		})
		.on('mouseleave', '.zTreeItem p', function(){
			$(this).find('.zTreeControl').remove();
		})
		.on('click', '.icon-minus2', function(e){
			e.stopPropagation();
			var treeItem = $(this).parents('.zTreeItem:eq(0)');
			var ul = treeItem.parent();
			var model = treeItem.data();
			if(!model || !model.id){
				treeItem.fadeOut(500, function(){
					treeItem.remove();
					if(ul.find('.zTreeItem').length === 0){
						ul.remove();
					}
				});
				return;
			}

			var id = treeItem.data().id;
			self.deleteNode(id, function(){
				treeItem.fadeOut(500, function(){
					treeItem.remove();
					if(ul.find('.zTreeItem').length === 0){
						ul.remove();
					}
				});
			});
		})
		.on('click', '.icon-cog', function(e){
			e.stopPropagation();
			var p = $(this).parent().parent();
			p.addClass('zTreeEdit');
			p.html('<input type="text" name="name" placeholder="name" maxLength="250"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark"></i>');
			var model = p.parent().data();
			p.find('[name="name"]').val(model.name);
			p.find('[name="description"]').val(model.description);

			self.editClickCallback && self.editClickCallback(p);

		})
		.on('click', '.zTreeEdit input, .zTreeEdit i, .zTreeControl', function(e){
			e.stopPropagation();
		})
		.on('click', '.icon-checkmark', function(e){
			e.stopPropagation();
			var i = $(this);
			i.removeClass('icon-checkmark').addClass('zLoadingIcon');
			var li = i.parents('.zTreeItem:eq(0)').removeClass('zTreeItemDes');
			var model = li.data();
			if(!model || !model.id){
				model = {};
				var parentModel = li.parents('.zTreeItem:eq(0)').data()
				model.fid = parentModel.id;
				model.level = parseInt(parentModel.level) + 1;
			}
			model.name = li.find('[name="name"]').val();
			model.description = li.find('[name="description"]').val();

			var clearEditStatus = function(isOK){
				if(isOK === false){
					i.removeClass('zLoadingIcon').addClass('icon-checkmark');
					return;
				}
				li.parents('.zTreeItem').addClass('hasMore');
				li.data(model).find('>p').html(model.name).removeClass('zTreeEdit zTreeAdd');
				if(model.description){
					li.addClass('zTreeItemDes').find('>p').attr('title', model.description).append('<span class="spanDesc"> - ' + model.description + '</span>');
				}
			}
			model.id? self.updateNode(model, clearEditStatus) : self.addNode(model, clearEditStatus)
			
		})
		.on('click', '.icon-plus2', function(e){
			e.stopPropagation();
			var li = $(this).parents('.zTreeItem:eq(0)').addClass('active');
			var ul = li.find('>ul');
			if(ul.length === 0){
				ul = $('<ul></ul>').appendTo(li);
			}
			var newLi = $('<li class="zTreeItem"></li>');
			newLi.append('<p class="zTreeEdit zTreeAdd"><input type="text" name="name" placeholder="name" maxLength="250"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark"></i></p>');
			newLi.appendTo(ul);
			
			self.addClickCallback && self.addClickCallback(e);
		})
		.on('dragstart', '.zTreeItem[draggable]', function(e){
			e.stopPropagation();
			self.dragEle = $(this);
			//firefox兼容----
            e.originalEvent && e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.setData("dragEle", e.target);
		})
		.on('dragenter', '.zTreeItem>p', function(e){
			e.stopPropagation();
			e.preventDefault();
			var ele = $(this);
			var li = ele.parent();
			var source = self.dragEle.data();
			var target = li.data();
			var sourceId = source.id;
			var targetId = target.id;
			// //只能在相同级别排序
			// if(source.level !== target.level){
			// 	return;
			// }
			//不能拖拽到自己---
			if(targetId == sourceId && source.level == target.level){
				return;
			}
			//相同的元素中
			// if(targetId == self.dragEle.parents('li:eq(0)').data().id){
			// 	return;
			// }

			//不能级别之间------
			if(li.data().fid != self.dragEle.data().fid && targetId != self.dragEle.data().fid){
				return;
			}

			li.addClass('treeTag');
		})
		.on('dragleave', '.zTreeItem>p', function(e){
			self.timer && clearTimeout(self.timer);
			e.stopPropagation();
			$(this).parent().removeClass('treeTag');
		})
		.on('dragover', '.zTreeItem.treeTag', function(e){
			e.preventDefault();
		})
		.on('drop', '.zTreeItem.treeTag', function(e){
			var ele = $(this);
			var source = self.dragEle.data();
			var target = ele.data();
			var sourceId = source.id;
			var targetId = target.id;
			if(source.fid == targetId){
				targetId = 0;
			}
			self.moveNode(sourceId, targetId, function(isOK, msg){
				ele.removeClass('treeTag');
				if(isOK){
					if(targetId == 0){
						ele.find('>ul').prepend(self.dragEle);
					}
					else{
						self.dragEle.insertAfter(ele);
					}
				}
				else{
					oc.dialog.tips(msg);
				}
			});
			
			e.stopPropagation();
			e.preventDefault();
		})
	}

	/** 
	* 移动节点
	* @method moveNode 
	* @param {string} sourceId - 被拖动的节点id
	* @param {string} targetId - 被放下（drop）的节点id
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.moveNode = function(sourceId, targetId, cb){
		$.ajax({
			url: '/moveNode',
			type: 'post',
			data: {sourceId: sourceId, targetId: targetId},
			success: function(){
				cb(true);
			},
			error: function(res){
				cb(false, res.responseText);
			}
		})
    }
    */
	self.moveNode = function(sourceId, targetId, cb){
		cb(true);
	}

	/** 
	* 删除节点，需要额外根据业务实现该方法
	* @method deleteNode 
	* @param {string} nodeId - 节点id
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.deleteNode = function(nodeId, cb){
		$.ajax({
			url: '/delete/' + nodeId,
			type: 'delete',
			success: function(){
				cb();
			},
			error: function(res){
				oc.dialog.tips(res.responseText);
			}
		})
    }
    */
	self.deleteNode = function(nodeId, cb){
		// $.get('/tree/delete/' + nodeId, cb);
		cb();
	}

	/** 
	* 更新节点，需要额外根据业务实现该方法
	* @method updateNode 
	* @param {object} model - 节点对象
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.updateNode = function(model, cb){
		$.ajax({
			url: '/update/' + model.id,
			type: 'post',
			data: model,
			success: function(){
				cb(true);
			},
			error: function(res){
				oc.dialog.tips(res.responseText);
				cb(false);
			}
		})
    }
    */
	self.updateNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	/** 
	* 添加节点，需要额外根据业务实现该方法
	* @method addNode 
	* @param {object} model - 节点对象
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.addNode = function(model, cb){
		$.ajax({
			url: '/add',
			type: 'put',
			data: model,
			success: function(){
				cb(true);
			},
			error: function(res){
				oc.dialog.tips(res.responseText);
				cb(false);
			}
		})
    }
    */
	self.addNode = function(model, cb){
		setTimeout(cb, 2000);
	}


	self.render();
}

module.exports = Tree;
},{}],23:[function(require,module,exports){
var TreeDialogSelect = function(ipt, dataList){
	this.ele = $(ipt);
	this.valueChangeHanlder = null;
	this.dialogPanel = $('<div class="treeDialogSelect"></div>');
	this.dataList = dataList;
	this.productLine = null;
	this.keyword = '';
	this.canSelectedFolder = false;

	var self = this;

	self._render = function(){
		self.dialogPanel.append('<div class="borderBottom pb10 pl10"><span style="padding-right:58px;">Search:</span><input id="txtKeyword" type="text" class="ipt w200">' + 
			'<span class="ml20 f12 spanInfo" style="color:#888"><i class="icon-info mr5" style="color:#eea236;"></i>eg:Search to the items and it\'s children. </span></div>');

		if(self.canSelectedFolder){
			self.dialogPanel.find('.spanInfo').append(' Double click to select the folder.');
		}
		var resposibleUl = $('<ul class="ulResposible ulData"><li class="liTitle">Resposibles:</li></ul>');
        var productLines = [];

        for(var i = 0; i < self.dataList.length; i++){
            var item = self.dataList[i];
            var li = $('<li class="liFolder">' + item.name + '</li>').data(item);
            li.appendTo(resposibleUl);
            if(item.items){
                item.items.map(function(model){
                    var description = model.description;
                    if(!description){
                        return true;
                    }
                    var lines = description.split(/[\s|,]/g);
                    for(var i = 0; i < lines.length; i ++){
                        if($.inArray(lines[i], productLines) === -1){
                            productLines.push(lines[i]);
                        }
                    }
                })
            }
        }
        productLines.sort();

        var cateUl = $('<ul class="ulProductLine"><li class="liTitle">Product Lines:</li></ul>');
        productLines.map(function(model){
            cateUl.append('<li>' + model + '</li>');
        })
        if(self.productLine){
        	cateUl.find('li:contains(' + self.productLine + ')').addClass('active');
        }
        cateUl.appendTo(self.dialogPanel);
        resposibleUl.appendTo(self.dialogPanel);

        self._bindEvents();
	}

	//render的时候标记选择项------------------
	self._setSelected = function(){
		var selectedList = self.ele.data('selectedList');
		if(selectedList && selectedList.length > 0){
			selectedList.map(function(model){
				var currentUl = $('.zDialog .ulData:last');
				var li = currentUl.find('li:eq(' + model.eleIndex + ')').addClass('active');
				self._renderChild(currentUl, li);
			})
		}
	}

	self._renderChild = function(ele, li){
		var model = li.data();
		if(model.items && model.items.length){
			var ul = $('<ul class="ulData"><li class="liTitle">Children:</li></ul>');
			model.items.map(function(one){
				var li = $('<li title="' + one.name + '">' + one.name + '</li>').data(one);
				if(!one.items || one.items.length === 0){
					li.addClass('liData');
				}
				else{
					li.addClass('liFolder');
				}
				ul.append(li);

				if(self.productLine && ele.hasClass('ulResposible') && one.description && one.description.indexOf(self.productLine) === -1){
					li.hide();
				}
			})

			ele.after(ul);
			if(model.items && model.items.length > 0 && self._needFilter(li)){
				self.filter(ul.find('li'));
			}
		}
	}

	//li本身满足过滤条件，或者li的父元素满足过滤条件---------
	self._needFilter = function(li){
		var lis = li.parent().prevAll('.ulData').find('li.active');
		lis = li.add(lis);

		var ret = false;
		lis.each(function(){
			var oneLi = $(this);
			var model = oneLi.data();
			var name = model.name.toUpperCase();
			var oneRet = false;
			//品线过滤---------------------------------------
			if(model.description && self.productLine && model.description.indexOf(self.productLine) === -1){
				return true;
			}
			else if(self.keyword && name.indexOf(self.keyword) !== 0){
				return true;
			}

			ret = true;
			return false;
		})

		return !ret;
	}

	self._bindEvents = function(){
		self.ele.off('click').on('click', function(){		
			self.dialogPanel.html('');
			self._render();

			self.keyword = null;
			oc.dialog.open('', self.dialogPanel, function(){
        		self._setSelected();
			});
			self.dialogClickHanlder();
		})
	}

	self.filter = function(lis){
		if(!lis){
			lis = $('ul.ulData li');
		}
		lis.each(function(){
			var li = $(this).show();
			if(li.hasClass('liTitle')){
				return true;
			}
			
			var model = li.data();
			//品线过滤支持分号分割的多个品线混合搜索---------------------------------------
			if(model.description){
				var array = self.productLine.split(';');
				if(array.length > 1){
					var check = false;
					array.map(function(productLine){
						productLine = $.trim(productLine);
						if(productLine && model.description.indexOf(productLine) !== -1){
							check = true;
						}
					})
					if(check === false){
						li.hide();
						return true;
					}
				}
				else if(self.productLine && model.description.indexOf(self.productLine) === -1){
					li.hide();
					return true;
				}
			}

			//搜索过滤---------------------------------------
			var name = model.name.toUpperCase();
			if(self.keyword && name.indexOf(self.keyword) !== 0){
				// li.hide();
				//看看子节点有没有符合的
				if(!self.filterChildren(model.items)){
					li.hide();
				}
			}
		})
	}

	self.filterChildren = function(list){
		var ret = false;

		var filterList = function(list){
			if(!list || list.length === 0){
				return ret;
			}
			if(ret === true){
				return ret;
			}

			for(var i = 0; i < list.length; i++){
				if(ret === true){
					return true;
				}
				var model = list[i];
				var oneRet = true;
				var name = model.name.toUpperCase();
				if(model.description && self.productLine && model.description.indexOf(self.productLine) === -1){
					oneRet = false;
				}
				else if(self.keyword && name.indexOf(self.keyword) !== 0){
					oneRet = false;
				}

				if(oneRet === true){
					ret = true;
					return true;
				}

				filterList(model.items);
			}
		}

		filterList(list);

		return ret;
	}

	self.selectedHanlder = function(e){
		var li = $(this);
		if(li.hasClass('liFolder') && !self.canSelectedFolder){
			return;
		}
		var selectedItem = li.data();
		selectedItem.eleIndex = li.index();
		self.ele.data('selectedItem', selectedItem);
		var ul = li.parent();
		var selectedList = [];
		ul.prevAll('ul.ulData').each(function(){
			var activeLi = $(this).find('li.active');
			activeLi.data().eleIndex = activeLi.index();
			selectedList.push(activeLi.data());
		})
		selectedList.reverse();
		selectedList.push(selectedItem);
		self.ele.data('selectedList', selectedList);

		self.ele.val(this.innerHTML);
		oc.dialog.close();
	}

	//dialog上点击的事件---------------------
	self.dialogClickHanlder = function(){
		$('.zDialog')
		.on('click', 'li.liFolder', function(){
			var clickLi = $(this);
			var ul = clickLi.parent();
			ul.find('.active').removeClass('active');
			clickLi.addClass('active');
			ul.nextAll('.ulData').remove();
			// var model = clickLi.data();
			self._renderChild(ul, clickLi);
		})
		//双击文件夹选项---------------------------
		.on('dblclick', 'li.liFolder',  self.selectedHanlder)
		//点击非文件夹选项---------------------------
		.on('click', 'li.liData', self.selectedHanlder)
		
		//品线过滤-------------------------------
		.on('click', '.ulProductLine li:gt(0)', function(){
			var li = $(this);
			if(li.hasClass('active')){
				li.removeClass('active');
				self.productLine = null;
				$('.zDialog .ulData:eq(1) li').show();
				return;
			}
			li.parent().find('.active').removeClass('active');
			li.addClass('active');
			self.productLine = li.html();

			self.filter();
		})
		.on('input', '#txtKeyword', function(){
			self.keyword = $.trim(this.value).toUpperCase();
			self.filter();
		})
	}

	self.setSelectedByIds = function(ids){
		var selectedList = [];
		var selectedItem = null;

		if(!ids || !ids.length){
			self.ele.html('');
		}
		var dataList = $.extend([], self.dataList);

		for(var i = 0; i < ids.length; i ++){
			var id = ids[i];
			if(!id){
				break;
			}

			var model = null;
			for(var j = 0; j < dataList.length; j++){
				var one = dataList[j];
				if(one.id == id){
					model = one;
					break;
				}
			}
			
			if(!model){
				break;
			}
			model.eleIndex = j + 1;
			dataList = $.extend([], model.items);
			selectedList.push(model);
			selectedItem = model;
		}

		var name = '';
		if(selectedItem){
			name = selectedItem.name;
		}
		
		self.ele.data('selectedList', selectedList);
		self.ele.data('selectedItem', selectedItem);
		self.ele.val(name);
	}

	self._render();
}

module.exports = TreeDialogSelect;
},{}],24:[function(require,module,exports){

var TreeOriganization = function(options){
	this.config = {
		container: 'body',
		data: null,
		teamData: null,
		showLevel: 1,
		family: null,
		allUser: null,
		isShowAdmin: false
	};
	this.allUserName = null,
	this.ele = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	var self = this;

	if(self.config.allUser){
		self.allUserName = [];
		self.config.allUser.map(function(model){
			self.allUserName.push(model.fullName);
		})
	}

	self.render = function(){
		self.ele = $('<ul class="zTree zTreeOrganization"></ul>');
		var li = $('<li class="zTreeItem zTreeItemFolder"><p><span class="pName">海翼电商</span></p></li>');
		li.appendTo(self.ele);

		self._renderRecusive(self.config.data.children, li, 0);
		self.ele.find('>li>ul>li').removeAttr('draggable');
		self.ele.appendTo($(this.config.container));

		self.resetShowName();
		self._bindEvents();
	}

	self._renderRecusive = function(dataList, ele, level){
		if(!dataList){
			return;
		}
		var len = dataList.length;
		if(len > 0){
			ele.addClass('hasMore');
		}
		if(level < this.config.showLevel){
			ele.addClass('active');
		}
		var ul = $('<ul></ul>');
		
		for(var i = 0; i < len; i++){
			var one = dataList[i];

			var li = $('<li class="zTreeItem" draggable="true" data-type="' + one.nodeType + '"><p><span class="pName">' + one.name + '</span></p></li>');
			
			if(one.nodeType === 30){ //虚拟节点，用来展示还未添加的人员信息
				li.removeAttr('draggable');
			}
			
			//二级节点（部门、汇报关系..)，或者部门节点-----
			if(one.nodeType == 10 || one.nodeType == 1 || one.nodeType == 2){
				li.addClass('zTreeItemFolder');
			}
			else if(one.nodeType == 21){ //汇报关系中的个人---------
				li.addClass('zTreeItemReport');
			}

			if(one.status !== 0){
				li.find('p').addClass('lineThrough');
			}
			if(one.childrenCount && one.nodeType === 21){ //汇报关系节点中显示直接汇报的下属人数---------
				li.find('p').append('<span class="treeCount">' + one.childrenCount + '</span>');
			}
			if(one.userCount && (one.nodeType === 1 || one.nodeType === 2) ){ //二级节点上显示下面不重复的总人数---------
				li.find('p').append('<span class="treeCountMember">' + one.userCount + '</span>');
			}
			li.appendTo(ul).data(one);

			if(one.children && one.children.length > 0){
				self._renderRecusive(one.children, li, level + 1);
			}
		}
		if(len > 0){
			ul.appendTo(ele);
		}
	}

	//设置节点显示的名称 ------
	self.resetShowName = function(){
		self.ele.find('li.zTreeItem>p').each(function(){
			var p = $(this);
			var li = p.parent();
			var model = li.data();
			if(!model || !model.nodeType){
				return true;
			}

			var nodeType = model.nodeType;

			if(nodeType === 10){ //部门信息------------
				var departmentId = model.name;
				var departmentModel = self.config.teamData.filter(function(one){
					return one.id == departmentId;
				});

				if(departmentModel.length == 0){
					li.html('<p><span class="pName">未知部门</span></p>');
				}
				else{
					departmentModel = departmentModel[0];
					model.addOn = departmentModel;
					p.find('.pName').html(departmentModel.name);
				}
			}
			else if(nodeType === 21 || nodeType === 11){//个人节点--------
				var name = li.data().name;
				var findUsers = self.config.allUser.filter(function(model){
					return model.name == name;
				})
				if(findUsers.length > 0){
					model.addOn = findUsers[0];
					p.find('.pName').html(findUsers[0].fullName);
				}
			}
		})
	}

	self.filter = function(keyword){
		self.removeFilterTag();
		if(!keyword){
            return;
        }
        keyword = keyword.toUpperCase();
        self.ele.find('.zTreeItem:gt(0)').removeClass('active').each(function(){
            var item = $(this);
            var name = item.find('>p>.pName').text().toUpperCase();
            if(name.indexOf(keyword) === 0){
                item.parents('.zTreeItem').addClass('active');
                item.addClass('treeSearch');
            }
        })
	}

	self.removeFilterTag = function(){
		self.ele.find('.treeSearch').removeClass('treeSearch');
	}

	self._bindEvents = function(){
		self.ele.on('click', '.zTreeItem p', function(){
			var li = $(this).parent();
			li.toggleClass('active');
		})
		.on('mouseenter', '.zTreeItem p', function(){
			$('<span class="zTreeControl"><i class="icon-plus2"></i><i class="icon-cog"></i><i class="icon-minus2"></i></span>').hide().appendTo(this).fadeIn(1000);
		})
		.on('mouseleave', '.zTreeItem p', function(){
			$(this).find('.zTreeControl').remove();
		})
		.on('click', '.icon-minus2', function(e){
			e.stopPropagation();
			var treeItem = $(this).parents('.zTreeItem:eq(0)');
			var ul = treeItem.parent();
			var model = treeItem.data();

			self.deleteNode(model, function(){
				treeItem.fadeOut(500, function(){
					treeItem.remove();
					if(ul.find('.zTreeItem').length === 0){
						ul.remove();
					}
				});
			});
		})
		.on('click', '.icon-cog', function(e){
			e.stopPropagation();
			var p = $(this).parent().parent();
			var li = p.parent();
			var model = li.data();
			self.model = model;
			self.dialogEdit(li);
		})
		.on('click', '.zTreeEdit input, .zTreeEdit i, .zTreeControl', function(e){
			e.stopPropagation();
		})
		.on('click', '.icon-plus2', function(e){
			e.stopPropagation();
			var li = $(this).parents('.zTreeItem:eq(0)').addClass('active');
			self.model = null;
			self.parentModel = li.data();
			self.dialog(li);
		})
		.on('dragstart', '.zTreeItem[draggable]', function(e){
			e.stopPropagation();
			self.dragEle = $(this);
			//firefox兼容----
            e.originalEvent && e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.setData("dragEle", e.target);
		})
		.on('dragenter', 'ul', function(e){
			e.stopPropagation();
			e.preventDefault();
		})
		.on('dragenter', '.zTreeItemFolder>p>span, .zTreeItemReport>p>span', function(e){  //move in
			e.stopPropagation();
			e.preventDefault();
			var ele = $(this);
			var li = ele.parents('li:eq(0)');
			
			var source = self.dragEle.data();
			var target = li.data();

			var sourceId = source.id;
			var targetId = target.id;
			// if(target.nodeType != 21 && target.nodeType != 10){
			// 	return;
			// }
			if(sourceId == targetId){
				return;
			}
			//人员不允许直接添加到海翼
			if(li.hasClass('zTree')){
				return;
			}
			//相同的元素中
			if(targetId == self.dragEle.parents('li:eq(0)').data().id){
				return;
			}

			//不能的family之间不能拖拽------
			if(target.familyName != source.familyName){
				return;
			}

			//不能拖拽到子元素中 -----
			var parentsLis = li.parents('li');
			var ok = true;
			parentsLis.each(function(){
				var parentId = $(this).data().id;
				if(parentId == sourceId){
					ok = false;
				}
			})
			if(!ok){
				return;
			}
			li.addClass('treeTag');
			self.timer = setTimeout(function(){
				li.addClass('active');
			}, 1500);
		})
		.on('dragenter', '.zTreeItem', function(e){  //move sort
			e.stopPropagation();
			e.preventDefault();
			var li = $(this);
			
			var source = self.dragEle.data();
			var target = li.data();

			var sourceId = source.id;
			var targetId = target.id;
			if(sourceId == targetId){
				return;
			}
			// 不能的family之间不能排序------
			if(target.familyName != source.familyName){
				return;
			}
			var dragParentId = self.dragEle.parents('li:eq(0)').data().id;
			if(dragParentId !== li.parents('li:eq(0)').data().id && dragParentId != targetId){
				return;
			}
			li.addClass('treeTagSort');
		})
		.on('dragleave', '.zTreeItem', function(e){
			e.stopPropagation();
			var ele = $(this);
			ele.removeClass('treeTagSort');
		})
		.on('dragleave', '.zTreeItem>p>span', function(e){
			e.stopPropagation();
			self.timer && clearTimeout(self.timer);
			var ele = $(this).parents('li:eq(0)');
			
			if(ele.hasClass('treeTag')){
				ele.removeClass('treeTag');
			}
		})
		.on('dragover', '.zTreeItem', function(e){
			e.preventDefault();
		})
		.on('drop', '.zTreeItemFolder.treeTag, .zTreeItemReport.treeTag', function(e){
			var ele = $(this);
			var source = self.dragEle.data();
			var target = ele.data();
			var sourceId = source.id;
			var targetId = target.id;
			
			self.moveNode(sourceId, targetId, function(isOK, msg){
				ele.removeClass('treeTag');
				if(isOK){
					var ul = ele.find('>ul');
					if(ul.length == 0){
						ul = $('<ul></ul>').appendTo(ele);
					}
					ele.addClass('hasMore');
					var dragParent = self.dragEle.parents('ul:eq(0)');
					source.parentId = targetId;
					self.dragEle.data(source);
					self.dragEle.appendTo(ul);
					if(dragParent.find('li').length === 0){
						dragParent.parent().removeClass('hasMore');
						dragParent.remove();
					}
				}
				else{
					oc.dialog.tips(msg);
				}
			});
			
			e.stopPropagation();
			e.preventDefault();
		})
		.on('drop', '.zTreeItem.treeTagSort', function(e){
			var ele = $(this);
			var source = self.dragEle.data();
			var target = ele.data();
			var sourceId = source.id;
			var targetId = target.id;
			if(self.dragEle.parents('li:eq(0)').data().id == targetId){
				targetId = null;
			}
			self.sortNode(sourceId, targetId, function(isOK, msg){
				ele.removeClass('treeTagSort');
				if(isOK){
					if(targetId == null){
						ele.find('>ul').prepend(self.dragEle);
					}
					else{
						self.dragEle.insertAfter(ele);
					}
				}
				else{
					oc.dialog.tips(msg);
				}
			});
			
			e.stopPropagation();
			e.preventDefault();
		})
	}

	self.dialogEdit = function(li){
		var form = '<div class="formOrganization">' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off" value="' + li.find('>p>.pName').text() + '"></p>' + 
				'<div class="dialogBottom"><button class="btn btn-primary w100 mr20 btnSub">Save</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		if(self.model.nodeType === 10){
			form = '<div class="formOrganization">' + 
				'<a class="jsAddTeam" href="#">Add a team</a>' + 
				'<p class="mt10 divGroup"><span class="mt10">Name: </span><select class="slcDepartmentType form-control input-sm" name="departmentType" style="width:120px !important"></select><select class="slcDepartment form-control input-sm" name="name" style="width:280px !important"></select></p>' + 
				'<div class="dialogBottom"><button class="btn btn-primary w100 mr20 btnSub">Save</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		}
		
		oc.dialog.open('Edit', form);

		var dialog = $('.zDialog');
		if(self.model.nodeType === 10){ //部门-------
			var slcTeam = dialog.find('[name="name"]');
			var slcTeamType = dialog.find('[name="departmentType"]');

			self.config.teamData.map(function(model){
				slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
				if(model.type && slcTeamType.find('option:contains("' + model.type + '")').length === 0){
					slcTeamType.append('<option>' + model.type + '</option>');
				}
			});
			slcTeam.find('option[value="' + self.model.name + '"]').attr('selected', true);
			slcTeamType.find('option:contains("' + self.model.addOn.type + '")').attr('selected', true);
			slcTeamType.on('change', function(){
				slcTeam.html('');
				var slcVal = this.value;
				self.config.teamData.map(function(model){
					if(model.type == slcVal){
						slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
					}
				});
			})
		}

		if(self.model.nodeType !== 1 && self.model.nodeType !== 2){ //非一、二级节点-----
			oc.ui.autoComplete(dialog.find('[name="name"]'), self.allUserName);
		}
		else{
			var familyInfo = $('<p><span class="w100">Forbid Team:</span><input type="checkbox" name="forbidTeam" class="zToggleBtnSm"></p>' + 
							'<p class="mb10"><span class="w100">Allow Dup:</span><input type="checkbox" name="allowDup" class="zToggleBtnSm"></p>');
			dialog.find('.divPerson').prepend(familyInfo);
			dialog.find('[name="forbidTeam"]').prop('checked', self.model.forbidTeam === 1);
			dialog.find('[name="allowDup"]').prop('checked', self.model.allowDup === 1);

			oc.ui.toggleBtn('YES', 'NO');
		}

		dialog.on('click', '.btnSub', function(){
			var btn = $(this);

			if(!self.checkDialogName(dialog)){
				return false;
			}
			var addOn = null;
			if(self.model.nodeType === 21 || self.model.nodeType === 11){
				addOn = self.getUserByFullName(self.model.name);
				self.model.name = addOn.name;
			}
			else if(self.model.nodeType === 10){
				addOn = self.getTeamById(self.model.name);
			}

			btn.html('<i class="zLoadingIcon mr5"></i>').attr('disabled', true);
			if(self.model.nodeType === 1 || self.model.nodeType === 2){ //编辑family节点-------
				self.model.forbidTeam = $('[name="forbidTeam"]').prop('checked')? 1 : 0;
				self.model.allowDup = $('[name="allowDup"]').prop('checked')? 1 : 0;

				var putModel = {
					familyName: self.model.familyName,
					name: self.model.name,
					forbidTeam: self.model.forbidTeam,
					allowDup: self.model.allowDup
				}
				oc.ajax.put('/product/rest/v1/user_groups/family', putModel, function(res){
					oc.dialog.close();

					self.model.name = putModel.name;
					self.model.forbidTeam = putModel.forbidTeam;
					self.model.allowDup = putModel.allowDup;

					li.find('>p>.pName').html(self.model.name).data(self.model);
				}, function(res){
					oc.dialog.tips('Edit node fail:' + res.responseText);
					btn.removeAttr('disabled').html("Save");
				})

				return;
			}
			var putModel = $.extend(self.model, {});
			putModel.type && delete putModel.type;
			putModel.addOn && delete putModel.addOn;
			//编辑其他节点信息-------------------------
			self.updateNode(self.model, function(isOk, msg){
				if(isOk){
					oc.dialog.close();
					self.model.addOn = addOn;
					var pName = li.find('>p>.pName').html(addOn.fullName || addOn.name);
					if(addOn.img){
						pName.parent().addClass('pImg').append('<img src="' + img + '" />');
					}
					li.data(self.model);
				}
				else{
					btn.removeAttr('disabled').html("Save");
					oc.dialog.tips('Edit node fail:' + msg);
				}
			})
		})
		.on('click', '.jsAddTeam', function(e){
			e.preventDefault();
			self.showTeamPanel(function(teamModel){
				self.dialogEdit(li);
				$('.zDialogCover .slcDepartment').val(teamModel.id);
				$('.zDialogCover .departmentType').val(teamModel.type);
			});
		})
	}

	self.checkDialogName = function(dialog){
		var self = this;

		var eleName = dialog.find('[name="name"]:visible');
		self.model.name = $.trim(eleName.val());
		if(!self.model.name){
			oc.dialog.tips('Name is required');
			eleName.focus();
			return false;;
		}

		return true;
	}

	self.getUserByFullName = function(fullName){
		var finds = self.config.allUser.filter(function(user){
			return user.fullName == fullName;
		});

		if(finds.length > 0){
			return finds[0];
		}

		return null;
	}

	self.getTeamById = function(teamId){
		var finds = self.config.teamData.filter(function(team){
			return team.id == teamId;
		});

		if(finds.length > 0){
			return finds[0];
		}

		return null;
	}

	self.dialog = function(li){
		var form = '<div class="formOrganization">' + 
				'<a class="jsAddTeam" href="#">Add a team</a>' + 
				'<div class="p15"><p class="pType"><span>Type: </span><label class="mr30"><input type="radio" name="addType" value="person" checked style="margin-right:5px">人员</label><label><input name="addType" style="margin-right:5px" type="radio" value="group">团队</label></p>' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off"></p>' + 
				'<p class="mt10 divGroup none"><span>Name: </span><select class="slcDepartmentType form-control input-sm" name="departmentType" style="width:120px !important"></select><select class="slcDepartment form-control input-sm" name="name" style="width:280px !important"></select></p>' + 
				'<div class="dialogBottom"><button class="btn btn-primary w100 mr20 btnSub">Add</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		oc.dialog.open('Add', form);
		var dialog = $('.zDialog');
		var nodeData = li.data();
		self.model = {
			parentId: self.parentModel.id,
			familyName: self.parentModel.familyName
		};

		if(nodeData.nodeType == 2 || nodeData.nodeType == 21){ // 添加汇报关系中的个人节点---------------
			self.model.nodeType = 21;
			dialog.find('.pType, .divGroup, .jsAddTeam').remove();
		}

		if(!nodeData.nodeType){ //顶级节点----
			dialog.find('.pType, .jsAddTeam').remove();
			var familyInfo = '<p><span class="w100 mt10">Forbid Team:</span><input type="checkbox" name="forbidTeam" class="zToggleBtnSm"></p>' + 
							'<p><span class="w100 mt10 mb10">Allow Dup:</span><input type="checkbox" name="allowDup" class="zToggleBtnSm"></p>';
			dialog.find('.divPerson').prepend(familyInfo);
			oc.ui.toggleBtn('YES', 'NO');
		}
		else{
			oc.ui.autoComplete(dialog.find('.divPerson [name="name"]'), self.allUserName);
			var slcTeam = dialog.find('.divGroup [name="name"]');
			var slcTeamType = dialog.find('[name="departmentType"]');

			self.config.teamData.map(function(model){
				slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
				if(model.type && slcTeamType.find('option:contains("' + model.type + '")').length === 0){
					slcTeamType.append('<option>' + model.type + '</option>');
				}
			});

			slcTeamType.on('change', function(){
				slcTeam.html('');
				var slcVal = this.value;
				self.config.teamData.map(function(model){
					if(model.type == slcVal){
						slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
					}
				});
			})

			dialog.on('change', '[name="addType"]', function(){
				if(this.value === 'group'){
					$('.divGroup').show();
					$('.divPerson').hide();
				}
				else{
					$('.divPerson').show();
					$('.divGroup').hide();
				}
			})
		}
		
		dialog.on('click', '.btnSub', function(){
			var btn = $(this);

			if(!self.checkDialogName(dialog)){
				return false;
			}

			//添加一个family -----------
			if(!nodeData.nodeType){
				self.model = {
					name: self.model.name,
					forbidTeam: $('[name="forbidTeam"]').prop('checked')? 1 : 0,
					allowDup: $('[name="allowDup"]').prop('checked')? 1 : 0
				}
				oc.ajax.post('/product/rest/v1/user_groups/family', self.model, function(res){
					var ul = li.find('>ul');
					if(ul.length === 0){
						ul = $('<ul></ul>').appendTo(li);
					}
					var newLi = $('<li class="zTreeItem zTreeItemFolder"><p><span class="pName">' + self.model.name + '</span><span class="treeCountMember">0</span></p></li>');
					self.model.familyName = res;
					self.model.forbidTeam === 0? self.model.nodeType = 1 : self.model.nodeType = 2;

					newLi.data(self.model);
					newLi.appendTo(ul);
					oc.dialog.close();
					oc.dialog.tips('Add success.');
				})

				return;
			}

			//设置nodeType---------------
			if(self.model.nodeType !== 2 && self.model.nodeType !== 21){
				var checkedType = $('[name="addType"]:checked').val();
				if(checkedType == "person"){
					self.model.nodeType = 11;
				}
				else{
					self.model.nodeType = 10;
				}
			}
			else{
				self.model.nodeType = 21;
			}

			var addOn = null;
			if(self.model.nodeType === 21 || self.model.nodeType === 11){
				addOn = self.getUserByFullName(self.model.name);
				self.model.name = addOn.name;
			}
			else{
				addOn = self.getTeamById(self.model.name);
			}

			var btnText = btn.html();
			btn.html('<i class="zLoadingIcon mr5"></i>' + btnText + '...').attr('disabled', true);
			
			self.addNode(self.model, function(isOk, msg){
				if(isOk){
					oc.dialog.close();
					
					var ul = li.find('>ul');
					if(ul.length === 0){
						ul = $('<ul></ul>').appendTo(li);
					}
					self.model.id = msg;
					var newLi = $('<li class="zTreeItem" draggable="' + true + '" data-type="' + self.model.nodeType + '"><p><span class="pName">' + (addOn.fullName || addOn.name) + '</span></p></li>');
					if(self.model.nodeType == 10){
						newLi.addClass('zTreeItemFolder');
					}
					else if(self.model.nodeType == 21){
						newLi.addClass('zTreeItemReport');
						var eleCount = ul.parents('.zTreeItem:eq(0)').find('>p>.treeCount');
						var count = parseInt(eleCount.html())  || 0;
						eleCount.html(++count);
					}
					self.model.addOn = addOn;
					
					if(self.model.nodeType == 11 || self.model.nodeType == 21){
						var img = addOn.img;
						img && newLi.find('>p').addClass('pImg').append('<img src="' + img + '" />'); 
						var eleCount = ul.parents('.zTreeItem[data-type="1"], .zTreeItem[data-type="2"]').find('.treeCountMember');
						var count = parseInt(eleCount.html()) || 0;
						count++;
						eleCount.html(count);
					}
					newLi.data(self.model);

					newLi.appendTo(ul);
				}
				else{
					btn.removeAttr('disabled').html(btnText);
					oc.dialog.tips('Add node fail:' + msg);
				}
			})
		})
		.on('click', '.jsAddTeam', function(e){
			e.preventDefault();
			self.showTeamPanel(function(teamModel){
				self.dialog(li);
				$('.zDialog [name="addType"]').get(1).checked = true;
				$('.zDialog .divGroup').fadeIn();
				$('.zDialog .divPerson').fadeOut();
				$('.zDialogCover .slcDepartment').val(teamModel.id);
			});
		})
	}

	self.deleteNode = function(ele, cb){
		// $.get('/tree/delete/' + nodeId, cb);
		cb();
	}

	self.updateNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	self.addNode = function(model, cb){
		console.log(model);
		setTimeout(cb, 2000);
	}

	self.moveNode = function(sourceId, targetId, cb){
		setTimeout(function(){
			cb(true);
		}, 2000);
	}

	self.sortNode = function(sourceId, targetId, cb){
		setTimeout(function(){
			cb(true);
		}, 2000);
	}

	self.showTeamPanel = function(){

	}

	self.render();
}

module.exports = TreeOriganization;
},{}],25:[function(require,module,exports){

var TreePIS = function(options){
	this.config = {
		container: 'body',
		data: null,
		showLevel: 1
	};
	this.ele = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}
	
	var self = this;

	if(self.config.allUser){
		self.allUserName = [];
		self.config.allUser.map(function(model){
			self.allUserName.push(model.name);
		})
	}

	self.render = function(){
		self.ele = $('<ul class="zTree"></ul>');
		var li = $('<li class="zTreeItem"><p>' + self.config.data.name + '</p></li>').data(self.config.data);
		li.appendTo(self.ele);
		
		self._renderRecusive(self.config.data.items, li, 0);
		$(this.config.container).find('.zTree').remove();
		$(this.config.container).append(self.ele);

		self._bindEvents();
	}

	self.filter = function(keyword){
		self.removeFilterTag();
		if(!keyword){
            return;
        }
        keyword = keyword.toUpperCase();
        self.ele.find('.zTreeItem:gt(0)').removeClass('active').each(function(){
            var item = $(this);
            var name = item.find('>p').html().toUpperCase();
            if(name.indexOf(keyword) === 0){
                item.parents('.zTreeItem').addClass('active');
                item.addClass('treeSearch');
            }
        })
	}

	self.removeFilterTag = function(){
		self.ele.find('.treeSearch').removeClass('treeSearch');
	}

	self._renderRecusive = function(dataList, ele, level){
		if(!dataList){
			return;
		}
		var len = dataList.length;
		if(len > 0){
			ele.addClass('hasMore');
		}
		if(level < this.config.showLevel){
			ele.addClass('active');
		}
		var ul = $('<ul></ul>');
		
		for(var i = 0; i < len; i++){
			var one = dataList[i];
			var li = $('<li class="zTreeItem" draggable="true" data-level="' + one.level + '"><p>' + one.name + '</p></li>');
			if(one.description){
				li.addClass('zTreeItemDes').find('>p').attr('title', one.description);
			}
			li.appendTo(ul).data(one);
			if(one.items && one.items.length > 0){
				self._renderRecusive(one.items, li, level + 1);
			}
		}
		if(len > 0){
			ul.appendTo(ele);
		}
	}

	self._bindEvents = function(){
		self.ele.on('click', '.zTreeItem p', function(){
			var li = $(this).parent();
			li.toggleClass('active');
		})
		.on('mouseenter', '.zTreeItem p', function(){
			var p = $(this);
			$('<span class="zTreeControl"><i class="icon-plus2" title="Add"></i><i class="icon-cog" title="Setting"></i><i class="icon-align-justify" title="Show MN list"></i></span>').hide().appendTo(this).fadeIn(1000);
			if(p.hasClass('zTreeAdd')){
				p.find('.icon-align-justify').removeClass('icon-align-justify').addClass('icon-minus2');
			}
		})
		.on('mouseleave', '.zTreeItem p', function(){
			$(this).find('.zTreeControl').remove();
		})
		.on('click', '.icon-cog', function(e){
			e.stopPropagation();
			$('.treeRightContainer').removeClass('active');
			var p = $(this).parent().parent();
			var li = p.parent();
			var model = li.data();
			
			if(model.level < 4){
				p.addClass('zTreeEdit');
				p.html('<input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark" title="Save"></i>');
				p.find('[name="name"]').val(model.name);
				p.find('[name="description"]').val(model.description);
			}
			else{
				if(model.level === 4){
					$.get("/product/rest/v1/pis/categories/" + model.id + "/singularities", function(res){
						console.log(res);
						self.parentLi = null;
						self.currentLi = li;
						var rightContaner = $('#treeRightContainer').addClass('active');
						rightContaner.find('[name="name"]').val(model.name);
						rightContaner.find('[name="itemDescription"]').val(model.description);
						rightContaner.find('#aEditSubCategory').show();
						rightContaner.find('.trBtns').hide();

						rightContaner.find('[name="singularityName"]').each(function(i, ele){
							var nextIpt = $(ele).parent().next('td').find('input');
                            if(res.length <= i){
                            	ele.value = "";
                                ele.removeAttribute('data-id');
                                nextIpt.val("");
                            }else{
                            	var item = res[i];
                                ele.value = item.singularityName;
                                ele.setAttribute('data-id', item.id);
                                nextIpt.val(item.description);
                            }
						})

						rightContaner.find('.form-control').attr('disabled', true);
					})
				}
				else{
					var rightContaner = $('#treeRightContainer2').addClass('active');
				}
			}
		})
		.on('click', '.zTreeEdit input, .zTreeEdit i, .zTreeControl', function(e){
			e.stopPropagation();
		})
		.on('click', '.icon-checkmark', function(e){
			e.stopPropagation();
			var i = $(this);

			var li = i.parents('.zTreeItem:eq(0)');
			var model = li.data();
			if(!model || !model.id){
				model = {};
				var parentModel = li.parents('.zTreeItem:eq(0)').data()
				model.descendant = parentModel.id;
			}
			model.categoryName = li.find('[name="name"]').val();
			model.description = li.find('[name="description"]').val();
			if(!model.categoryName){
				oc.dialog.tips('Name is required');
				li.find('[name="name"]').focus();
				return;
			}
			
			i.removeClass('icon-checkmark').addClass('zLoadingIcon');
			li.removeClass('zTreeItemDes');
			
			var clearEditStatus = function(isOK){
				if(isOK === false){
					i.removeClass('zLoadingIcon').addClass('icon-checkmark');
					return;
				}
				li.parents('.zTreeItem').addClass('hasMore');
				if(!model.level){
					model.level = parseInt(parentModel.level) + 1;
				}
				model.name = model.categoryName;
				li.data(model).find('>p').html(model.categoryName).removeClass('zTreeEdit zTreeAdd');
				if(model.description){
					li.addClass('zTreeItemDes').find('p').attr('title', model.description);
				}
			}
			model.id? self.updateNode(model, clearEditStatus) : self.addNode(model, clearEditStatus)
			
		})
		.on('click', '.icon-plus2', function(e){
			e.stopPropagation();
			$('.treeRightContainer').removeClass('active');
			var li = $(this).parents('.zTreeItem:eq(0)').addClass('active');
			
			var data = li.data();
			if(data.level < 3){
				var ul = li.find('>ul');
				if(ul.length === 0){
					ul = $('<ul></ul>').appendTo(li);
				}
				var newLi = $('<li class="zTreeItem"></li>');
				newLi.append('<p class="zTreeEdit zTreeAdd"><input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="description"><i class="iconRight icon-checkmark" title="Save"></i></p>');
				newLi.appendTo(ul);
			}
			else{
				self.currentLi = null;
				self.parentLi = li;
				if(data.level === 3){
					var rightContaner = $('#treeRightContainer');
					rightContaner.addClass('active').find('input').removeAttr('disabled').val('');
					rightContaner.find('#aEditSubCategory').hide();
					rightContaner.find('.trBtns').show();
				}
			}
		});
		
		self.initRightForm();
	}

	self.initRightForm = function(){
		var addSubForm = $('#treeRightContainer form');
		addSubForm.submit(function(){
			var model = {
				category: {
					categoryName: $('[name="name"]').val(),
					description: $('[name="itemDescription"]').val()
				},
				singularities: []
			};

			addSubForm.find('[name="singularityName"]').each(function(){
				var nextIpt = $(this).parent().next('td').find('input');
				var one = {
					singularityName : this.value,
					description     : nextIpt.val(),
					singularityCode : model.singularities.length
				}

				if(!self.parentLi){
					one.id = this.getAttribute('data-id');
				}

				model.singularities.push(one);
			})


			var btn = addSubForm.find('button[type="submit"]').html('<i class="zLoadingIcon"></i>').attr('disabled', true);
			if(self.parentLi){ //add new
				model.category.descendant = self.parentLi.data().id;
				oc.ajax.post('/product/rest/v1/pis/categories/subcategory', model, function(res){
					btn.html('Save').removeAttr('disabled');
					oc.dialog.tips('Add success.');
					var nodeModel = {
						id: res,
						fid: model.category.descendant,
						name: model.category.categoryName,
						description: model.category.description
					}

					var ul = self.parentLi.find('ul:eq(0)');
					if(ul.length === 0){
						ul = $('<ul></ul>').appendTo(self.parentLi);
					}
					var newLi = $('<li class="zTreeItem zTreeItemDes"><p title="' + nodeModel.description + '">' + nodeModel.name + '</p></li>').appendTo(ul);
					newLi.data(nodeModel);
					self.parentLi.addClass('hasMore');
				}, function(res){
					oc.dialog.tips('Update failed:' + res.responseText);
					btn.html('Save').removeAttr('disabled');
				})
			}
			else{ //update
				oc.ajax.put('/product/rest/v1/pis/categories/subcategory/' + self.currentLi.data().id, model, function(res){
					btn.html('Save').removeAttr('disabled');
					oc.dialog.tips('Update success.');
					$('.treeRightContainer').removeClass('active').find('input').val('');
					var nodeModel = self.currentLi.data();
					nodeModel.name = model.category.categoryName;
					nodeModel.description = model.category.description;

					self.currentLi.find('>p').html(nodeModel.name).attr('title', nodeModel.description);
					self.currentLi.data(nodeModel);
				}, function(res){
					oc.dialog.tips('Update failed:' + res.responseText);
					btn.html('Save').removeAttr('disabled');
				})
			}
			
			return false;
		})
		
		var addSubForm2 = $('#treeRightContainer2 form');
		addSubForm2.submit(function(){
			var model = {};
			model.subCategoryId = addSubForm2.find('#categoryName').attr('data-id');
			model.segmentId = addSubForm2.find('select[name="sigment"]').val();
			model.segmentText = addSubForm2.find('select[name="sigment"]').find(':selected').text();
			
			model.singularityId = addSubForm2.find('select[name="singularity"]').val();
			model.singularityText = addSubForm2.find('select[name="singularity"]').find(':selected').attr('data-id');
			
			model.countryCodeId = addSubForm2.find('select[name="country"]').val();
			model.countryCodeText = addSubForm2.find('select[name="country"]').find(':selected').attr('data-code');
			
			model.colorCodeId = addSubForm2.find('select[name="color"]').val();
			model.colorCodeText = addSubForm2.find('select[name="color"]').find(':selected').attr('data-code');
			
			oc.ajax.post('/product/rest/v1/pis/structure', model, function(res){
				console.log(res);
				oc.dialog.tips('Add success, MN is:<b>' + res.text + '</b>', 3000);
				$('#treeRightContainer2').removeClass('active');
				window.open('/product/index.htm?mo=good&sku_add=' + res.text);
				// window.open('http://pre-launch.oceanwing.com/product/index.htm?mo=good&sku_add=A1109009');
			})

			return false;
		})
	}

	self.deleteNode = function(ele, cb){
		// $.get('/tree/delete/' + nodeId, cb);
		cb();
	}

	self.updateNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	self.addNode = function(model, cb){
		console.log(model);
		setTimeout(cb, 2000);
	}

	self.render();
}

module.exports = TreePIS;
},{}],26:[function(require,module,exports){
var TreeSelect = function(options){
	this.config = {
		container: 'body',
		dataList: null,
		iptClass: '',
		width: 'auto',
		height: 'auto',
		showAll: false,
		forbidPNode: false //禁止选中非末级几点
	};
	this.timerHandler = null;
	this.selectedItem = null;
	this.selectedList = null;
	this.ele = null;
	this.filterParams = {};
	this.valueChangeHanlder = null;
	
	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	var self = this;

	self._render = function(){
		self.ele = $('<div class="zTreeSelect"><input type="text" style="width:' + this.config.width + '"></div>');
		if(self.config.iptClass){
			self.ele.find('input').addClass(self.config.iptClass);
		}
		self._renderRecusive(self.config.dataList, self.ele, 0);
		
		self.ele.appendTo($(self.config.container));
		
		var top = self.ele.offset().top;
        var windowHeight = $(document).height();
        var maxHeight = windowHeight - top - 150;
        if(maxHeight < 150){
        	maxHeight = 150;
        }
        self.ele.find('>ul').css('max-height', maxHeight);
        
		self._bindEvents();

		if(self.config.showAll){
			self.ele.find('input').val('All');
		}
	};

	self._selectedP = function(p){
		if(p.length === 0){
			return;
		}
		var text = '';
		self.selectedItem = p.parent().data();
		self.selectedList = [];
		p.parents('.zTreeSelectItem').each(function(){
			var li = $(this);
			var item = li.data();
			self.selectedList.push(item);
			if(!text){
				text = item.name;
			}
			else{
				text = item.name + ' - ' + text;
			}
		});
		self.selectedList.reverse();
		self.ele.find('input').val(text).attr('data-id', self.selectedItem.id || '');
		self.ele.removeClass('active');
		if(p.html() === 'All'){
			self.ele.find('input').val('All');
		}
		
		self.valueChangeHanlder && self.valueChangeHanlder();
	};

	self._setActive = function(){
		var model = self.ele.find('.zTreeSelectItem.active').data();
		if(model && model.id){
			self.ele.find('.zTreeSelectItem:visible').each(function(i, ele){
				var ele = $(ele);
				if(ele.data().id == model.id){
					self.currentActive = i;
					return false;
				}
			});
		}
		else{
			self.currentActive = null;
		}
	};

	self._bindEvents = function(){
		self.ele.on('click', function(e){
			self.filterParams = {name: '', description: ''};
			e.stopPropagation();
			if(self.ele.hasClass('active') || self.ele.attr('disabled') == "disabled" || self.ele.find('input').attr('disabled') === "disabled"){
				return;
			}
			self.ele.addClass('active');
			self._setActive();
			self.filter();

			if(self.selectedItem){
				self.ele.find('.zTreeSelectItem').each(function(){
					var li = $(this);
					var model = li.data();
					if(model == self.selectedItem){
						li.addClass('active');
						self.ele.find('>ul').scrollTop(li.offset().top - 32);
					}
				});
			}
		})
		.on('click', 'p', function(e){
			e.stopPropagation();
			var p = $(this);
			if(self.config.forbidPNode && p.parent().find('ul>li').length > 0){
				return;
			}
			else{
				self._selectedP(p);
			}
		})
		.on('input', 'input', function(e){
			self.ele.find('.zTreeSelectItem.active').removeClass('active');
			self._clear();
			self.filterParams.name = this.value;
			self.filter();
		})
		.on('mouseenter', 'li.zTreeSelectItem p', function(){
			self.ele.find('.zTreeSelectItem.active').removeClass('active');
			$(this).parent().addClass('active');
			self._setActive();
		})
		.find('input').on('keyup', function(e){
			e.preventDefault();
			var code = e.keyCode;
			var activeLi = self.ele.find('.zTreeSelectItem.active');
			if(code === 13){
				var p = activeLi.find('>p');
				self._selectedP(p);
				return;
			}
			if(code !== 40 && code !== 38){
				return;
			}

			if(code === 40){
				if(activeLi.length == 0){
					self.currentActive = -1;
				}
				self.currentActive ++;
			}
			else{
				if(!self.currentActive){
					return;
				}
				self.currentActive --;
			}
			
			var target = self.ele.find('.zTreeSelectItem:visible:eq(' + self.currentActive + ')');
			if(target.length == 0) {
				return;
			}
			self.ele.find('.zTreeSelectItem.active').removeClass('active');
			target.addClass('active');
			
			var ul = self.ele.find('>ul');
			var height = ul.height();
			var offset = target.offset().top;
			var scrollTop = ul.scrollTop();
			if(code === 40){
				var scroll = offset - height;
				if(scroll > 0){
					ul.scrollTop(scroll + scrollTop);
				}
			}
			else{
				var scroll = offset - scrollTop;
				if(offset < 100){
					ul.scrollTop(scrollTop - 32);
				}
			}
		})
		.on('blur', function() {
			self.timerHandler && clearTimeout(self.timerHandler);

			self.timerHandler = setTimeout(function() {
				self.ele.removeClass('active');
				if(!self.selectedItem){
					self.filterParams.name = null;
					if(self.config.showAll){
						self.ele.find('input').val('All');
					}
					else{
						self.ele.find('input').val('');
					}
				}
			}, 200);
		});
	};

	self._clear = function(){
		self.selectedItem = null;
		self.selectedList = [];
	};
	
	self.setSelected = function(id){
		if(!id){
			self.selectedItem = null;
			self.selectedList = [];
			self.ele.find('input').val('');
			if(self.config.showAll){
				self.ele.find('input').val('All');
			}
			return;
		}
		var selectedLi = null;
		self.selectedList = [];
		var text = '';
		
		self.ele.find('li').each(function(){
			var ele = $(this);
			var model = ele.data();
			if(model && model.id && model.id == id){
				selectedLi = ele;
				self.selectedItem = ele.data();
				self.selectedList.push(self.selectedItem);
				text = model.name;
				return false;
			}
		});
		
		if(!selectedLi){
			return;
		}
		selectedLi.parents('.zTreeSelectItem').each(function(){
			var li = $(this);
			var item = li.data();
			self.selectedList.push(item);
			text = item.name + ' - ' + text;
		});

		self.selectedList.reverse();
		self.ele.find('input').val(text);

		if(self.config.showAll && text == ''){
			self.ele.find('input').val('All');
		}
		
		return self.selectedList;
	};

	//采取模糊匹配....
	self.filter = function(){
        self.ele.find('li.zTreeSelectItem').removeClass('hidden').show();
        if(!self.filterParams){
            return;
        }
        if(self.filterParams && self.filterParams.description){
            self.ele.find('li.zTreeSelectItem[data-level="1"]').addClass('hidden').each(function(){
                var li = $(this);
                var item = li.data();
                if(!item.description || item.description.indexOf(self.filterParams.description) !== -1){
                    li.removeClass('hidden');
                }
            })
        }
        if(self.filterParams.name){
            self.ele.find('li.zTreeSelectItem:visible').hide().each(function(){
                var li = $(this);
                var item = li.data();
                if(item.name && item.name.toUpperCase().indexOf(self.filterParams.name.toUpperCase()) > -1){
                    li.show();
                    li.find('li').show();
                    li.parents('li.zTreeSelectItem').show();
                }
            })
        }
    }

	self._renderRecusive = function(dataList, ele, level){
		if(!dataList){
			return;
		}
		var len = dataList.length;
		var ul = $('<ul></ul>');
		if(level === 0){
			ul.css('max-height', self.config.height);
			if(self.config.showAll){
				$('<li class="zTreeSelectItem" data-level="0"><p style="padding-left:10px">All</p></li>').appendTo(ul);
			}
		}
		for(var i = 0; i < len; i++){
			var one = dataList[i];
			var li = $('<li class="zTreeSelectItem" data-level="' + level + '"><p style="padding-left:' + (level * 20 + 10) + 'px">' + one.name + '</p></li>');
			li.appendTo(ul).data(one);
			if(one.items && one.items.length > 0){
				self._renderRecusive(one.items, li, level + 1);
			}
		}
		if(len > 0){
			ul.appendTo(ele);
		}
	}



	self._render();
}

module.exports = TreeSelect;
},{}],27:[function(require,module,exports){
var toolsDojo = require('./toolsDojo');
/**
* @file 基本的、单个UI元素
* @author Elvis
* @version 0.1 
*/

/**
* 基本的、单个UI元素
* @exports oc.ui
*/
var UI = {};

/**
* 开关Toggle button, 此方法会影响页面中所有.zToggleBtn, .zToggleBtnSm元素
* @param {string} on - 开关打开时显示的文字，默认值为“ON”
* @param {string} off - 开关关闭时显示的文字，默认值为“OFF”
**/
UI.toggleBtn = function(on, off){
    if(on === undefined){
        on = 'ON';
        off = 'OFF';
    }
    var self = this;
    $('.zToggleBtn, .zToggleBtnSm').each(function(){
        var ele = $(this);
        self.toggleOneBtn(ele, on, off);
    })
},

/**
* 开关Toggle button，此方法只影响传入的Jquery对象
* @param {object} btn - 需要设置的Jquery对象，为一个checkbox
* @param {string} on - 开关打开时显示的文字，默认值为“ON”
* @param {string} off - 开关关闭时显示的文字，默认值为“OFF”
**/
UI.toggleOneBtn = function(btn, on, off){
    var btnClass = 'zToggleBtn';
    btn.removeClass('zToggleBtn');
    if(btn.hasClass('zToggleBtnSm')){
        btn.removeClass('zToggleBtnSm');
        btnClass += ' zToggleBtnSm';
    }

    var isChecked = btn[0].checked;
    if(isChecked){
        btnClass += ' active';
    }
    var span = $('<span class="' + btnClass + '"><i class="zToggleBtnON">' + on + '</i><i class="zToggleBtnOFF">' + off + '</i>' +  btn[0].outerHTML + '</span>');
    btn.replaceWith(span);
    span.find('input').prop('checked', isChecked);

    span.off('change', 'input').on('change', 'input', function(){
        if(this.checked){
            $(this).parents('.zToggleBtn:eq(0)').addClass('active');
        }
        else{
            $(this).parents('.zToggleBtn:eq(0)').removeClass('active');
        }
    })
},

/**
* 根据输入信息自动补全的控件
* @param {object} ele - 作用的元素，为jquery对象或集合
* @param {object} array - 提示用的字符串数组
* @param {function} cb - 选择后的回调函数，会传入选择的值，与选择的li元素作为参数
* @param {boolean} prefix - 是否支持输入多个
* @example
* oc.ui.autoComplete('#ipt', ['A99999', 'A11111', 'B22222'], function(val, li){
    console.log(val);
}, true)
*/
UI.autoComplete = function(ele, array, cb, prefix, autoAddPrefix){
    ele = $(ele);
    ele.attr('autocomplete', 'off');
    if(typeof array === 'function'){
        cb = array;
        array = null;
    }
    ele.off('keyup').off('keydown').off('blur').data('cb', cb);
    ele.on('keydown', function(e){
        var ipt = $(this);
        var ul = ipt.next('ul.zAutoComplete');
        if(e.keyCode === 13 && ul.find('li.active').length > 0){
            event.preventDefault();
            return false;
        }
    })
    ele.on('keyup', function(e){
        var ipt = $(this);
        var cb = ipt.data('cb');
        
        var ul = ipt.next('ul.zAutoComplete');

        if(e.keyCode === 40){
            var focusLi = ul.find('li.active');
            if(focusLi.length === 0){
                ul.find('li:eq(0)').addClass('active');
            }
            else{
                var nextLi = focusLi.next('li');
                if(nextLi.length > 0){
                    nextLi.addClass('active');
                    focusLi.removeClass('active');
                }
            }

            return;
        }
        if(e.keyCode === 38){
            var focusLi = ul.find('li.active');
            if(focusLi.length === 0){
                return;
            }
            
            var prevLi = focusLi.prev('li');
            if(prevLi.length > 0){
                prevLi.addClass('active');
                focusLi.removeClass('active');
            }

            return;
        }

        if(e.keyCode === 13){
            var focusLi = ul.find('li.active');
            if(focusLi.length > 0){
                var slcVal = focusLi.html();
                var text = ipt.val();
                if(prefix){
                    var mathedArray = text.match(/(.|,|\s)*(;|,|\s)/);
                    text = '';
                    if(mathedArray && mathedArray.length > 0){
                        text = mathedArray[0];
                    }
                    var value = text + slcVal;
                    if(autoAddPrefix === true) {
                        value += (typeof prefix === 'string'? prefix : ',');
                    }
                    ipt.val(value);
                }
                else{
                    ipt.val(slcVal);
                }
                ipt.change();
                
                ul.remove();
                cb && cb(slcVal, ipt);
            }
            return;
        }
        
        var source = array;
        if(!array){
            var sourceString = ipt.attr('data-source');
            if(sourceString){
                source = eval(sourceString);
            }
            else{
                source = ipt.data('source');
            }
        }
        if(!source){
            return;
        }
        
        $('.zAutoComplete').remove();
        var val = $.trim(this.value);
        if(prefix){
            val = val.replace(/.*;|.*,|.*\s/g, '');
        }
        if(!val){

            return;
        }
        var matchedArray = source.filter(function(item){
            return item.toUpperCase().indexOf(val.toUpperCase()) > -1;
        });
        
        var len = matchedArray.length;
        if(len === 0) {

            return;
        }

        if(len > 8){
            len = 8;
        }

        var ul = $('<ul class="zAutoComplete"></ul>');
        for(var i = 0; i < len; i++){
            ul.append('<li tabindex="0">' + matchedArray[i] + '</li>');
        }
        var top = ipt.position().top + ipt.outerHeight();
        var left = ipt.position().left;
        ul.css({top: top, left: left}).on('click', 'li', function(){
            var slc = $(this).html();
            var text = ipt.val();
            if(prefix){
                var mathedArray = text.match(/(.|,|\s)*(;|,|\s)/);
                text = '';
                if(mathedArray && mathedArray.length > 0){
                    text = mathedArray[0];
                }
                var value = text + slc;
                if(autoAddPrefix === true) {
                    value += (typeof prefix === 'string'? prefix : ',');
                }
                ipt.val(value);
            }
            else{
                ipt.val(slc);
            }
            $('.zAutoComplete').remove();
            ipt.change();
            cb && cb(slc, ipt);
        })
        .on('mouseenter', 'li', function(){
            ul.find('.active').removeClass('active');
            $(this).addClass('active');
        })
        
        ipt.after(ul);

    }).on('blur', function(){
        setTimeout(function(){
            $('.zAutoComplete').remove();
        }, 200);
    });
}

/**
* Checkbox控件
*/
UI.cbx = function(){
    $('.zCbx').off('change', 'input').on('change', 'input', function(){
        if(this.checked){
            $(this).parent().addClass('active');
        }
        else{
            $(this).parent().removeClass('active');
        }
    });
    return {
        check: function(ele){
            if(!ele.hasClass('zCbx')){
                if(ele.find('input:checkbox').length === 0){
                    return console.warn("zCkb does not contain a input:checkbox item");
                }
                ele.addClass('active').find('input:checkbox')[0].checked = true;
            }
        },
        unCheck: function(ele){
            if(ele.hasClass('zCbx')){
                if(ele.find('input:checkbox').length === 0){
                    return console.warn("zCkb does not contain a input:checkbox item");
                }
                ele.removeClass('active').find('input:checkbox')[0].checked = false;
            }
        }
    };
};


/**
* 将select变成多选框
* @param {function} cb - 点击确定之后的回调函数
*/
UI.multiSelect = function(cb){
    $("select.zMultiSelect").each(function(){
        var ele = $(this);
        var width = ele.outerWidth();
        var height = ele.outerHeight() + 'px';
        var name = ele.attr('name');
        if(name === undefined){
            name = '';
        }
        var zEle = $('<div class="zMultiSelect"><div class="zMultiSelectText"></div><div class="zMultiSelectMain"><ul></ul></div></div>');
        zEle.css('width', width);
        zEle.find('.zMultiSelectText').css({'height': height, 'line-height': height}).html(ele.attr('data-slc'));
        
        var lis = '';
        ele.find('option').each(function(i, item){
            lis += '<li><label class="zCbx"><input type="checkbox", name="' + name + '" value="' + item.value + '">' + item.innerHTML + '</label></li>';
        });
        lis += '<li><button class="btnPrimary btnXs" type="button">Confirm</button></li>';
        zEle.find('ul').html(lis);

        ele.replaceWith(zEle);
    });


    UI.cbx();
    var bindEvent = function(){
        var selectDiv = $(".zMultiSelect");
        // selectDiv.off('click', 'button').off('click', '.zMultiSelectText');
        
        selectDiv.on('click', '.zMultiSelectText', function(){
            var select  = $(this).parents('.zMultiSelect:eq(0)');
            if(!select.hasClass('active')){
                select.addClass('active').find('.zMultiSelectMain').show();
                var text = this.innerHTML;
                var textArr = text.split(';');
                select.find('.zCbx').removeClass('active').find('input:checkbox').attr('checked', false);
                for(var i in textArr){
                    var val = textArr[i];
                    var cbx = select.find('input:checkbox[value="' + val + '"]');
                    if(cbx.length > 0) {
                        cbx[0].checked = true;
                        cbx.parent().addClass('active');
                    }
                }
            }
            else{
                select.removeClass('active').find('.zMultiSelectMain').hide();
            }
        }).on('click', 'button', function(e){
            var select  = $(this).parents('.zMultiSelect:eq(0)');
            var main = $(this).parents('.zMultiSelectMain:eq(0)');
            var values = '';
            main.find('input:checked').each(function(){
                values += this.value + ';';
            });
            if(values){
                values = values.slice(0, -1);
            }
            select.removeClass('active').find('.zMultiSelectText').html(values);
            main.hide();
            e.stopPropagation();
            
            cb && cb(select);
        }).click(function(e){
            e.stopPropagation();
        });

        $('html').click(function(){
            selectDiv.removeClass('active').find('.zMultiSelectMain').hide();
        });
    } ;
    bindEvent();
}

/**
* PopOver提示框，支持上下左右自定义
* @param {object} btn - 作用对象，一般为btn，Jquery或者Jquery选择器
* @param {string} title - 标题
* @param {string} content - 内容
* @param {string} popPosition - 位置，默认为right，可选值为：right、left、top、bottom
*/
UI.popOver = function(btn, title, content, popPosition){
    btn = $(btn);
    
    if(btn.next('.zPopOver').length > 0){
        btn.next('.zPopOver').remove();
        return;
    }

    var ele = $('<div class="zPopOver zPopOver' + popPosition + '"></div>');
    ele.append('<div class="zPopOverTitle">' + title + '<i class="icon-close"></i></div>');
    ele.append('<div class="zPopOverContent">' + content + '</div>');
    btn = $(btn);
    var position = btn.position();
    btn.after(ele);

    //右边
    var left = position.left + btn.outerWidth() + 20;
    var top = position.top + btn.outerHeight() / 2 - ele.outerHeight() / 2 - 5;

    //左边
    if(popPosition === 'left'){
        left = position.left - ele.outerWidth() - 20;
    }
    else if(popPosition === 'top'){
        left = position.left - ele.outerWidth() / 2 + btn.outerWidth() / 2;
        top = position.top - ele.outerHeight() - 20;
    }
    else if(popPosition === 'bottom'){
        left = position.left - ele.outerWidth() / 2 + btn.outerWidth() / 2;
        top = position.top + btn.outerHeight() + 20;
    }

    ele.css({
        left: left,
        top: top
    })
    ele.on('click', '.zPopOverTitle i.icon-close', function(){
        ele.remove();
    })
}

/**
* 关闭PopOver提示框
* @param {object} btn - 作用对象或者popOver本身
*/
UI.popOverRemove = function(btn){
    var btn = $(btn);
    if(btn.hasClass('.zPopOver')){
        btn.remove();
    }
    else{
        btn.next('.zPopOver').remove();
    }
}

UI.slide = function(width, showFullScreen) {
    var slideId = 'fixRight' + new Date().getTime();
    var fixRight = $('<div id="' + slideId + '" class="zFixRight"><div class="fixRightHd"><i class="icon-arrow-right fixRightClose"></i><i class="icon-fullscreen fixRightFullScreen"></i></div><div class="fixRightBd"></div></div>');
    fixRight.appendTo(document.body);
    if(showFullScreen) {
        fixRight.find('.fixRightFullScreen').css('display', 'block');
    }
    setTimeout(function() {
        if(!width) {
            fixRight.addClass('active');   
        }
        else {
            fixRight.prepend('<style>#' + slideId + '.zFixRight.active{width: ' + width + 'px;}</style>');
            fixRight.addClass('active');
        }
    }, 50)
    
    fixRight.on('click', '.fixRightClose', function(e) {
        fixRight.removeClass('active');
        if(fixRight.data('target')) {
            $(fixRight.data('target')).find('tr.success').removeClass('success');
        }
        setTimeout(function() {
            fixRight.onClose && fixRight.onClose();
            if(fixRight.data('target')) {
                $(fixRight.data('target')).find('tr.success').removeClass('success');
            }
            toolsDojo.destroyByNode(fixRight.find('.fixRightBd')[0]);
            fixRight.remove();
        }, 300);
    })
    .on('click', '.fixRightFullScreen', function(e) {
        var wrapEle = document.getElementById('ocOutWrap') || document.body;
        var width = wrapEle.clientWidth;
        if(parseInt(fixRight.css('width')) == width) {
            fixRight.css('width', '');
        }
        else {
            fixRight.css('width', width + 'px');
        }
    })

    return fixRight;
}

UI.destroySlide = function (ele) {
    if(!ele) {
        ele = $('.zFixRight');
    }

    ele.each(function() {
        var one = $(this);
        one.removeClass('active');
        if(one.data('target')) {
            $(one.data('target')).find('tr.success').removeClass('success');
        }
        toolsDojo.destroyByNode(one.find('.fixRightBd')[0]);
        one.find('.fixRightBd').html('');
        setTimeout(function() {
            one.onClose && one.onClose();
            one.remove();
        }, 300)
    })
}

UI.loading = function(ele, remove) {
    if(!remove) {
        $(ele).addClass('zLoadingCover');
    }
    else {
        $(ele).removeClass('zLoadingCover');
    }
}

UI.export = function(href, time) {
    if(!href) {
        return;
    }
    // window.open(href, '', 'width=1, height=1,toolbar=0,titlebar=0,menubar=0');
    window.open(href);
    // var iframe = $('<iframe src="' + href + '" style="display: none;"></iframe>').appendTo(document.body);
    // setTimeout(function() {
    //     iframe.remove();
    // }, time || 180000);
}

module.exports = UI;
},{"./toolsDojo":18}],28:[function(require,module,exports){
/** 
* @file 基于FormData和FileReader的文件预览、上传组件 
* @author <a href="http://www.tinyp2p.com">Elvis Xiao</a> 
* @version 0.1 
*/ 


/**
* 基于FormData和FileReader的文件预览、上传组件
* @class Uploader
* @constructor
* @param {object} options 配置变量对象：<br /> 
	container：容器对象，默认为document.body<br />
	maxSize：单次最大允许添加的文件数量，默认为10<br />
	uploadAction：接收文件的接口地址（post方法） <br />
	postParams：其他需要与文件一起post过去的数据 <br />
	oneFileLimit：单个文件限制大小，默认为10M <br />
	callback：单次所有文件上传完成后的执行的回调接口 <br />
	uploadOneCallback：单个文件上传完成后的执行的回调接口 <br />
* @example
* var uploader = new oc.Uploader({
        container: '.fileContainer',
        postParams: {
            savePath: 'upload'
        },
        callback: function(files){
            console.log('all file uploaded:', files);
        },
        uploadOneCallback: function(file){
            console.log('uploaded one file:', file);
        },
        blobSize: 100
    })

    uploader.files = [{
        name: 'test.jpg',
        status: uploader.STATUS.success
    },
    {
        name: 'test2.jpg',
        status: uploader.STATUS.success
    }]
    uploader.deleteFile = function(file){
        console.log(file);
    }
    uploader.reloadList();
*/
var Uploader = function(options) {
	/** @memberof ImageCrop */

	var self = this;

	this.config = {
		container: 'body',
		auto: false,
		maxSize: 10,
		uploadAction: '/upload',
		postParams: {},
		oneFileLimit: 10 * 1024 * 1024,
		callback: null,
		uploadOneCallback: null,
		checkFileCallback: null //限制类型或者检测文件是否可用的回调--------
	};

	/** @property {function} deleteFile 对于已经上传完成的文件提供删除接口，如提供了，则文件可以被删除 */
	this.deleteFile = null;

	/** @property {function} STATUS 文件状态枚举值 */
	this.STATUS = {
		waiting: 0,
		process: 1,
		success: 2,
		failed: 3
	};

	/** @property {object} files 当前在显示的文件集合 */
	this.files = [];

	/** @property {object} ele 最外层的jquery对象 */
	this.ele = null;

	/** @property {string} msg 标记文件的错误信息 */
	this.msg = '';

	/** @property {number} queueSize 当前还未上传的文件总大小 */
	this.queueSize = 0;

	/** @property {number} uploadedSize 当前已经上传的文件总大小 */
	this.uploadedSize = 0;

	/** @property {object} slice Blob对象，暂未使用，留作以后分段上传 */
	this.slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	/** 
	* 更新统计信息
    * @method _renderFoot 
    * @return {object} div - jquery对象
    * @memberof FileView 
    * @instance 
    */
	self._renderFoot = function(){
		var div = $('<div class="zUploaderFoot"></div>');
		div.append('<p class="zUploaderStatic">选中0个文件，共0K</p>');
		div.append('<span class="zUploaderControl"><span class="zUploaderFileBtn"><input type="file" multiple="multiple" />' + 
			'<span class="zUploaderBtnText">继续添加</span></span><button class="zUploaderBtn" type="button">开始上传</button></span>');

		if(self.config.auto) {
			div.find('.zUploaderBtn').remove();
		}
		return div;
	}

	/** 
	* 当没有文件时，界面显示为请选择或拖拽文件
    * @method _renderNoFile 
    * @return {object} div - jquery对象
    * @memberof FileView 
    * @instance 
    */
	self._renderNoFile = function(){
	    var div = $('<div class="zUploaderNoFile"></div>');
	    div.append('<div class="icon"><i class="icon-images"></i></div>');
	    div.append('<span class="zUploaderFileBtn "><input type="file" multiple="multiple" /><span class="zUploaderBtnText">点击选择文件</span></div>');
	    div.append('<p>或将文件拖到这里，单次最多可上传文件' + self.config.maxSize + '个</p>');

	    return div;
	}

	/** 
	* 生成整个Uploader结构
    * @method _render 
    * @memberof FileView 
    * @instance 
    */
	self._render = function(){
		self.ele = $('<div class="zUploader"></div>');
		var uploadList = $('<div class="zUploaderList"></div>');
		uploadList.append(self._renderNoFile());
		var foot = self._renderFoot().hide();
		self.ele.append(uploadList);
		self.ele.append(foot);
		self.ele.appendTo(self.config.container);
	}

	/** 
	* 根据当前文件，重新生成整个Uploader结构
    * @method reloadList 
    * @memberof FileView 
    * @instance 
    */
	self.reloadList = function(){
		self.ele.find('.zUploaderItem').remove();
		var len = self.files.length;
		
		if(len === 0){
			self.ele.find('.zUploaderNoFile').show();
			self.ele.find('.zUploaderFoot').hide();
			return;
		}

		self.ele.find('.zUploaderNoFile').hide();
		self.ele.find('.zUploaderFoot').show();
		var zUploaderList = self.ele.find('.zUploaderList');
		var size = 0;
		var waitingCount = 0;
		for(var i = 0; i < len; i++){
			var file = self.files[i];
			if(file.status == self.STATUS.waiting){
				size += file.size;
				waitingCount ++;
			}
			var zUploaderItem = self._renderOneFile(file);
			file.target = zUploaderItem;
			zUploaderList.append(zUploaderItem);
		}
		
		if(self.files.length < self.config.maxSize) {
			self.ele.find('.zUploaderFoot .zUploaderFileBtn').show();
		}
		self.ele.find('.zUploaderStatic').html('选中' + waitingCount + '个文件，共' + (size / 1000.0).toFixed(2) + 'K');
	}

	//清除所有文件---
	self.clear = function() {
		self.files = [];
		self.reloadList();
	}

	/** 
	* 选择文件后，添加到files中，并重新绘制
    * @method _pushFiles 
    * @param {objec} files - 被添加的文件集合
    * @memberof FileView 
    * @instance 
    */
	self._pushFiles = function(files){
		for(var i = 0; i < files.length; i++){
			var file = files[i];
			var finds = self.files.filter(function(oneFile) {
				return oneFile.name == file.name && oneFile.lastModified == file.lastModified && oneFile.size == file.size;
			})
			if(finds.length > 0){
				oc.dialog.tips(file.name + '文件已经存在');
				continue; 
			}
			if(file.size > self.config.oneFileLimit) {
				oc.dialog.tips('文件' + file.name + '超出了最大限制（' + parseInt(self.config.oneFileLimit / 1024) + 'K)');
				continue; 
			}
			
			if(self.files.length === self.config.maxSize){
				alert('超出了最大文件数量');
				return false;
			}

			if(self.files.length >= self.config.maxSize - 1) {
				self.ele.find('.zUploaderFoot .zUploaderFileBtn').hide();
			}

			if(!self.config.checkFileCallback || self.config.checkFileCallback(file)) {
				files[i].status = self.STATUS.waiting;
				self.files.push(files[i]);
			}
		}
		self.reloadList();

		//自动上传
		if(self.config.auto) {
			self._upload();	
		}
	}

	/** 
	* 删除文件，未上传的直接删除，已经上传的取决与deleteFile方法是否设置
    * @method _deleteFile 
    * @param {number} index - 需要删除的文件位置
    * @memberof FileView 
    * @instance 
    */
	self._deleteFile = function(index){
		if(self.files[index].status === self.STATUS.process){
			return alert('该文件当前不允许删除');
		}
		var file = self.files[index];
		if(file.status === self.STATUS.success){
			self.deleteFile && self.deleteFile(file, function(){
				self.files.splice(index, 1);
				self.reloadList();
			});
		}
		else{
			self.files.splice(index, 1);
			self.reloadList();
		}
	}

	/** 
	* 内部事件绑定
    * @method _bindEvent 
    * @memberof FileView 
    * @instance 
    */
	self._bindEvent = function(){
		self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
			self._pushFiles(this.files);
			$(this).replaceWith(this.outerHTML);
		}).on('click', '.zUploaderBtn', self._upload).on('click', '.zUploaderItemHd i', function(){
			var fileItem = $(this).parents('.zUploaderItem');
			var index = fileItem.index();
			self._deleteFile(index - 1);
		}).on('click', '.zUploaderReset', function(e){
			self.files.map(function(model){
				model.status = self.STATUS.waiting;
				model.msg = '';
				model.target.find('.zUploaderMsg').removeClass('error').html('');
				e.preventDefault();
			})
		})

		self.ele[0].addEventListener("drop", function(e){
			e.preventDefault();
			self._pushFiles(e.dataTransfer.files);
		})

		$(document).on({
	        dragleave:function(e){
	            e.preventDefault();
	        },
	        drop:function(e){
	            e.preventDefault();
	        },
	        dragenter:function(e){
	            e.preventDefault();
	        },
	        dragover:function(e){
	            e.preventDefault();
	        }
	    });
	}

	/** 
	* 生成单个文件的HTML结构
    * @method _renderOneFile 
    * @param {object} file - 文件对象
    * @return {object} item - Juery 对象
    * @memberof FileView 
    * @instance 
    */
	self._renderOneFile = function(file){
		var item = $('<div class="zUploaderItem"></div>');
		item.append('<div class="icon"><i class="icon-images"></i></div>');
		item.append('<p class="zUploaderMsg"></p>');
		item.append('<div class="zUploaderItemHd"><i class="icon-cross"></i></div>');
		var fileName = file.name;
		if(fileName.length > 25){
			fileName = fileName.slice(0, 20) + ' ...';
		}
		item.append('<p class="zUploaderName">'+ fileName + '</p>');
		if (file.status === self.STATUS.success){
			item.find('.zUploaderMsg').addClass('ok').html('upload success');
			if(!self.deleteFile){
				item.find('.zUploaderItemHd').remove();
			}
		}
		else if (file.status === self.STATUS.failed){
			item.find('.zUploaderMsg').addClass('error').html('upload failed').attr('title', file.msg);
		}

		//图片文件，支持预览功能---------------------
		if(/image\/\w+/.test(file.type)){
			var reader = new FileReader();
			reader.onload = function(){
				var result = reader.result;
				item.find('.icon i').replaceWith('<img src="' + result + '" />');
			}
			reader.readAsDataURL(file);
		}
		return item;
	}

	/** 
	* 设置文件的状态和错误信息
    * @method setStatus 
    * @param {object} file - 文件对象
    * @param {number} status - 状态枚举
    * @param {string} msg - 错误信息
    * @memberof FileView 
    * @instance 
    */
	self.setStatus = function(file, status, msg){
		file.status = status;
		if(status === self.STATUS.success){
			file.target.find('.zUploaderMsg').addClass('ok').html('upload success');
			if(!self.deleteFile) {
	    		file.target.find('.zUploaderItemHd').remove();
			}
	    	file.status = self.STATUS.success;
		}
		else if(status === self.STATUS.failed){
			// console.error('file "' + file.name + '" 失败:' + msg);
			file.target.find('.zUploaderMsg').addClass('error').html('upload failed').attr('title', msg);
		    file.status = 'failed';
		}
	}

	/** 
	* 上传单个文件
    * @method _uploadOneFile 
    * @param {object} file - 文件对象
    * @param {function} cb - 上传完成后的回调方法
    * @memberof FileView 
    * @instance 
    */
	self._uploadOneFile = function(file, cb){
		self.setStatus(file, self.STATUS.process);

		if(window.FormData && window.XMLHttpRequest){
			self._sendFileByFormData(file, cb);
			return;
		}

		// console.log('Not support window.FormData');
		// var fileName = new Date().getTime() + '_' + file.name;

		// var reader = new FileReader();
		// reader.onerror = function(err){
		// 	self._process(file.size);
	 //        self.setStatus(file, self.STATUS.failed, '文件读取失败:' + err);
	 //        cb();
	 //    }
	 //    reader.onload = function(){
		// 	var params = self.config.postParams;
		// 	params.fileName = fileName;
		// 	var fileData = reader.result;
			
		// 	var sendPice = function(){
		// 		params.fileData = fileData.slice(0, self.config.blobSize);
		// 		fileData = fileData.slice(self.config.blobSize);
		// 		if(params.fileData.length === 0){
		// 			self.setStatus(file, self.STATUS.success);
		// 			cb();
		// 	    	return;
		// 		}
		// 		self._process(params.fileData.length);
		// 		$.ajax({
		//     		type: "post",
		//     		url: self.config.uploadAction,
		//     		data: params,
		//     		success: function(){
		//     			self._process(params.fileData.length);
		//     			sendPice();
		//     		},
		//     		error: function(res){
		//     			self._process(file.size - fileData.length);
		//     			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
		//     			cb();
		//     		}
		//     	})
		// 	}
		// 	sendPice();
	 //    }
	 //    reader.readAsBinaryString(file);
	}

	/** 
	* 使用FormData的方式Post文件到服务器
    * @method _sendFileByFormData 
    * @param {object} file - 文件对象
    * @param {function} cb - 上传完成后的回调方法
    * @memberof FileView 
    * @instance 
    */
	self._sendFileByFormData = function(file, cb){
	    var xhr = new XMLHttpRequest();
	    if(file.size === 0) {
	    	self.setStatus(file, self.STATUS.failed, '文件大小为0');
	    	cb();
	    	return;
	    }

	    xhr.open('POST', self.config.uploadAction, true);
		var data = new FormData();
		data.append('file', file);
		xhr.upload.onload = function (e){
			console.log('onload', e.loaded);
		}
		xhr.upload.onprogress = function(e){
			console.log('process');
			self._process(e.loaded * file.size / e.total, true);
		}
		xhr.upload.onerror = function(err){
			self._process(file.size);	
			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
			cb();
		}
		xhr.onreadystatechange = function(){
			console.log('status change');
			if(xhr.readyState == 3) {
				console.log(xhr);
			}
			if(xhr.readyState == 4 && xhr.status !== 200) {
				self._process(0);	
				self.setStatus(file, self.STATUS.failed, '文件传输中断:' + xhr.statusText);
				cb();

				return;
			}
			if(xhr.readyState == 4 && xhr.status == 200){  
				self._process(file.size);  
				try {
					file.response = JSON.parse(xhr.response);
					if(file.response.flag === true){
						self.setStatus(file, self.STATUS.success);	
					}
					else{
						self.setStatus(file, self.STATUS.failed);	
					}
				}
				catch(err) {
					console.log('uploader未知错误', err);
					self.setStatus(file, self.STATUS.failed);	
				}

				cb();
		    }
		}
		xhr.send(data);
	}

	/** 
	* 文件上传过程中，更新统计信息
    * @method _process 
    * @param {number} addSize - 本次发送的文件块大小
    * @param {boolean} isNotAppend - 文件大小是否追加到uploadedSize中
    * @memberof FileView 
    * @instance 
    */
	self._process = function(addSize, isNotAppend){
		var eleStatic = self.ele.find('.zUploaderStatic');
		var eleProcess = eleStatic.find('.zUploaderProcess');
		if(eleProcess.length === 0){
			eleStatic.html('');
			eleProcess = $('<span class="zUploaderProcess"><span class="zUploaderProcessInner"></span></span>').appendTo(eleStatic);
			eleProcesText = $('<span class="zUploaderProcessText"></span>').appendTo(eleStatic);
		}
		var currentSize = self.uploadedSize + addSize;
		var maxSize = self.queueSize * 0.9;
		if(currentSize > maxSize) {
			currentSize = maxSize;
		}
		if(addSize !== 0){
			var width = 0;
			if(self.queueSize !== 0) {
				width = currentSize * 100 / self.queueSize;
			}
			// if(width > 90) {
			// 	width = 90;
			// }
			eleProcess.attr('data-count', currentSize).find('.zUploaderProcessInner').css('width', width + '%');
		}
		eleStatic.find('.zUploaderProcessText').html('( ' + (currentSize / 1000).toFixed(2) + ' KB / ' + (self.queueSize / 1000).toFixed(2)  + ' KB )');
		if(isNotAppend !== true){
			self.uploadedSize += addSize;
		}
	}

	/** 
	* 执行文件上传操作，采用回调方式，一个一个上传
    * @method _upload 
    * @memberof FileView 
    * @instance 
    */
	self._upload = function(){
		var processList = self.files.filter(function(model){
			return model.status === self.STATUS.process;
		});
		if(processList.length > 0){
			return alert('有文件正在上传，请稍后...');
		}

		self.queueSize = 0;
		self.uploadedSize = 0;
		var queueList = self.files.filter(function(model){
			if(model.status === self.STATUS.waiting){
				self.queueSize += model.size;
				return true;
			}
			
			return false;
		});

		// if(self.queueSize > 10000000){
		// 	self.config.blobSize = 4000000;
		// }
		if(self.config.auto) {
			self.ele.find('.zUploaderFileBtn').hide();
		}
		self._process(0);
		var i = 0;
		var uploadQueue = function(){
			if(i === queueList.length){
				self.ele.find('.zUploaderFileBtn').show();
				self._setFootStatics();
				self.config.callback && self.config.callback(self.files);
				return;
			}
			
			self._uploadOneFile(queueList[i], function(){
				self.config.uploadOneCallback && self.config.uploadOneCallback(queueList[i]);
				uploadQueue(i++);
			});
		}
		uploadQueue();
	}

	/** 
	* 上传后生成统计信息
    * @method _setFootStatics 
    * @memberof FileView 
    * @instance 
    */
	self._setFootStatics = function(){
		var successList = self.files.filter(function(model){
			return model.status == self.STATUS.success;
		});
		var successCount = successList.length;
		var failedCount = self.files.length - successCount;
		var text = '已成功上传' + successCount + '个文件';
		if(failedCount > 0){
			text += '，' + failedCount + '个文件上传失败，<a class="zUploaderReset" href="#">重置失败文件？</a>';
		}
		self.ele.find('.zUploaderStatic').html(text);
	}

	self._render();
	self._bindEvent();
}

module.exports = Uploader;
},{}]},{},[11]);
