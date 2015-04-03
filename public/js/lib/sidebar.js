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
					var subLi = $('<li><a>' + model.name + '</a></li>');
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