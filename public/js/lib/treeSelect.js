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
				self.ele.find('input').val('');
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
			if(model && model.id && model.id === id){
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
                if(item.name.indexOf(self.filterParams.name) > -1){
                    li.show();
                    li.find('li').show();
                    li.parents('li.zTreeSelectItem').show();
                }
            })
        }
    }
	// self.filter = function(){
	// 	self.ele.find('li.zTreeSelectItem').hide().each(function(){
	// 		var li = $(this);
	// 		var item = li.data();
	// 		var vali = true;
	// 		for(var key in self.filterParams){
	// 			var val = self.filterParams[key];
	// 			if(!val){
	// 				continue;
	// 			}
	// 			val = val.toUpperCase();
	// 			var realVal = item[key];
	// 			if(!realVal){
	// 				vali = false;
	// 				break;
	// 			}
	// 			realVal = realVal.toString().toUpperCase();
	// 			if(realVal.indexOf(val) === -1){
	// 				vali = false;
	// 				break;
	// 			}
	// 		}

	// 		if(vali === true){
	// 			li.show();
	// 			li.parents('li.zTreeSelectItem').show();
	// 		}
	// 	})
	// }

	self._renderRecusive = function(dataList, ele, level){
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