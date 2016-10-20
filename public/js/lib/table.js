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