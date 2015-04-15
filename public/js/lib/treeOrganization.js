
var TreeOriganization = function(options){
	this.config = {
		container: 'body',
		data: null,
		showLevel: 1,
		family: null,
		allUser: null,
		isShowAdmin: false
	};
	this.ele = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	var self = this;

	self.render = function(){
		self.ele = $('<ul class="zTree zTreeOrganization"></ul>');
		var li = $('<li class="zTreeItem zTreeItemFolder"><p>海翼电商</p></li>').data(self.config.data);
		li.appendTo(self.ele);

		self._renderRecusive(self.config.data.children, li, 0);
		self.ele.find('>li>ul>li').removeAttr('draggable');
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
			var li = $('<li class="zTreeItem" draggable="true"><p>' + one.name + '</p></li>');
			if(one.level !== null){
				li.addClass('zTreeItemFolder');
			}
			li.appendTo(ul).data(one);
			// self._setToolTip(li);
			if(one.children && one.children.length > 0){
				self._renderRecusive(one.children, li, level + 1);
			}
		}
		if(len > 0){
			ul.appendTo(ele);
		}
	}

	self._setToolTip = function(li){
		var model = li.data();
		var adminName = model.adminUserName || '';
		if(!adminName){
			adminName = model.admin2UserName || '';
		}
		else{
			var name2 = model.admin2UserName? ', ' + model.admin2UserName : '';
			adminName += name2;
		}
		if(adminName){
			var p = li.find('p');
			li.find('p').attr('data-toggle', 'tooltip').attr('data-placement', 'top').attr('title', 'admin: ' + adminName);
			p.tooltip && p.tooltip('destroy') && p.tooltip();
		}
	}

	self.toggleAdmin = function(){
		if(self.config.isShowAdmin){
			self.config.isShowAdmin = false;
			self.ele.find('.zTreeItemFolder>p>.spanAdmin').remove();
		}
		else{
			self.config.isShowAdmin = true;
			self.ele.find('.zTreeItemFolder>p').each(function(){
				var p = $(this);
				var li = p.parent();
				var adminName = self.getAdminString(li);
				if(adminName){
					p.append('<span class="spanAdmin"> (' + adminName + ')');
				}
			})
		}
	}

	self.getAdminString = function(li){
		var model = li.data();
		var adminName = model.adminUserName || '';
		if(!adminName){
			adminName = model.admin2UserName || '';
		}
		else{
			var name2 = model.admin2UserName? ', ' + model.admin2UserName : '';
			adminName += name2;
		}

		return adminName;
	}

	self._setAdmin = function(li){
		if(!self.config.isShowAdmin){
			return;
		}
		if(!li.hasClass('zTreeItemFolder')){
			return;
		}
		var model = li.data();
		var adminName = model.adminUserName || '';
		if(!adminName){
			adminName = model.admin2UserName || '';
		}
		else{
			var name2 = model.admin2UserName? ', ' + model.admin2UserName : '';
			adminName += name2;
		}
		if(adminName){
			var p = li.find('>p');
			p.find('.spanAdmin').remove();
			p.append('<span class="spanAdmin"> (' + adminName + ')');
		}
	}

	self._bindEvents = function(){
		self.ele.on('click', '.zTreeItem p', function(){
			$(this).parent().toggleClass('active');
		})
		.on('mouseenter', '.zTreeItem p', function(){
			$('<span class="zTreeControl"><i class="icon-plus2"></i><i class="icon-cog"></i><i class="icon-minus2"></i></span>').hide().appendTo(this).fadeIn(1000);
		})
		.on('mouseleave', '.zTreeItem p', function(){
			$(this).find('.zTreeControl').remove();
		})
		.on('click', '.icon-minus2', function(e){
			e.stopPropagation();
			var treeItem = $(this).parents('.zTreeItem:eq(0)');
			var ul = treeItem.parent();
			var model = treeItem.data();

			self.deleteNode(model, function(){
				treeItem.fadeOut(500, function(){
					treeItem.remove();
					if(model.familyName){
						self.config.family.push(model.familyName);
					}
					if(ul.find('.zTreeItem').length === 0){
						ul.remove();
					}
				});
			});
		})
		.on('click', '.icon-cog', function(e){
			e.stopPropagation();
			var p = $(this).parent().parent();
			var li = p.parent();
			var model = li.data();
			self.model = model;
			self.dialog(li);
			var dialog = $('.zDialog');
			dialog.find('.btnSub').html('Save');
			dialog.find('.zDialogTitle').html('<span class="close">×</span>Edit');
			$('.pType').remove();
			dialog.find('.form-control').each(function(){
				var ele = $(this);
				var name = ele.attr('name');
				ele.val(model[name]);
			})
			if(model.level !== null){
				$('.divGroup').show();
			}
		})
		.on('click', '.zTreeEdit input, .zTreeEdit i, .zTreeControl', function(e){
			e.stopPropagation();
		})
		.on('click', '.icon-plus2', function(e){
			e.stopPropagation();
			var li = $(this).parents('.zTreeItem:eq(0)').addClass('active');
			self.model = null;
			self.parentModel = li.data();
			self.dialog(li);
			if(li.parent().hasClass('zTreeOrganization')){
				var addType = $('[name="addType"]');
				addType.get(1).checked = true;
				$('.pType, .divPerson').hide();
				$('.divGroup').show();
				var familySlc = self.getFamilyString();
				if(!familySlc){
					oc.dialog.close();
					oc.dialog.tips('No family to add.', 3000);
				}
				else{
					$('.pType').after('<span>Family:</span>' + familySlc[0].outerHTML);
				}
			}
		})
		.on('dragstart', '.zTreeItem[draggable]', function(e){
			e.stopPropagation();
			self.dragEle = $(this);
		})
		.on('dragenter', '.zTreeItemFolder>p', function(e){
			e.stopPropagation();
			e.preventDefault();
			var ele = $(this);
			var li = ele.parent();
			var source = self.dragEle.data();
			var target = li.data();
			var sourceId = source.id;
			var targetId = target.id;
			//人员不允许直接添加到海翼
			if(li.parent().hasClass('zTree')){
				return;
			}
			//不能拖拽到自己---
			if(targetId == sourceId && source.level == target.level){
				return;
			}
			//相同的元素中
			if(targetId == self.dragEle.parents('li:eq(0)').data().id){
				return;
			}

			//不能的family之间不能拖拽------
			if(li.data().familyName != self.dragEle.data().familyName){
				return;
			}

			//不能拖拽到子元素中 -----
			var parentsLis = li.parents('li');
			var ok = true;
			parentsLis.each(function(){
				var parentId = $(this).data().id;
				if(parentId == sourceId){
					ok = false;
				}
			})
			if(!ok){
				return;
			}

			li.addClass('treeTag');
			self.timer = setTimeout(function(){
				li.addClass('active');
			}, 1000);
		})
		.on('dragleave', '.zTreeItemFolder>p', function(e){
			self.timer && clearTimeout(self.timer);
			e.stopPropagation();
			$(this).parent().removeClass('treeTag');
		})
		.on('dragover', '.zTreeItemFolder.treeTag', function(e){
			e.preventDefault();
		})
		.on('drop', '.zTreeItemFolder.treeTag', function(e){
			var ele = $(this);
			var source = self.dragEle.data();
			var target = ele.data();
			var sourceId = source.id;
			var targetId = target.id;
			
			self.moveNode(sourceId, targetId, self.dragEle.data().level, function(isOK, msg){
				ele.removeClass('treeTag');
				if(isOK){
					var ul = ele.find('>ul');
					if(ul.length == 0){
						ul = $('<ul></ul>').appendTo(ele);
					}
					ele.addClass('hasMore');
					var dragParent = self.dragEle.parents('ul:eq(0)');
					source.parentId = targetId;
					self.dragEle.data(source);
					self.dragEle.appendTo(ul);
					if(dragParent.find('li').length === 0){
						dragParent.parent().removeClass('hasMore');
						dragParent.remove();
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

	self.getFamilyString = function(){
		var slc = $('<select class="form-control input-sm" name="family"></select>');
		var len = self.config.family.length;
		if(len === 0){
			return null;
		}

		for(var i = 0; i < len; i ++){
			slc.append('<option>' + self.config.family[i] + '</option>');
		}

		return slc;
	}

	self.dialog = function(li){
		var form = '<div class="formOrganization w600 form-inline p10 pl30 pr30"><div class="p15"><p class="pType"><span>Type: </span><label class="mr30"><input type="radio" name="addType" value="person" checked style="margin-right:5px">人员</label><label><input name="addType" style="margin-right:5px" type="radio" value="group">部门</label></p>' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off"></p>' + 
				'<div class="divGroup none"><p class="mt10"><span>Group name: </span><input type="text" class="form-control input-sm" name="name"></p>' + 
				'<p class="mt10"><span>Admin1 name: </span><input type="text" class="form-control input-sm" name="adminUserName" autocomplete="off"></p>' + 
				'<p class="mt10"><span>Admin2 name: </span><input type="text" class="form-control input-sm" name="admin2UserName" autocomplete="off"></p></div>' + 
				'<p class="divGroup none"><span class="vt">Memo: </span><textarea class="form-control" name="memo"></textarea></p></div>' + 
				'<div class="tc pt20" style="border-top:1px solid #ddd;"><button class="btn btn-primary w100 mr20 btnSub">Add</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		oc.dialog.open('Add', form);
		var dialog = $('.zDialog');
		oc.ui.autoComplete(dialog.find('.divPerson [name="name"], [name="adminUserName"], [name="admin2UserName"]'), self.config.allUser);
		dialog.on('change', '[name="addType"]', function(){
			if(this.value === 'group'){
				$('.divGroup').fadeIn();
				$('.divPerson').fadeOut();
			}
			else{
				$('.divPerson').fadeIn();
				$('.divGroup').fadeOut();
			} 
		})
		.on('click', '.btnSub', function(){
			var btn = $(this);
			var isAdd = false;
			if(!self.model){
				isAdd = true;
				self.model = {
					familyName: self.parentModel.familyName,
					parentId: self.parentModel.id
				};
			}
			
			var eleName = dialog.find('[name="name"]:visible');
			self.model.name = $.trim(eleName.val());
			if(!self.model.name){
				oc.dialog.tips('Name is required');
				eleName.focus();
				return ;
			}
			var eleFamily = $('[name="family"]');
			if(eleFamily.length > 0){
				self.model.familyName = eleFamily.val();
			}
			self.model.memo = $.trim(dialog.find('[name="memo"]').val());
			if(isAdd){
				var addType = $('[name="addType"]:checked').val();
				self.model.level = null;
				if(addType == 'group'){
					self.model.level = self.parentModel.level + 1;
				}
			}
			self.model.adminUserName = $.trim(dialog.find('[name="adminUserName"]').val());
			self.model.admin2UserName = $.trim(dialog.find('[name="admin2UserName"]').val());

			var btnText = btn.html();
			btn.html('<i class="zLoadingIcon mr5"></i>' + btnText + '...').attr('disabled', true);
			
			var method = isAdd? 'addNode' : 'updateNode';
			self[method](self.model, function(isOk, msg){
				if(isOk){
					if(eleFamily.length > 0){
						self.config.family = self.config.family.filter(function(key){
							return key != self.model.familyName;
						})
					}
					oc.dialog.close();
					if(!isAdd){ //更新树节点
						li.data(self.model).find('>p').html(self.model.name);
						// self._setToolTip(li);
						self._setAdmin(li);
					}
					else{
						var ul = li.find('>ul');
						if(ul.length === 0){
							ul = $('<ul></ul>').appendTo(li);
						}
						self.model.id = msg;
						var newLi = $('<li class="zTreeItem"><p>' + self.model.name + '</p></li>').data(self.model);
						if(self.model.level !== null){
							newLi.addClass('zTreeItemFolder');
						}
						if(eleFamily.length === 0){
							newLi.attr('draggable', 'true');
						}
						newLi.appendTo(ul);
						// self._setToolTip(newLi);
						self._setAdmin(li);
					}
				}
				else{
					btn.removeAttr('disabled').html(btnText);
					oc.dialog.tips(method + ' fail:' + msg);
				}
			})

		})
	}

	self.deleteNode = function(ele, cb){
		// $.get('/tree/delete/' + nodeId, cb);
		cb();
	}

	self.updateNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	self.addNode = function(model, cb){
		setTimeout(cb, 2000);
	}

	self.moveNode = function(sourceId, targetId, level, cb){
		setTimeout(function(){
			cb(true);
		}, 2000);
	}

	self.render();
}

module.exports = TreeOriganization;