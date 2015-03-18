(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
    var confirm = $('<div class="zLoading"></div><div class="tips confirm" style="min-width: 500px;">' + msg + '<div style="border-top: 1px dashed #ddd;" class="tc mt20 pt10"><button class="btn btn-info btn-sm btnOK mr20">确定</button><button class="btn btn-default btn-sm btnCancel" style="margin-right: 0">取消</button></div></div>');
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

Dialog.open = function(title, content){
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
    dialog.animate({
        top: top,
        opacity: 1
    }, 500)
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



},{}],3:[function(require,module,exports){

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


},{"./asset/csv":1}],4:[function(require,module,exports){
(function(){
	// window.$ = require('../jquery-2.1.3.min.js');
	window.oc = {};
	
	oc.ui = require('./ui');
	oc.dialog = require('./dialog');
	oc.localSorage = require('./localStorage');
	oc.FileView = require('./fileView');
	oc.Uploader = require('./uploader');
	oc.TreeSelect = require('./treeSelect');
	oc.Tree = require('./tree');
	
	var cssPath = $('script[data-occss]').attr('data-occss');
	if(cssPath){
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
	}
	else{
		// $("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://localhost:3000/dest/oc.css'}).appendTo("head");
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: '/product/js/oc/oc.css'}).appendTo("head");
	}
})()
},{"./dialog":2,"./fileView":3,"./localStorage":5,"./tree":6,"./treeSelect":7,"./ui":8,"./uploader":9}],5:[function(require,module,exports){

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


},{}],6:[function(require,module,exports){
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
		self.ele.appendTo($(this.config.container));

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
			var li = $('<li class="zTreeItem"><p>' + one.name + '</p></li>');
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
			newLi.append('<p class="zTreeEdit"><input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark"></i></p>');
			newLi.appendTo(ul);
		})
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
},{}],7:[function(require,module,exports){
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
        self.ele.find('>ul').css('max-height', windowHeight - top - 150);
        
		self._bindEvents();

		if(self.config.showAll){
			self.ele.find('input').val('All');
		}
	}

	self._bindEvents = function(){
		self.ele.on('click', function(e){
			e.stopPropagation();
			if(self.ele.hasClass('active')){
				return;
			}
			self.ele.addClass('active');
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
		})
		.on('input', 'input', function(){
			self._clear();
			self.filterParams.name = this.value;
			self.filter();
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
},{}],8:[function(require,module,exports){
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
    if(btn[0].checked){
        btnClass += ' active';
    }
    var span = $('<span class="' + btnClass + '"><i class="zToggleBtnON">' + on + '</i><i class="zToggleBtnOFF">' + off + '</i>' +  btn[0].outerHTML + '</span>');
    btn.replaceWith(span);
    
    span.off('change', 'input').on('change', 'input', function(){
        console.log('333');
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
UI.autoComplete = function(ele, array, cb){
    if(typeof array === 'function'){
        cb = array;
        array = null;
    }
    ele.off('keyup').off('keydown').off('blur');
    ele.on('keydown', function(e){
        console.log('keydow');
        if(e.keyCode === 13){
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
                ipt.val(focusLi.html());
                ul.remove();
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
            ipt.val(slc);
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

UI.mutiSelect = function(){
    $("select.zMutiSelect").each(function(){
        var ele = $(this);
        var width = ele.outerWidth();
        var height = ele.height() + 'px';
        var name = ele.attr('name');
        if(name === undefined){
            name = '';
        }
        var zEle = $('<div class="zMutiSelectDiv"><div class="zMutiSelectText"></div><div class="zMutiSelectMain"><ul></ul></div></div>');
        zEle.css('width', width);
        zEle.find('.zMutiSelectText').css({'height': height, 'line-height': height}).html(ele.attr('data-slc'));

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
        var selectDiv = $(".zMutiSelectDiv");
        selectDiv.off('click', 'button').off('click', '.zMutiSelectText');

        selectDiv.on('click', '.zMutiSelectText', function(){
            var select  = $(this).parents('.zMutiSelectDiv:eq(0)');
            
            if(!select.hasClass('active')){
                select.addClass('active').find('.zMutiSelectMain').show();
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
                select.removeClass('active').find('.zMutiSelectMain').hide();
            }
        }).on('click', 'button', function(e){
            var select  = $(this).parents('.zMutiSelectDiv:eq(0)');
            var main = $(this).parents('.zMutiSelectMain:eq(0)');
            var values = '';
            main.find('input:checked').each(function(){
                values += this.value + ';';
            });
            if(values){
                values = values.slice(0, -1);
            }
            select.removeClass('active').find('.zMutiSelectText').html(values);
            main.hide();
            e.stopPropagation();
        }).click(function(e){
            e.stopPropagation();
        });

        $('html').click(function(){
            selectDiv.removeClass('active').find('.zMutiSelectMain').hide();
        });
    } ;
    bindEvent();
}

module.exports = UI;
},{}],9:[function(require,module,exports){
var Uploader = function(options) {
	var self = this;

	this.config = {
		container: 'body',
		maxSize: 10,
		uploadAction: '/upload',
		postParams: {},
		blobSize: 1000000
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
				return;
			}
			
			self._uploadOneFile(queueList[i], function(){
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
},{}]},{},[4]);
