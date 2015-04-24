
var TreeOriganization = function(options){
	this.config = {
		container: 'body',
		data: null,
		teamData: null,
		showLevel: 1,
		family: null,
		allUser: null,
		isShowAdmin: false
	};
	this.allUserName = null,
	this.ele = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}


	var self = this;


	if(self.config.allUser){
		self.allUserName = [];
		self.config.allUser.map(function(model){
			self.allUserName.push(model.name);
		})
	}

	self.render = function(){
		self.ele = $('<ul class="zTree zTreeOrganization"></ul>');
		var li = $('<li class="zTreeItem zTreeItemFolder"><p>海翼电商</p></li>').data(self.config.data);
		li.appendTo(self.ele);

		self._renderRecusive(self.config.data.children, li, 0);
		self.ele.find('>li>ul>li').removeAttr('draggable');
		self.ele.appendTo($(this.config.container));

		self.ele.find('li.zTreeItem>p').each(function(){
			var p = $(this);
			var li = p.parent();
			var model = li.data();
			if(!model || !model.nodeType){
				return true;
			}

			var nodeType = model.nodeType;
			if(nodeType != 21 && nodeType != 11){
				return true;
			}			
			var name = li.data().name;
			var findUsers = self.config.allUser.filter(function(model){
				return model.name == name;
			})
			if(findUsers.length > 0){
				var img = findUsers[0].img;
				img && p.append('<img src="' + img + '" />').addClass('pImg');
			}
		})
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
                item.addClass('treeSearch');
            }
        })
	}

	self.removeFilterTag = function(){
		self.ele.find('.treeSearch').removeClass('treeSearch');
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
			if(one.nodeType == 10 || one.nodeType == 1 || one.nodeType == 2){
				li.addClass('zTreeItemFolder');
				if(one.nodeType == 10){
					var departmentId = one.name;
					var departmentModel = self.config.teamData.filter(function(model){
						return model.id == departmentId;
					});

					if(departmentModel.length == 0){
						li.html('<p>未知部门</p>');
					}
					else{
						departmentModel = departmentModel[0];
						one.department = departmentModel;
						li.html('<p>' + departmentModel.name + '</p>');
					}
				}
			}
			else if(one.nodeType == 21){ //汇报关系
				li.addClass('zTreeItemReport');
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

	self._bindEvents = function(){
		self.ele.on('click', '.zTreeItem p', function(){
			var li = $(this).parent();
			li.toggleClass('active');
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
			self.dialogEdit(li);
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
		})
		.on('dragstart', '.zTreeItem[draggable]', function(e){
			e.stopPropagation();
			self.dragEle = $(this);
		})
		.on('dragenter', 'ul', function(e){
			e.stopPropagation();
			e.preventDefault();
		})
		.on('dragenter', '.zTreeItemFolder>p, .zTreeItemReport>p', function(e){  //move in
			e.stopPropagation();
			e.preventDefault();
			var ele = $(this);
			var li = ele.parent();
			
			var source = self.dragEle.data();
			var target = li.data();

			var sourceId = source.id;
			var targetId = target.id;
			if(target.nodeType != 21 && target.nodeType != 10){
				return;
			}
			if(sourceId == targetId){
				return;
			}
			//人员不允许直接添加到海翼
			if(li.hasClass('zTree')){
				return;
			}
			//相同的元素中
			if(targetId == self.dragEle.parents('li:eq(0)').data().id){
				return;
			}

			//不能的family之间不能拖拽------
			if(target.familyName != source.familyName){
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
			}, 1500);
		})
		.on('dragenter', '.zTreeItem', function(e){  //move sort
			e.stopPropagation();
			e.preventDefault();
			var li = $(this);
			
			var source = self.dragEle.data();
			var target = li.data();

			var sourceId = source.id;
			var targetId = target.id;
			if(sourceId == targetId){
				return;
			}
			// 不能的family之间不能排序------
			if(target.familyName != source.familyName){
				return;
			}
			var dragParentId = self.dragEle.parents('li:eq(0)').data().id;
			if(dragParentId !== li.parents('li:eq(0)').data().id && dragParentId != targetId){
				return;
			}
			li.addClass('treeTagSort');
		})
		.on('dragleave', '.zTreeItem', function(e){
			e.stopPropagation();
			var ele = $(this);
			ele.removeClass('treeTagSort');
		})
		.on('dragleave', '.zTreeItemFolder>p, .zTreeItemReport>p', function(e){
			e.stopPropagation();
			self.timer && clearTimeout(self.timer);
			var ele = $(this).parent();
			if(ele.hasClass('treeTag')){
				ele.removeClass('treeTag');
			}
		})
		.on('dragover', '.zTreeItem', function(e){
			e.preventDefault();
		})
		.on('drop', '.zTreeItemFolder.treeTag, .zTreeItemReport.treeTag', function(e){
			var ele = $(this);
			var source = self.dragEle.data();
			var target = ele.data();
			var sourceId = source.id;
			var targetId = target.id;
			
			self.moveNode(sourceId, targetId, function(isOK, msg){
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
		.on('drop', '.zTreeItem.treeTagSort', function(e){
			var ele = $(this);
			var source = self.dragEle.data();
			var target = ele.data();
			var sourceId = source.id;
			var targetId = target.id;
			if(self.dragEle.parents('li:eq(0)').data().id == targetId){
				targetId = null;
			}
			self.sortNode(sourceId, targetId, function(isOK, msg){
				ele.removeClass('treeTagSort');
				if(isOK){
					if(targetId == null){
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

	self.dialogEdit = function(li){
		var form = '<div class="formOrganization w600 form-inline p10 pl30 pr30">' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off" value="' + self.model.name + '"></p>' + 
				'<div class="tc pt20" style="border-top:1px solid #ddd;"><button class="btn btn-primary w100 mr20 btnSub">Save</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		if(self.model.nodeType === 10){
			form = '<div class="formOrganization w600 form-inline p10 pl30 pr30">' + 
				'<p class="mt10 divGroup"><span>Name: </span><select class="slcDepartment form-control input-sm" name="name"></select></p>' + 
				'<div class="tc pt20" style="border-top:1px solid #ddd;"><button class="btn btn-primary w100 mr20 btnSub">Add</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		}
		
		oc.dialog.open('Edit', form);

		var dialog = $('.zDialog');
		if(self.model.nodeType === 10){
			var slcTeam = dialog.find('[name="name"]');
			self.config.teamData.map(function(model){
				slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
			});
			slcTeam.find('option[value="' + self.model.name + '"]').attr('selected', true);
		}
		else{
			oc.ui.autoComplete(dialog.find('[name="name"]'), self.allUserName);
		}

		dialog.on('click', '.btnSub', function(){
			var btn = $(this);

			var eleName = dialog.find('[name="name"]:visible');
			self.model.name = $.trim(eleName.val());
			if(!self.model.name){
				oc.dialog.tips('Name is required');
				eleName.focus();
				return ;
			}

			btn.html('<i class="zLoadingIcon mr5"></i>').attr('disabled', true);
			
			self.updateNode(self.model, function(isOk, msg){
				if(isOk){
					oc.dialog.close();
					var p = li.find('p').html(self.model.name);
					if(self.model.nodeType === 10){
						var departmentModel = self.config.teamData.filter(function(model){
							return model.id == self.model.name;
						});

						departmentModel = departmentModel[0];
						self.model.department = departmentModel;
					}
					else{
						var name = self.model.name;
						var findUsers = self.config.allUser.filter(function(model){
							return model.name == name;
						})
						if(findUsers.length > 0){
							var img = findUsers[0].img;
							img && (p.addClass('pImg').append('<img src="' + img + '" />'));
						}
					}
					li.data(self.model);
				}
				else{
					btn.removeAttr('disabled').html("Save");
					oc.dialog.tips('Add node fail:' + msg);
				}
			})
		})

	}

	self.dialog = function(li){
		var form = '<div class="formOrganization w600 form-inline p10 pl30 pr30"><div class="p15"><p class="pType"><span>Type: </span><label class="mr30"><input type="radio" name="addType" value="person" checked style="margin-right:5px">人员</label><label><input name="addType" style="margin-right:5px" type="radio" value="group">团队</label></p>' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off"></p>' + 
				'<p class="mt10 divGroup none"><span>Name: </span><select class="slcDepartment form-control input-sm" name="name"></select></p>' + 
				'<div class="tc pt20" style="border-top:1px solid #ddd;"><button class="btn btn-primary w100 mr20 btnSub">Add</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		oc.dialog.open('Add', form);
		var dialog = $('.zDialog');
		var nodeData = li.data();
		self.model = {
			parentId: self.parentModel.id,
			familyName: self.parentModel.familyName
		};

		if(nodeData.nodeType == 2 || nodeData.nodeType == 21){
			self.model.nodeType = 21;
			dialog.find('.pType, .divGroup').remove();
		}

		oc.ui.autoComplete(dialog.find('.divPerson [name="name"]'), self.allUserName);
		var slcTeam = dialog.find('.divGroup [name="name"]');
		self.config.teamData.map(function(model){
			slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
		});
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

			var eleName = dialog.find('[name="name"]:visible');
			self.model.name = $.trim(eleName.val());
			if(!self.model.name){
				oc.dialog.tips('Name is required');
				eleName.focus();
				return ;
			}

			if(self.model.nodeType != 2 && self.model.nodeType != 21){
				var checkedType = $('[name="addType"]:checked').val();
				checkedType == "person"? self.model.nodeType = 11 : self.model.nodeType = 10;
			}

			var btnText = btn.html();
			btn.html('<i class="zLoadingIcon mr5"></i>' + btnText + '...').attr('disabled', true);
			
			self.addNode(self.model, function(isOk, msg){
				if(isOk){
					oc.dialog.close();
					
					var ul = li.find('>ul');
					if(ul.length === 0){
						ul = $('<ul></ul>').appendTo(li);
					}
					self.model.id = msg;
					var newLi = $('<li class="zTreeItem"><p>' + self.model.name + '</p></li>');
					if(self.model.nodeType == 10){
						newLi.addClass('zTreeItemFolder');
						var departmentModel = self.config.teamData.filter(function(model){
							return model.id == self.model.name;
						});

						departmentModel = departmentModel[0];
						self.model.department = departmentModel;
						newLi.html('<p>' + departmentModel.name + '</p>');
					}
					else if(self.model.nodeType == 21){
						newLi.addClass('zTreeItemReport');
					}

					if(self.model.nodeType == 11 || self.model.nodeType == 21){
						var name = self.model.name;
						var findUsers = self.config.allUser.filter(function(model){
							return model.name == name;
						})
						if(findUsers.length > 0){
							var img = findUsers[0].img;
							img && newLi.find('>p').addClass('pImg').append('<img src="' + img + '" />'); 
						}
					}
					newLi.data(self.model);

					newLi.appendTo(ul);
				}
				else{
					btn.removeAttr('disabled').html(btnText);
					oc.dialog.tips('Add node fail:' + msg);
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
		console.log(model);
		setTimeout(cb, 2000);
	}

	self.moveNode = function(sourceId, targetId, cb){
		setTimeout(function(){
			cb(true);
		}, 2000);
	}

	self.sortNode = function(sourceId, targetId, cb){
		setTimeout(function(){
			cb(true);
		}, 2000);
	}

	self.render();
}

module.exports = TreeOriganization;