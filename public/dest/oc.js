(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Ajax = {}

Ajax._send = function(url, method, data, cbOk, cbError){
    var self = this;
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
        params.data = JSON.stringify(data);
    }

    params.success = function(res){
        cbOk(res);
    }
    if(cbError){
        params.error = function(res){
            cbError(res);
        }
        // $.ajax(params, cbOk, cbError).done(cbOK).fail(cbError);
    }
    else{
        params.error = self.error;
        // $.ajax(params, cbOk, cbError).done(cbOk).fail(self.error);
    }

    $.ajax(params);
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


},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
var ZDate = {};

//format: 年 - yy/yyyy，月 - mm，天 - dd, 小时：hh，分钟 - MM，秒 - s, 分秒 - ms
ZDate.format = function(date, format){
	if(date.toString().indexOf('-') > 0){
        date = date.toString().replace(/-/g, '/');
    }

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
        return model.year + '-' + model.month + '-' + model.date;
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

//date format: yyyy-MM-dd
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


module.exports = ZDate;
},{}],4:[function(require,module,exports){
var Dialog = {};

Dialog.removeMadal = function(){
    this.removeAllTips();
    this.close();
},

Dialog.removeAllTips = function(){
    $(".zLoading, .tips").remove();
},

Dialog.tips = function(msg, time, cb){
    if(time === undefined){
        time = 1500;
    }
    if(typeof time === 'function'){
        cb = time;
        time = 1000;
    }
    var tips = $('<div class="tips">' + msg + '</div>');
    tips.appendTo('body');
    var width = tips.width();
    tips.css('margin-left', -width / 2 + 'px');
    setTimeout(function(){
        tips.remove();
        cb && cb();
    }, time);
}

Dialog.loading = function(msg){
    this.removeMadal();
    var loading = $('<div class="zLoading"></div><div class="tips">' + msg + '</div>');
    loading.appendTo('body');
    var width = $(".tips").width();
    loading.css('margin-left', -width / 2 + 'px');

    return loading;
}

Dialog.confirm = function(msg, cbOK, cbNO, required){
    var confirm = $('<div class="zLoading"></div><div class="tips confirm" style="min-width: 500px;">' + msg + '<div style="border-top: 1px dashed #ddd;" class="tc mt20 pt10"><button class="btn btn-info btn-sm btnOK mr20 w80">OK</button><button class="btn btn-default btn-sm btnCancel w80" style="margin-right: 0">Cancel</button></div></div>');
    confirm.appendTo('body').on('click', '.btnOK, .btnCancel', function(){
        var ipt = confirm.find('input, textarea');
        var val = '';
        if(ipt.length > 0){
            val = ipt.val();
        }
        
        if($(this).hasClass('btnOK')){
            if(required === true && ipt.length > 0 && (!val) ){
                Dialog.tips('message is required.');
                ipt.focus();
                return;
            }
            cbOK && cbOK(val);
        }
        else{
            cbNO && cbNO(val);
        }

        confirm.remove();
    }).on('click', 'input, textarea', function(){
        confirm.removeClass('has-error');
    });

    var width = $(".tips").width();
    confirm.css('margin-left', -width / 2 + 'px');

    return confirm;
}

Dialog.open = function(title, content, cb){
    this.removeMadal();
    if(!content){
        content = title;
        title = '';
    }
    var dialogCover = $('<div class="zDialogCover"><div class="zDialog"><p class="zDialogTitle"><span class="close">×</span>' + title + '</p></div></div>').appendTo(document.body);
    var dialog = dialogCover.find('.zDialog');
    dialog.append(content);

    var width = dialog.outerWidth();
    var height = dialog.outerHeight();
    dialog.css({'margin-left': -width / 2 + 'px', 'left': '50%'});
    
    var bodyHeight = $(document).outerHeight();

    dialog.on('click', '.close', function(){
        dialog.animate({
            top: 0,
            opacity: 0
        }, 500, function(){
            dialogCover.remove();
        })
    })

    var top = '20%';
    if(height > bodyHeight){
        top = '5%';
    }

    if(height > 500){
        dialog.css({'position': 'absolute'});
        top = $(document).scrollTop() + 50 + 'px';
    }
    dialog.animate({
        top: top,
        opacity: 1
    }, 500, function(){
        cb && cb();
    })
}

Dialog.close = function(){
    var cover = $(".zDialogCover");
    if(!cover.length){
        return;
    }

    var dialog = cover.find('.zDialog');
    dialog.animate({
        top: 0,
        opacity: 0
    }, 500, function(){
        cover.remove();
    })
}

module.exports = Dialog;



},{}],5:[function(require,module,exports){

var FileView = function(options){
    this.csv = require('./asset/csv');
    this.ele = null;
    this._dataList = [];
    this.canEdit = true;
    this.maxHeight = 800;

    this.config = {
        container: 'body',
        canEdit: true,
        maxHeight: 800,
        heads: []
    };

    for(var key in options){
        if(this.config.hasOwnProperty(key)){
            this.config[key] = options[key];
        }
    }

    var self = this;

    self._render = function(){
        self.ele = $('<div class="zUploader"></div>');
        var uploadList = $('<div class="zUploaderList"></div>');
        uploadList.append(self._renderNoFile());
        self.ele.append(uploadList);
        self.ele.appendTo(self.config.container);
    }

    self._renderNoFile = function(){
        var div = $('<div class="zUploaderNoFile" style="padding:15px 0 0 0;"></div>');
        div.append('<span class="zUploaderFileBtn "><input type="file" accept=".csv" /><span class="zUploaderBtnText">点击选择文件</span></div>');
        div.append('<p>或将文件拖到这里, 暂仅支持CSV格式</p>');

        return div;
    }

    self._bindEvent = function(){
        self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
            self._readFilesToTable(this.files[0]);
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

        self.ele.on('blur', '.zFileTable tbody td input', function(){
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

    //返回值：model数组
    self.readCsv = function(file, cb){
        var reader = new FileReader();
        reader.onload = function(e){
            $('input[type="file"]').replaceWith($('<input type="file" accept=".csv">'));
            var content = reader.result;
            self._formatFileContent(content);
            cb();
        }

        reader.readAsText(file);
    }

    self._formatFileContent = function(content){
        var models = self.csv.parse(content);
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
            for(var key in item){
                datas.push(item[key]);
            }
            self._dataList.push(datas);
        }
    }

    //返回值：$table
    self._readFilesToTable = function(file){
        self.readCsv(file, function(){
            $('.zFileTableContainer').remove();
            var tableContainer = $('<div class="zFileTableContainer"><table class="zFileTable"></table></div>');
            if(self.config.maxHeight){
                tableContainer.css('max-height', self.config.maxHeight + 'px');
            }
            var ret = tableContainer.find('.zFileTable');
            if(self._dataList && self._dataList.length > 0){
                var keys = self._dataList[0];
                var keysLen = keys.length;
                var thead = $('<thead></thead>');
                var tbody = $('<tbody></tbody>');
                var theadTr = $('<tr><th></th></tr>').appendTo(thead);
                for(var i = 0; i < keysLen; i++){
                    theadTr.append('<th>' + keys[i] + '</th>');
                }

                for(var i = 1; i < self._dataList.length; i++){
                    var item = self._dataList[i];
                    var tr = $('<tr><td>' + i + '</td></tr>');
                    for(var j = 0; j < keysLen; j++){
                        tr.append('<td data-val="true", data-index="' + i + ',' + j + '">' + $.trim(item[j]) + '</td>');
                    }
                    tbody.append(tr);
                }
                ret.append(thead);
                ret.append(tbody);
            }
            var uploadList = self.ele.find('.zUploaderList');
            uploadList.find('.zFileTable').remove();
            tableContainer.appendTo(uploadList);

            self.setEditTable(ret);
        })
    }
    
    self.setEditTable = function(table){
        if(self.config.canEdit === true){
            table.find('tbody td[data-val]').each(function(){
                var td = $(this);
                var text = td.html();
                td.html('<span class="tdSpan">' + text + '</span><input class="tdIpt" type="text" value="' + text + '" />');
            });           
        }
    }

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

    self.mark = function(msgList){
        var length = msgList.length;
        for(var i = 0; i < length; i++){
            var msgItem = msgList[i];
            var dataIndex = msgItem.row + ',' + msgItem.col;
            var td = self.ele.find('tbody td[data-index="' + dataIndex + '"]');
            td.addClass('zFileTableMark').attr('title', msgItem.msg);
        }
    }

    self.clearMark = function(){
        self.ele.find('tbody .zFileTableMark').removeAttr('title').removeClass('zFileTableMark');
    }

    self._render();
    self._bindEvent();
}


module.exports = FileView;


},{"./asset/csv":2}],6:[function(require,module,exports){
var ImgUploader = function(options){
	this.config = {
		container: 'body'
	};
	this.ele = null;     //jquery对象，最外层
	this.canvas = null;  //canvas元素
	this.ctx = null;   //canvas.getContext();
	this.img = null;   //当前的图片
	this.filter = null;    //Jquery对象，裁剪框
	this.currentScale = 1;  //当前放大倍数
	this.scaleRate = 1.1;  //放大系数

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	var self = this;

	self.render = function(){
		self.ele = $('<div class="zImgUploader"></div>');
		var wrap = $('<div class="zImgUploaderWrap"></div>').appendTo(self.ele);
		wrap.append('<canvas class="zImgUploaderCanvas"></canvas>');
		wrap.append('<span class="zImgUploaderFilter none"><i class="zCutDown"></i><i class="zCutLeft"></i><i class="zCutRight"></i><i class="zCutUp"></i></span>');
		self.ele.append('<div class="zImgUploaderControl tc"><input type="file"><button class="btn btn-primary">Submit</button><button class="btn btn-warning btnToCut">Cut Image</button><button class="btn btn-info none btnCut">Cut</button></div>');
		

		self.canvas = self.ele.find('canvas')[0];
		self.ctx = self.canvas.getContext('2d');
		self.img = new Image();
		self.filter = self.ele.find('.zImgUploaderFilter');

		self.ele.appendTo(self.config.container);

		
		self.bindEvents();
	}

	self.showCut = function(){

	}

	self.bindEvents = function(){
		self.downWidth = self.filter.width();
        self.downHeight = self.filter.height();
        self.downLeft = self.filter.position().left;
        self.downTop = self.filter.position().top;
        self.downPosition = {};

        var reader = new FileReader();

		self.ele.on('change', 'input[type="file"]', function(){
			var file = this.files[0];
            if(!/image\/.*/.test(file.type)){
                oc.dialog.tips('Only image file is accept');
                return;
            }

            reader.onload = function(e){
                self.img.src = this.result;
                self.drawImage();
            }

            reader.readAsDataURL(file);
		})
		.on('click', '.btnToCut', function(){
			self.ele.find('.btnCut, .zImgUploaderFilter').show();
			$(this).addClass('none');
		})
		.on('mousedown', '.zImgUploaderFilter', function(e){
			if(e.which === 1){
                self.downPosition = e.originalEvent;
                downLeft = self.filter.position().left;
                downTop = self.filter.position().top;
                console.log('begin move');
                $(document).off('mousemove');
                $(document).on('mousemove', function(e){
                	console.log('222');
                	self.moveFilter(e);
                });
            }
            else{
            	console.log('off move');
                $(document).off('mousemove');
            }
		})
		.on('mousedown', '.zImgUploaderFilter i', function(e){
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
			console.log('mouseUp');
            // $(document).off('mousemove');
        })

		var eleFilter = self.filter[0];
		eleFilter.onmousewheel = eleFilter.onwheel = self.canvas.onmousewheel = self.canvas.onwheel = function(event){//chrome firefox浏览器兼容
            event.preventDefault();
            event.wheelDelta = event.wheelDelta? event.wheelDelta : (event.deltaY * (-40));
            if(event.wheelDelta > 0){
                self.currentScale = self.currentScale * self.scaleRate;
                self.drawImage(false, self.scaleRate);
            }
            else{
                self.currentScale = self.currentScale * 1.0 / self.scaleRate;
                self.drawImage(false, 1.0 / self.scaleRate);
            }
        }
	}

	self.drawImage = function(isCut, scale){
        self.canvas.width = self.img.width;
        self.canvas.height = self.img.height;
        if(isCut){
            self.canvas.width = self.filter.width();
            self.canvas.height = self.filter.height();
        }

        if(scale){
            self.canvas.width = self.canvas.width * scale;
            self.canvas.height = self.canvas.height * scale;
            self.img.width = self.canvas.width;
            self.img.height = self.canvas.height;
        }
        
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        if(isCut){
            self.canvas.width = self.canvas.width / self.currentScale;
            self.canvas.height = self.canvas.height / self.currentScale;
    	
            self.ctx.drawImage(self.img, self.filter.position().left / self.currentScale, self.filter.position().top / self.currentScale, self.canvas.width, self.canvas.height, 0, 0, self.canvas.width, self.canvas.height);

            var image = self.canvas.toDataURL("image/png");  
            self.img.src = image;
            self.img.width = self.canvas.width;
            self.img.height = self.canvas.height;

            self.ele.find('.btnCut, .zImgUploaderFilter').hide();
            self.ele.find('.btnToCut').show();
        }
        else{
            self.ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height);
        }
    }

    self.moveFilter = function(e){
    	console.log('mouse move');
    	var currentPosition = e.originalEvent;
   		
        var left = downLeft + currentPosition.clientX - self.downPosition.clientX;
        var top = downTop + currentPosition.clientY - self.downPosition.clientY;
        if(left < 0){
            left = 0;
        }
        if(top < 0){
            top = 0;
        }
        self.filter.css({
            left: left,
            top: top,
        })
    }

    self.moveFilterIcon = function(e, i){
    	console.log('mouse move');
    	e.stopPropagation();

        var currentPosition = e.originalEvent;
        var ele = $(i);
        var parent = ele.parent();
        
        var addWidth = currentPosition.clientX - self.downPosition.clientX;
        var addHeight = currentPosition.clientY - self.downPosition.clientY;

        var width = self.downWidth + self.addWidth;
        var height = self.downHeight + self.addHeight;

        if(i.hasClass('zCutRight')){
            parent.css({
                width: width
            })
        }
        else if(i.hasClass('zCutLeft')){
            parent.css({
                left: self.downLeft + self.addWidth,
                width: downWidth - addWidth
            })
        }
        else if(i.hasClass('zCutUp')){
            parent.css({
                top: self.downTop + addHeight,
                height: self.downHeight - addHeight
            })
        }
        else if(i.hasClass('zCutDown')){
            parent.css({
                height: height
            })
        }
    }

    self.render();
}

module.exports = ImgUploader;
},{}],7:[function(require,module,exports){
(function(){
	// window.$ = require('../jquery-2.1.3.min.js');
	window.oc = {};
	
	oc.ui = require('./ui');
	oc.dialog = require('./dialog');
	oc.localSorage = require('./localStorage');
	oc.FileView = require('./fileView');
	oc.Uploader = require('./uploader');
	oc.TreeSelect = require('./treeSelect');
	oc.TreeDialogSelect = require('./treeDialogSelect');
	oc.Tree = require('./tree');
	oc.ImgUploader = require('./imgUploader');
	oc.Sidebar = require('./sidebar');
	oc.TreeOrganization = require('./treeOrganization');
	oc.TreePIS = require('./treePIS');
	oc.ajax = require('./ajax');
	oc.date = require('./date');

	
	var cssPath = $('script[data-occss]').attr('data-occss');
	if(cssPath){
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
		cssPath = cssPath.replace('oc.css', 'icons/style.css');
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
	}
	else{
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://res.laptopmate.us/webapp/js/oc/oc.css'}).appendTo("head");
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://res.laptopmate.us/webapp/js/oc/icons/style.css'}).appendTo("head");
	}
})()
},{"./ajax":1,"./date":3,"./dialog":4,"./fileView":5,"./imgUploader":6,"./localStorage":8,"./sidebar":9,"./tree":10,"./treeDialogSelect":11,"./treeOrganization":12,"./treePIS":13,"./treeSelect":14,"./ui":15,"./uploader":16}],8:[function(require,module,exports){

var LocalStorage = {
	storage : window.localStorage
}

LocalStorage.set = function(key, value){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return;
	}

	var strVal = JSON.stringify(value);
	this.storage.key = strVal;
}

LocalStorage.get = function(key){
	if(typeof(key) !== 'string'){
		console.error("key mast to be a string");
		return null;
	} 

	var strVal = this.storage[key] || null;
	var jsonVal = JSON.parse(strVal);

	return jsonVal;
}

LocalStorage.remove = function(key){
	this.storage.removeItem(key);
}

LocalStorage.clear = function(){
	this.storage.clear();
}

module.exports = LocalStorage;


},{}],9:[function(require,module,exports){
var Sidebar = function(dataList, container){
	this.container = container;
	this.dataList = dataList;
	
	var self = this;

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
},{}],10:[function(require,module,exports){
var Tree = function(options){
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
                item.addClass('treeTag');
            }
        })
	}

	self.removeFilterTag = function(){
		self.ele.find('.treeTag').removeClass('treeTag');
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
			var li = $('<li class="zTreeItem" draggable="true"><p>' + one.name + '</p></li>');
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
			p.html('<input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark"></i>');
			var model = p.parent().data();
			p.find('[name="name"]').val(model.name);
			p.find('[name="description"]').val(model.description);
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
				li.data(model).find('>p').html(model.name).removeClass('zTreeEdit');
				if(model.description){
					li.addClass('zTreeItemDes').find('p').attr('title', model.description);
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
			newLi.append('<p class="zTreeEdit zTreeAdd"><input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark"></i></p>');
			newLi.appendTo(ul);
		})
		.on('dragstart', '.zTreeItem[draggable]', function(e){
			e.stopPropagation();
			self.dragEle = $(this);
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

	self.moveNode = function(sourceId, targetId, cb){
		cb(true);
	}

	self.deleteNode = function(nodeId, cb){
		// $.get('/tree/delete/' + nodeId, cb);
		cb();
	}

	self.updateNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	self.addNode = function(model, cb){
		setTimeout(cb, 2000);
	}


	self.render();
}

module.exports = Tree;
},{}],11:[function(require,module,exports){
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
			//品线过滤---------------------------------------
			if(model.description && self.productLine && model.description.indexOf(self.productLine) === -1){
				li.hide();
				return true;
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
},{}],12:[function(require,module,exports){

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
},{}],13:[function(require,module,exports){

var TreePIS = function(options){
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
				
				model.level = parseInt(parentModel.level) + 1;
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

			if(self.parentLi){ //add new
				model.category.descendant = self.parentLi.data().id;
				oc.ajax.post('/product/rest/v1/pis/categories/subcategory', model, function(res){
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
				})
			}
			else{ //update
				oc.ajax.put('/product/rest/v1/pis/categories/subcategory/' + self.currentLi.data().id, model, function(res){
					oc.dialog.tips('Update success.');
					$('.treeRightContainer').removeClass('active').find('input').val('');
					var nodeModel = self.currentLi.data();
					nodeModel.name = model.category.categoryName;
					nodeModel.description = model.category.description;

					self.currentLi.find('>p').html(nodeModel.name).attr('title', nodeModel.description);
					self.currentLi.data(nodeModel);
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
},{}],14:[function(require,module,exports){
var TreeSelect = function(options){
	this.config = {
		container: 'body',
		dataList: null,
		iptClass: '',
		width: 'auto',
		height: 'auto',
		showAll: false
	};

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
	}

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
		})
		self.selectedList.reverse();
		self.ele.find('input').val(text).attr('data-id', self.selectedItem.id || '');
		self.ele.removeClass('active');
		if(p.html() === 'All'){
			self.ele.find('input').val('All');
		}
		
		self.valueChangeHanlder && self.valueChangeHanlder();
	}

	self._setActive = function(){
		var model = self.ele.find('.zTreeSelectItem.active').data();
		if(model && model.id){
			self.ele.find('.zTreeSelectItem:visible').each(function(i, ele){
				var ele = $(ele);
				if(ele.data().id == model.id){
					self.currentActive = i;
					return false;
				}
			})
		}
		else{
			self.currentActive = null;
		}
	}

	self._bindEvents = function(){
		self.ele.on('click', function(e){
			e.stopPropagation();
			if(self.ele.hasClass('active')){
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
						li.find('>p').addClass('active');
					}
				})
			}
		})
		.on('click', 'p', function(e){
			e.stopPropagation();
			var p = $(this);
			self._selectedP(p);
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
			if(target.length == 0){
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

		$(document).on('click', function(){
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
		})
	}

	self._clear = function(){
		self.selectedItem = null;
		self.selectedList = [];
		// self.ele.find('input').val('');
	}
	
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
		})

		self.selectedList.reverse();
		self.ele.find('input').val(text);

		if(self.config.showAll && text == ''){
			self.ele.find('input').val('All');
		}
		
		return self.selectedList;
	}

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
},{}],15:[function(require,module,exports){
var UI = {};

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

// ele: 作用的元素 - jquery对象集合
// array：autoComplete的数据来源，为数组 - 可选
// cb：选择后的回调函数 - 可选
UI.autoComplete = function(ele, array, cb, prefix){
    ele = $(ele);
    if(typeof array === 'function'){
        cb = array;
        array = null;
    }
    ele.off('keyup').off('keydown').off('blur');
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
                // val = val.replace(/.*;|.*,|.*\s/g, '');
                if(prefix){
                    var mathedArray = text.match(/(.|,|\s)*(;|,|\s)/);
                    text = '';
                    if(mathedArray && mathedArray.length > 0){
                        text = mathedArray[0];
                    }
                    ipt.val(text + slcVal);
                }
                else{
                    ipt.val(slcVal);
                }
                
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
            // ipt.val(slc);
            var text = ipt.val();
            if(prefix){
                var mathedArray = text.match(/(.|,|\s)*(;|,|\s)/);
                text = '';
                if(mathedArray && mathedArray.length > 0){
                    text = mathedArray[0];
                }
                // text = text.replace(text.replace(/.*;|.*,|.*\s/g, ''), '');
                ipt.val(text + slc);
            }
            else{
                ipt.val(slc);
            }
            $('.zAutoComplete').remove();
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

UI.multiSelect = function(){
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
        }).click(function(e){
            e.stopPropagation();
        });

        $('html').click(function(){
            selectDiv.removeClass('active').find('.zMultiSelectMain').hide();
        });
    } ;
    bindEvent();
}

//btn: jqeury选择器或对象，一般为按钮，点击触发
//position: 值为 left、right、top、bottom，默认值为right
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

//关闭popOver，btn为popOver或者触发元素
UI.popOverRemove = function(btn){
    var btn = $(btn);
    if(btn.hasClass('.zPopOver')){
        btn.remove();
    }
    else{
        btn.next('.zPopOver').remove();
    }
}

module.exports = UI;
},{}],16:[function(require,module,exports){
var Uploader = function(options) {
	var self = this;

	this.config = {
		container: 'body',
		maxSize: 10,
		uploadAction: '/upload',
		postParams: {},
		blobSize: 1000000,
		callback: null,
		uploadOneCallback: null
	};

	this.STATUS = {
		waiting: 0,
		process: 1,
		success: 2,
		failed: 3
	};
	this.files = [];
	this.ele = null;
	this.msg = '';
	this.queueSize = 0;
	this.uploadedSize = 0;
	this.slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;
	
	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	self._renderFoot = function(){
		var div = $('<div class="zUploaderFoot"></div>');
		div.append('<p class="zUploaderStatic">选中0个文件，共0K</p>');
		div.append('<span class="zUploaderControl"><span class="zUploaderFileBtn"><input type="file" multiple="multiple" />' + 
			'<span class="zUploaderBtnText">继续添加</span></span><button class="zUploaderBtn" type="button">开始上传</button></span>');

		return div;
	}

	self._renderNoFile = function(){
	    var div = $('<div class="zUploaderNoFile"></div>');
	    div.append('<div class="icon"><i class="icon-images"></i></div>');
	    div.append('<span class="zUploaderFileBtn "><input type="file" multiple="multiple" /><span class="zUploaderBtnText">点击选择文件</span></div>');
	    div.append('<p>或将文件拖到这里，单次最多可上传文件' + self.config.maxSize + '个</p>');

	    return div;
	}

	self._render = function(){
		self.ele = $('<div class="zUploader"></div>');
		var uploadList = $('<div class="zUploaderList"></div>');
		uploadList.append(self._renderNoFile());
		var foot = self._renderFoot().hide();
		self.ele.append(uploadList);
		self.ele.append(foot);
		self.ele.appendTo(self.config.container);
	}

	self._reloadList = function(){
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
		for(var i = 0; i < len; i++){
			var file = self.files[i];
			size += file.size;
			var zUploaderItem = self._renderOneFile(file);
			file.target = zUploaderItem;
			zUploaderList.append(zUploaderItem);
		}

		self.ele.find('.zUploaderStatic').html('选中' + len + '个文件，共' + (size/1000.0).toFixed(2) + 'K');
	}

	self._pushFiles = function(files){
		for(var i = 0; i < files.length; i++){
			var file = files[i];
			if($.inArray(file, self.files) === -1){
				if(self.files.length === self.config.maxSize){
					alert('超出了最大文件数量');
					return false;
				}
				files[i].status = self.STATUS.waiting;
				self.files.push(files[i]);
			}
		}
		self._reloadList();
	}

	self._deleteFile = function(index){
		if(self.files[index].status !== self.STATUS.waiting){
			return alert('改文件当前不允许删除');
		}
		self.files.splice(index, 1);
		self._reloadList();
	}

	self._bindEvent = function(){
		self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
			self._pushFiles(this.files);
		}).on('click', '.zUploaderBtn', self._upload).on('click', '.zUploaderItemHd i', function(){
			var index = $(this).index();
			self._deleteFile(index);
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
			item.find('.zUploaderItemHd').remove();
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

	self.setStatus = function(file, status, msg){
		file.status = status;
		if(status === self.STATUS.success){
			file.target.find('.zUploaderMsg').addClass('ok').html('upload success');
	    	file.target.find('.zUploaderItemHd').remove();
	    	file.status = self.STATUS.success;
		}
		else if(status === self.STATUS.failed){
			// console.error('file "' + file.name + '" 失败:' + msg);
			file.target.find('.zUploaderMsg').addClass('error').html('upload failed');
		    file.status = 'failed';
		}
	}

	self._uploadOneFile = function(file, cb){
		self.setStatus(file, self.STATUS.process);

		if(window.FormData && window.XMLHttpRequest){
			self._sendFileByFormData(file, cb);
			return;
		}
		var fileName = new Date().getTime() + '_' + file.name;

		var reader = new FileReader();
		reader.onerror = function(err){
			self._process(file.size);
	        self.setStatus(file, self.STATUS.failed, '文件读取失败:' + err);
	        cb();
	    }
	    reader.onload = function(){
			var params = self.config.postParams;
			params.fileName = fileName;
			var fileData = reader.result;
			
			var sendPice = function(){
				params.fileData = fileData.slice(0, self.config.blobSize);
				fileData = fileData.slice(self.config.blobSize);
				if(params.fileData.length === 0){
					self.setStatus(file, self.STATUS.success);
					cb();
			    	return;
				}
				self._process(params.fileData.length);
				$.ajax({
		    		type: "post",
		    		url: self.config.uploadAction,
		    		data: params,
		    		success: function(){
		    			self._process(params.fileData.length);
		    			sendPice();
		    		},
		    		error: function(res){
		    			self._process(file.size - fileData.length);
		    			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
		    			cb();
		    		}
		    	})
			}
			sendPice();
	    }
	    reader.readAsBinaryString(file);
	}

	self._sendFileByFormData = function(file, cb){
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', self.config.uploadAction, true);
		var data = new FormData();
		data.append('file', file);
		xhr.upload.onload = function (e){
			self._process(file.size);
			self.setStatus(file, self.STATUS.success);	
			cb();
		}
		xhr.upload.onprogress = function(e){
			self._process(e.loaded, true);
		}
		xhr.upload.onerror = function(err){
			self._process(file.size);	
			// console.log('uploader error', err)
			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
			cb();
		}
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){    
				file.response = xhr.response;
		    }
		}
		xhr.send(data);
	}

	self._process = function(addSize, isNotAppend){
		var eleStatic = self.ele.find('.zUploaderStatic');
		var eleProcess = eleStatic.find('.zUploaderProcess');
		if(eleProcess.length === 0){
			eleStatic.html('');
			eleProcess = $('<span class="zUploaderProcess"><span class="zUploaderProcessInner"></span></span>').appendTo(eleStatic);
			eleProcesText = $('<span class="zUploaderProcessText"></span>').appendTo(eleStatic);
		}
		var currentSize = self.uploadedSize + addSize;
		if(addSize !== 0){
			eleProcess.attr('data-count', currentSize).find('.zUploaderProcessInner').css('width', currentSize * 100 / self.queueSize + '%');
		}
		eleStatic.find('.zUploaderProcessText').html('( ' + (currentSize / 1000).toFixed(2) + ' KB / ' + (self.queueSize / 1000).toFixed(2)  + ' KB )');
		if(isNotAppend !== true){
			self.uploadedSize += addSize;
		}
	}


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

		if(self.queueSize > 10000000){
			self.config.blobSize = 4000000;
		}
		self._process(0);
		var i = 0;
		var uploadQueue = function(){
			if(i === queueList.length){
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
},{}]},{},[7]);
