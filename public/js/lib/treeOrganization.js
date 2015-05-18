
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
			self.allUserName.push(model.fullName);
		})
	}

	self.render = function(){
		self.ele = $('<ul class="zTree zTreeOrganization"></ul>');
		var li = $('<li class="zTreeItem zTreeItemFolder"><p><span class="pName">海翼电商</span></p></li>');
		li.appendTo(self.ele);

		self._renderRecusive(self.config.data.children, li, 0);
		self.ele.find('>li>ul>li').removeAttr('draggable');
		self.ele.appendTo($(this.config.container));

		self.resetShowName();
		self._bindEvents();
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

			var li = $('<li class="zTreeItem" draggable="true" data-type="' + one.nodeType + '"><p><span class="pName">' + one.name + '</span></p></li>');
			
			if(one.nodeType === 30){ //虚拟节点，用来展示还未添加的人员信息
				li.removeAttr('draggable');
			}
			
			//二级节点（部门、汇报关系..)，或者部门节点-----
			if(one.nodeType == 10 || one.nodeType == 1 || one.nodeType == 2){
				li.addClass('zTreeItemFolder');
			}
			else if(one.nodeType == 21){ //汇报关系中的个人---------
				li.addClass('zTreeItemReport');
			}

			if(one.status !== 0){
				li.find('p').addClass('lineThrough');
			}
			if(one.childrenCount && one.nodeType === 21){ //汇报关系节点中显示直接汇报的下属人数---------
				li.find('p').append('<span class="treeCount">' + one.childrenCount + '</span>');
			}
			if(one.userCount && (one.nodeType === 1 || one.nodeType === 2) ){ //二级节点上显示下面不重复的总人数---------
				li.find('p').append('<span class="treeCountMember">' + one.userCount + '</span>');
			}
			li.appendTo(ul).data(one);

			if(one.children && one.children.length > 0){
				self._renderRecusive(one.children, li, level + 1);
			}
		}
		if(len > 0){
			ul.appendTo(ele);
		}
	}

	//设置节点显示的名称 ------
	self.resetShowName = function(){
		self.ele.find('li.zTreeItem>p').each(function(){
			var p = $(this);
			var li = p.parent();
			var model = li.data();
			if(!model || !model.nodeType){
				return true;
			}

			var nodeType = model.nodeType;

			if(nodeType === 10){ //部门信息------------
				var departmentId = model.name;
				var departmentModel = self.config.teamData.filter(function(one){
					return one.id == departmentId;
				});

				if(departmentModel.length == 0){
					li.html('<p><span class="pName">未知部门</span></p>');
				}
				else{
					departmentModel = departmentModel[0];
					model.addOn = departmentModel;
					p.find('.pName').html(departmentModel.name);
				}
			}
			else if(nodeType === 21 || nodeType === 11){//个人节点--------
				var name = li.data().name;
				var findUsers = self.config.allUser.filter(function(model){
					return model.name == name;
				})
				if(findUsers.length > 0){
					model.addOn = findUsers[0];
					p.find('.pName').html(findUsers[0].fullName);
				}
			}
		})
	}

	self.filter = function(keyword){
		self.removeFilterTag();
		if(!keyword){
            return;
        }
        keyword = keyword.toUpperCase();
        self.ele.find('.zTreeItem:gt(0)').removeClass('active').each(function(){
            var item = $(this);
            var name = item.find('>p>.pName').text().toUpperCase();
            if(name.indexOf(keyword) === 0){
                item.parents('.zTreeItem').addClass('active');
                item.addClass('treeSearch');
            }
        })
	}

	self.removeFilterTag = function(){
		self.ele.find('.treeSearch').removeClass('treeSearch');
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
		.on('dragenter', '.zTreeItemFolder>p>span, .zTreeItemReport>p>span', function(e){  //move in
			e.stopPropagation();
			e.preventDefault();
			var ele = $(this);
			var li = ele.parents('li:eq(0)');
			
			var source = self.dragEle.data();
			var target = li.data();

			var sourceId = source.id;
			var targetId = target.id;
			// if(target.nodeType != 21 && target.nodeType != 10){
			// 	return;
			// }
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
		.on('dragleave', '.zTreeItem>p>span', function(e){
			e.stopPropagation();
			self.timer && clearTimeout(self.timer);
			var ele = $(this).parents('li:eq(0)');
			
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
		var form = '<div class="formOrganization">' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off" value="' + li.find('>p>.pName').text() + '"></p>' + 
				'<div class="dialogBottom"><button class="btn btn-primary w100 mr20 btnSub">Save</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		if(self.model.nodeType === 10){
			form = '<div class="formOrganization">' + 
				'<a class="jsAddTeam" href="#">Add a team</a>' + 
				'<p class="mt10 divGroup"><span class="mt10">Name: </span><select class="slcDepartmentType form-control input-sm" name="departmentType" style="width:120px !important"></select><select class="slcDepartment form-control input-sm" name="name" style="width:280px !important"></select></p>' + 
				'<div class="dialogBottom"><button class="btn btn-primary w100 mr20 btnSub">Save</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		}
		
		oc.dialog.open('Edit', form);

		var dialog = $('.zDialog');
		if(self.model.nodeType === 10){ //部门-------
			var slcTeam = dialog.find('[name="name"]');
			var slcTeamType = dialog.find('[name="departmentType"]');

			self.config.teamData.map(function(model){
				slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
				if(model.type && slcTeamType.find('option:contains("' + model.type + '")').length === 0){
					slcTeamType.append('<option>' + model.type + '</option>');
				}
			});
			slcTeam.find('option[value="' + self.model.name + '"]').attr('selected', true);
			slcTeamType.find('option:contains("' + self.model.addOn.type + '")').attr('selected', true);
			slcTeamType.on('change', function(){
				slcTeam.html('');
				var slcVal = this.value;
				self.config.teamData.map(function(model){
					if(model.type == slcVal){
						slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
					}
				});
			})
		}

		if(self.model.nodeType !== 1 && self.model.nodeType !== 2){ //非一、二级节点-----
			oc.ui.autoComplete(dialog.find('[name="name"]'), self.allUserName);
		}
		else{
			var familyInfo = $('<p><span class="w100">Forbid Team:</span><input type="checkbox" name="forbidTeam" class="zToggleBtnSm"></p>' + 
							'<p class="mb10"><span class="w100">Allow Dup:</span><input type="checkbox" name="allowDup" class="zToggleBtnSm"></p>');
			dialog.find('.divPerson').prepend(familyInfo);
			dialog.find('[name="forbidTeam"]').prop('checked', self.model.forbidTeam === 1);
			dialog.find('[name="allowDup"]').prop('checked', self.model.allowDup === 1);

			oc.ui.toggleBtn('YES', 'NO');
		}

		dialog.on('click', '.btnSub', function(){
			var btn = $(this);

			if(!self.checkDialogName(dialog)){
				return false;
			}
			var addOn = null;
			if(self.model.nodeType === 21 || self.model.nodeType === 11){
				addOn = self.getUserByFullName(self.model.name);
				self.model.name = addOn.name;
			}
			else if(self.model.nodeType === 10){
				addOn = self.getTeamById(self.model.name);
			}

			btn.html('<i class="zLoadingIcon mr5"></i>').attr('disabled', true);
			if(self.model.nodeType === 1 || self.model.nodeType === 2){ //编辑family节点-------
				self.model.forbidTeam = $('[name="forbidTeam"]').prop('checked')? 1 : 0;
				self.model.allowDup = $('[name="allowDup"]').prop('checked')? 1 : 0;

				var putModel = {
					familyName: self.model.familyName,
					name: self.model.name,
					forbidTeam: self.model.forbidTeam,
					allowDup: self.model.allowDup
				}
				oc.ajax.put('/product/rest/v1/user_groups/family', putModel, function(res){
					oc.dialog.close();

					self.model.name = putModel.name;
					self.model.forbidTeam = putModel.forbidTeam;
					self.model.allowDup = putModel.allowDup;

					li.find('>p>.pName').html(self.model.name).data(self.model);
				}, function(res){
					oc.dialog.tips('Edit node fail:' + res.responseText);
					btn.removeAttr('disabled').html("Save");
				})

				return;
			}
			var putModel = $.extend(self.model, {});
			putModel.type && delete putModel.type;
			putModel.addOn && delete putModel.addOn;
			//编辑其他节点信息-------------------------
			self.updateNode(self.model, function(isOk, msg){
				if(isOk){
					oc.dialog.close();
					self.model.addOn = addOn;
					var pName = li.find('>p>.pName').html(addOn.fullName || addOn.name);
					if(addOn.img){
						pName.parent().addClass('pImg').append('<img src="' + img + '" />');
					}
					li.data(self.model);
				}
				else{
					btn.removeAttr('disabled').html("Save");
					oc.dialog.tips('Edit node fail:' + msg);
				}
			})
		})
		.on('click', '.jsAddTeam', function(e){
			e.preventDefault();
			self.showTeamPanel(function(teamModel){
				self.dialogEdit(li);
				$('.zDialogCover .slcDepartment').val(teamModel.id);
				$('.zDialogCover .departmentType').val(teamModel.type);
			});
		})
	}

	self.checkDialogName = function(dialog){
		var self = this;

		var eleName = dialog.find('[name="name"]:visible');
		self.model.name = $.trim(eleName.val());
		if(!self.model.name){
			oc.dialog.tips('Name is required');
			eleName.focus();
			return false;;
		}

		return true;
	}

	self.getUserByFullName = function(fullName){
		var finds = self.config.allUser.filter(function(user){
			return user.fullName == fullName;
		});

		if(finds.length > 0){
			return finds[0];
		}

		return null;
	}

	self.getTeamById = function(teamId){
		var finds = self.config.teamData.filter(function(team){
			return team.id == teamId;
		});

		if(finds.length > 0){
			return finds[0];
		}

		return null;
	}

	self.dialog = function(li){
		var form = '<div class="formOrganization">' + 
				'<a class="jsAddTeam" href="#">Add a team</a>' + 
				'<div class="p15"><p class="pType"><span>Type: </span><label class="mr30"><input type="radio" name="addType" value="person" checked style="margin-right:5px">人员</label><label><input name="addType" style="margin-right:5px" type="radio" value="group">团队</label></p>' + 
				'<p class="mt10 divPerson"><span>Name: </span><input type="text" class="form-control input-sm" name="name" autocomplete="off"></p>' + 
				'<p class="mt10 divGroup none"><span>Name: </span><select class="slcDepartmentType form-control input-sm" name="departmentType" style="width:120px !important"></select><select class="slcDepartment form-control input-sm" name="name" style="width:280px !important"></select></p>' + 
				'<div class="dialogBottom"><button class="btn btn-primary w100 mr20 btnSub">Add</button><button class="btn btn-default w100 ml20" onclick="oc.dialog.close();">Cancel</button></div>'
				'</div>';
		oc.dialog.open('Add', form);
		var dialog = $('.zDialog');
		var nodeData = li.data();
		self.model = {
			parentId: self.parentModel.id,
			familyName: self.parentModel.familyName
		};

		if(nodeData.nodeType == 2 || nodeData.nodeType == 21){ // 添加汇报关系中的个人节点---------------
			self.model.nodeType = 21;
			dialog.find('.pType, .divGroup, .jsAddTeam').remove();
		}

		if(!nodeData.nodeType){ //顶级节点----
			dialog.find('.pType, .jsAddTeam').remove();
			var familyInfo = '<p><span class="w100 mt10">Forbid Team:</span><input type="checkbox" name="forbidTeam" class="zToggleBtnSm"></p>' + 
							'<p><span class="w100 mt10 mb10">Allow Dup:</span><input type="checkbox" name="allowDup" class="zToggleBtnSm"></p>';
			dialog.find('.divPerson').prepend(familyInfo);
			oc.ui.toggleBtn('YES', 'NO');
		}
		else{
			oc.ui.autoComplete(dialog.find('.divPerson [name="name"]'), self.allUserName);
			var slcTeam = dialog.find('.divGroup [name="name"]');
			var slcTeamType = dialog.find('[name="departmentType"]');

			self.config.teamData.map(function(model){
				slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
				if(model.type && slcTeamType.find('option:contains("' + model.type + '")').length === 0){
					slcTeamType.append('<option>' + model.type + '</option>');
				}
			});

			slcTeamType.on('change', function(){
				slcTeam.html('');
				var slcVal = this.value;
				self.config.teamData.map(function(model){
					if(model.type == slcVal){
						slcTeam.append('<option value="' + model.id + '">' + model.name + '</option>');
					}
				});
			})

			dialog.on('change', '[name="addType"]', function(){
				if(this.value === 'group'){
					$('.divGroup').show();
					$('.divPerson').hide();
				}
				else{
					$('.divPerson').show();
					$('.divGroup').hide();
				}
			})
		}
		
		dialog.on('click', '.btnSub', function(){
			var btn = $(this);

			if(!self.checkDialogName(dialog)){
				return false;
			}

			//添加一个family -----------
			if(!nodeData.nodeType){
				self.model = {
					name: self.model.name,
					forbidTeam: $('[name="forbidTeam"]').prop('checked')? 1 : 0,
					allowDup: $('[name="allowDup"]').prop('checked')? 1 : 0
				}
				oc.ajax.post('/product/rest/v1/user_groups/family', self.model, function(res){
					var ul = li.find('>ul');
					if(ul.length === 0){
						ul = $('<ul></ul>').appendTo(li);
					}
					var newLi = $('<li class="zTreeItem zTreeItemFolder"><p><span class="pName">' + self.model.name + '</span><span class="treeCountMember">0</span></p></li>');
					self.model.familyName = res;
					self.model.forbidTeam === 0? self.model.nodeType = 1 : self.model.nodeType = 2;

					newLi.data(self.model);
					newLi.appendTo(ul);
					oc.dialog.close();
					oc.dialog.tips('Add success.');
				})

				return;
			}

			//设置nodeType---------------
			if(self.model.nodeType !== 2 && self.model.nodeType !== 21){
				var checkedType = $('[name="addType"]:checked').val();
				if(checkedType == "person"){
					self.model.nodeType = 11;
				}
				else{
					self.model.nodeType = 10;
				}
			}
			else{
				self.model.nodeType = 21;
			}

			var addOn = null;
			if(self.model.nodeType === 21 || self.model.nodeType === 11){
				addOn = self.getUserByFullName(self.model.name);
				self.model.name = addOn.name;
			}
			else{
				addOn = self.getTeamById(self.model.name);
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
					var newLi = $('<li class="zTreeItem" draggable="' + true + '" data-type="' + self.model.nodeType + '"><p><span class="pName">' + (addOn.fullName || addOn.name) + '</span></p></li>');
					if(self.model.nodeType == 10){
						newLi.addClass('zTreeItemFolder');
					}
					else if(self.model.nodeType == 21){
						newLi.addClass('zTreeItemReport');
						var eleCount = ul.parents('.zTreeItem:eq(0)').find('>p>.treeCount');
						var count = parseInt(eleCount.html())  || 0;
						eleCount.html(++count);
					}
					self.model.addOn = addOn;
					
					if(self.model.nodeType == 11 || self.model.nodeType == 21){
						var img = addOn.img;
						img && newLi.find('>p').addClass('pImg').append('<img src="' + img + '" />'); 
						var eleCount = ul.parents('.zTreeItem[data-type="1"], .zTreeItem[data-type="2"]').find('.treeCountMember');
						var count = parseInt(eleCount.html()) || 0;
						count++;
						eleCount.html(count);
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
		.on('click', '.jsAddTeam', function(e){
			e.preventDefault();
			self.showTeamPanel(function(teamModel){
				self.dialog(li);
				$('.zDialog [name="addType"]').get(1).checked = true;
				$('.zDialog .divGroup').fadeIn();
				$('.zDialog .divPerson').fadeOut();
				$('.zDialogCover .slcDepartment').val(teamModel.id);
			});
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

	self.showTeamPanel = function(){

	}

	self.render();
}

module.exports = TreeOriganization;