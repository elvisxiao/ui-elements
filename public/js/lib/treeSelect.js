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