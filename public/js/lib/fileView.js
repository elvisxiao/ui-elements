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
        showLineNo: false,
        validHeads: null,
        showLineNo: false
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
                            one.map(function(item) {
                                if($.trim(item)) {
                                    isEmptyLine = false;
                                }
                            })
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
                var theadTr = $('<tr></tr>').appendTo(thead);
                if(self.config.showLineNo) {
                    theadTr.append('<th>NO.</th>');
                }
                for(var i = 0; i < keysLen; i++){
                    theadTr.append('<th>' + keys[i] + '</th>');
                }

                for(var i = 1; i < self._dataList.length; i++){
                    var item = self._dataList[i];
                    var tr = $('<tr></tr>');
                    if(self.config.showLineNo) {
                        tr.append('<td>' + i + '</td>');
                    }
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

