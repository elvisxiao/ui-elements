
/** 
* @file 侧边栏
* @author <a href="http://www.tinyp2p.com">Elvis Xiao</a> 
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