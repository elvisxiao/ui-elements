/**
 * @param  {string} param -- url or array list 
 * @return {object}
 */
var Table = function(dataList, total) {
	this.pageNo = 1;    // 当前的页码数，默认为1
	this.pageSize = 10; //单页显示行数，默认值为10
    this.sortKey;
    this.sortUp;

	this.showSearchBox = false; // 是否显示搜索框 
	this.showBtnExport = false; //是否显示导出按钮
    this.showCheckbox = false;

    this.total = total; // 用于服务器端数据获取------
	this.dataList = dataList;  //原始数据保存区
	this.tdDataList = [];      //根据原始数据生成的Table数据

    this.filterDataList = dataList;      //根据条件查询出来的所有数据保存区, 暂时不用
    this.filterTdDataList;    //根据搜索条件搜索出的td数据保存区
    this.pageData;        //当前页的数据

    this.loadDataCallback; //服务器端加载数据的回调函数
    this.afterAppend;      //appendTo完成后调用
    this.afterLoadBody;   //数据重新加载后调用，一般在翻译，搜索后

    this.filterFn;

    this._timer; //定时器，私有对象

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
	
	//build Table的Caption部分
	self.renderCaption = function() {
		var caption = $('<caption></caption>');
        
        if(this.showBtnExport) {
            caption.append('<button type="text" class="btnExport btn btn-info btn-sm fr">Export</button>');
        }
        if(this.showSearchBox) {
            caption.append('<label class="form-inline w200"><input type="text" class="searchBox form-control input-sm" placeholder="Search here ..." /></label>');
        }

        return caption;
	}

	//build Table的头部 -----
	self.renderHead = function() {
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

	//build每一行的数据, 请根据实际情况复写----
	self.renderTr = function(model) {
		var tr = $('<tr></tr>');
        for(var key in self.headMapping) { 
            var arr = key.split('.');   //支持嵌套Model的render-----
            var tdVal = model[key];
            
            tr.append('<td>' + self._getDefault(tdVal) + '</td>');
        }

        return tr;
	}

	//根据headmapping生成一份表格数据---
	self.buildTdData = function() {
		self.tdDataList = [];

		self.dataList.map(function(model) {
            var one = {};
            for(var key in self.headMapping) {
                var arr = key.split('.');   //支持嵌套Model的render-----
                var tdVal = model[key] !== undefined? model[key] : model;
                if(arr.length > 1) {
                    for(var i = 0; i < arr.length; i++) {
                        tdVal = tdVal[arr[i]];
                        if(!tdVal) {
                            break;
                        }
                    }
                }
                one[key] = tdVal;
            }

            self.tdDataList.push(one);
		})

        self.filterTdDataList = self.tdDataList;
	}

    self.filter = function(fn) {
        if(!fn || typeof fn !== 'function') {
            return;
        }

        self.filterDataList = self.dataList.filter(function(model) {
            return fn(model);
        })
        self.buildFilterTdData();

        self.pageNo = 1;

        self.rerender();
    }

    //filterData改变的情况下，需要更新td数据
    self.buildFilterTdData = function() {
        self.filterTdDataList = [];

        self.filterDataList.map(function(model) {
            var one = {};
            for(var key in self.headMapping) {
                var arr = key.split('.');   //支持嵌套Model的render-----
                var tdVal = model[key] || model;
                if(arr.length > 1) {
                    for(var i = 0; i < arr.length; i++) {
                        tdVal = tdVal[arr[i]];
                        if(!tdVal) {
                            break;
                        }
                    }
                }
                one[key] = tdVal;
            }

            self.filterTdDataList.push(one);
        })
    }

    self.getPageData = function() {
        if(self.total) {
            return self.dataList;
        }

        var start = self.pageSize * (self.pageNo - 1);
        var dataList = self.filterDataList;
        var len = self.pageSize > dataList? dataList.length: self.pageSize;
        
        self.pageData = self.filterDataList.slice(start, len + start);
        return self.pageData;
    }

    self.renderBody = function() {
        var tbody = $('<tbody></tbody>');

        if(self.filterDataList && self.filterDataList.length) {
            var pageData = self.getPageData();
            pageData.map(function(model) {
                var tr = self.renderTr(model);
                if(self.showCheckbox) {
                    tr.prepend('<td><input type="checkbox" class="cbxOcTable"></td>');
                }
                tbody.append(tr);
            })
        }
        else {
            tbody.append('<tr class="trEmpty"><td colspan="100">No data.</td></tr>');
        }

        return tbody;
    }

    self.renderFoot = function() {
        var tfoot = $('<tfoot><tr><td colspan="100"><form><nav><ul class="pagination"></ul></nav></form></td></tr></tfoot>');
        var nav = tfoot.find('nav');
        var ul = tfoot.find('ul');
        ul.append('<li><a href="#" title="First" data-page="1">&laquo;</a></li>');
        ul.append('<li><a href="#" title="Previous" data-page="' + (self.pageNo - 1) + '">‹</a></li>');

        var total = self.total || self.filterTdDataList.length;
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

        return tfoot;
    }

    self.render = function() {
        self.buildTdData();

        var caption = self.renderCaption();
        var thead = self.renderHead();
        var tbody = self.renderBody();
        var foot = self.renderFoot();

        self.table.html('').off('click');
        self.table.append(caption);
        self.table.append(thead);
        self.table.append(tbody);
        self.table.append(foot);

        self.bindEvents();
    }

    self.appendTo = function(ele) {
        ele = $(ele);
        self.render();
        self.table.appendTo(ele);

        self.afterAppend && self.afterAppend();
        self.afterLoadBody && self.afterLoadBody();
    }
    
    //根据搜索条件、重新加载tbody中的数据----
    self.reloadBody = function() {
        var tbody = self.table.find('tbody').replaceWith(self.renderBody());

        self.afterLoadBody && self.afterLoadBody();
    }

    self.reloadFoot = function() {
        self.table.find('tfoot').replaceWith(self.renderFoot());
    }

    self.rerender = function() {
        self.reloadBody();
        self.reloadFoot();
    }

    //服务器端加载数据----------
    self.loadData = function () {
        self.table.find('tbody').html('<tr><td colspan="100"><i class="zLoadingIcon mr5"></i>Loading...</td></tr>');
        var params = {
            pageNo: self.pageNo,
            pageSize: self.pageSize
        }
        if(self.sortKey) {
            params.orderBy = self.sortKey;
            params.desc = self.sortUp? "asc": "desc";
        }

        self.loadDataCallback && self.loadDataCallback(params, function(dataList) {
            self.dataList = dataList;
            self.filterDataList = dataList;
            self.rerender();
        });
    }

    self.bindFootEvents = function() {
        self.table.on('click', 'tfoot .pagination li a', function(e) {
            e.preventDefault();
            var a = $(this);
            if(a.parent().hasClass('active') || a.parent().hasClass('disabled')) {
                return;
            }
            self.pageNo = parseInt(a.attr('data-page'));
            //服务器端加载数据--------
            if(self.total) {
                self.loadData();

                return;
            }

            self.rerender();
        })
        .on('click', 'thead th[data-sort]', function() {
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
            if(self.total) {
                self.sortKey = key;
                self.sortUp = sortUp;
                self.loadData();

                return;
            }

            self.filterTdDataList.sort(function(a, b) {
                var valA = a[key];
                var valB = b[key];
                if(typeof valA === 'number') {
                    return sortUp? valA - valB : valB - valA;
                }

                return sortUp? valA.localeCompare(valB) : valB.localeCompare(valA); 
            })
            self.rerender();
        })
        .on('submit', 'tfoot form', function() {
            var form = self.table.find('tfoot form');
            self.pageSize = parseInt(form.find('input[name="pageSize"]').val());
            self.pageNo = parseInt(form.find('input[name="pageNo"]').val() || 1);

            //服务器端加载数据--------
            if(self.total) {
                self.loadData();

                return false;
            }

            self.rerender();

            return false;
        })
    }

    self.bindEvents = function() {
        //search----
        self.table.off('input').on('input', 'caption .searchBox', function() {
            var searchStr = $.trim(this.value).toUpperCase();

            self.timer && clearTimeout(self.timer);

            self.timer = setTimeout(function(){
                self.pageNo = 1;
                self.filterTdDataList = self.tdDataList.filter(function(model) {
                    var ret = false;
                    for(var key in model) {
                        if(model[key].toString().toUpperCase().indexOf(searchStr) !== -1) {
                            ret = true;
                            break;
                        }
                    }

                    return ret;
                })

                self.reloadBody();
            }, 500);
        })
        .off('click')
        .on('click', 'thead input:checkbox.cbxOcTable', function() {
            self.table.find('tbody input:checkbox.cbxOcTable').prop('checked', this.checked);
        })
        .on('click', 'tbody input:checkbox.cbxOcTable', function() {
            self.table.find('thead input:checkbox.cbxOcTable').prop('checked', false);
        })

        self.bindFootEvents();
    }
}


module.exports = Table;
// define([], function() {
//     return Table;
// })