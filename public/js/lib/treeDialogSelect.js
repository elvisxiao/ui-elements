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