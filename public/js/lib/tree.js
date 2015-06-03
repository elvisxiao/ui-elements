/** 
* @file 生成无限级的树形结构
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* 生成无限级的树形结构
* @class Tree
* @constructor
* @param {object} options 配置变量对象：<br /> container：容器对象，默认为document.body<br />data：初始树形结构的数据<br />showLevel：初始展开的级别，默认为1
* @example
var tree = new oc.Tree({
    data: {
	    "id": "1",
	    "name": "Root category",
	    "description": "",
	    "items": [{
	        "id": "2",
	        "name": "ERP's",
	        "description": "",
	        "items": [{
	            "id": "3",
	            "name": "email sent related",
	            "description": "",
	            "items": null
	        }, {
	            "id": "4",
	            "name": "ERP's others",
	            "description": "",
	            "items": null
	        }]
	    }]
	}
});
*/

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

	/** 
	* 初始化界面
	* @method render
    * @memberof Tree 
    * @instance
    */
	self.render = function(){
		self.ele = $('<ul class="zTree"></ul>');
		var li = $('<li class="zTreeItem"><p>' + self.config.data.name + '</p></li>').data(self.config.data);
		li.appendTo(self.ele);
		
		self._renderRecusive(self.config.data.items, li, 0);
		$(this.config.container).find('.zTree').remove();
		$(this.config.container).append(self.ele);

		self._bindEvents();
	}

	/** 
	* 查询节点，采用开头匹配的模式进行搜索
	* @method filter 
	* @param {string} keyword - 关键字
    * @memberof Tree 
    * @instance
    */
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

	/** 
	* 搜索标记后，移除标记用
	* @method removeFilterTag 
    * @memberof Tree 
    * @instance
    */
	self.removeFilterTag = function(){
		self.ele.find('.treeTag').removeClass('treeTag');
	}

	/** 
	* 递归生成树节点
	* @method _renderRecusive 
	* @param {object} dataList - 树节点的数组对象
	* @param {object} ele - 父节点
	* @param {number} level - 父节点的级别
    * @memberof Tree 
    * @instance
    */
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

	/** 
	* 绑定内部事件
	* @method _bindEvents 
    * @memberof Tree 
    * @instance
    */
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

	/** 
	* 移动节点
	* @method moveNode 
	* @param {string} sourceId - 被拖动的节点id
	* @param {string} targetId - 被放下（drop）的节点id
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.moveNode = function(sourceId, targetId, cb){
		$.ajax({
			url: '/moveNode',
			type: 'post',
			data: {sourceId: sourceId, targetId: targetId},
			success: function(){
				cb(true);
			},
			error: function(res){
				cb(false, res.responseText);
			}
		})
    }
    */
	self.moveNode = function(sourceId, targetId, cb){
		cb(true);
	}

	/** 
	* 删除节点，需要额外根据业务实现该方法
	* @method deleteNode 
	* @param {string} nodeId - 节点id
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.deleteNode = function(nodeId, cb){
		$.ajax({
			url: '/delete/' + nodeId,
			type: 'delete',
			success: function(){
				cb();
			},
			error: function(res){
				oc.dialog.tips(res.responseText);
			}
		})
    }
    */
	self.deleteNode = function(nodeId, cb){
		// $.get('/tree/delete/' + nodeId, cb);
		cb();
	}

	/** 
	* 更新节点，需要额外根据业务实现该方法
	* @method updateNode 
	* @param {object} model - 节点对象
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.updateNode = function(model, cb){
		$.ajax({
			url: '/update/' + model.id,
			type: 'post',
			data: model,
			success: function(){
				cb(true);
			},
			error: function(res){
				oc.dialog.tips(res.responseText);
				cb(false);
			}
		})
    }
    */
	self.updateNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	/** 
	* 添加节点，需要额外根据业务实现该方法
	* @method addNode 
	* @param {object} model - 节点对象
	* @param {function} cb - 动作完成后执行回调，设置数结构
    * @memberof Tree 
    * @instance
    * @example
    * var tree = new Tree({...})
    * tree.addNode = function(model, cb){
		$.ajax({
			url: '/add',
			type: 'put',
			data: model,
			success: function(){
				cb(true);
			},
			error: function(res){
				oc.dialog.tips(res.responseText);
				cb(false);
			}
		})
    }
    */
	self.addNode = function(model, cb){
		setTimeout(cb, 2000);
	}


	self.render();
}

module.exports = Tree;