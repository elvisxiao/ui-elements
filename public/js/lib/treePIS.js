
var TreePIS = function(options){
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
		self.ele = $('<ul class="zTree"></ul>');
		var li = $('<li class="zTreeItem"><p>' + self.config.data.name + '</p></li>').data(self.config.data);
		li.appendTo(self.ele);
		
		self._renderRecusive(self.config.data.items, li, 0);
		$(this.config.container).find('.zTree').remove();
		$(this.config.container).append(self.ele);

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
			$('.treeRightContainer').removeClass('active');
			var p = $(this).parent().parent();
			var li = p.parent();
			var model = li.data();

			if(model.level < 4){
				p.addClass('zTreeEdit');
				p.html('<input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark"></i>');
				p.find('[name="name"]').val(model.name);
				p.find('[name="description"]').val(model.description);
			}
			else{
				if(model.level === 4){
					$.get("/product/rest/v1/pis/categories/" + model.id + "/singularities", function(res){
						console.log(res);
						self.parentLi = null;
						self.currentLi = li;
						var rightContaner = $('#treeRightContainer').addClass('active');
						rightContaner.find('[name="name"]').val(model.name);
						rightContaner.find('[name="itemDescription"]').val(model.description);

						rightContaner.find('[name="singularityName"]').each(function(i, ele){
							if(res.length <= i){
								return false;
							}
							var item = res[i];
							var nextIpt = $(ele).parent().next('td').find('input');
							ele.value = item.singularityName;
							ele.setAttribute('data-id', item.id);
							nextIpt.val(item.description);
						})
					})
				}
				else{
					var rightContaner = $('#treeRightContainer2').addClass('active');
				}
			}
		})
		.on('click', '.zTreeEdit input, .zTreeEdit i, .zTreeControl', function(e){
			e.stopPropagation();
		})
		.on('click', '.icon-checkmark', function(e){
			e.stopPropagation();
			var i = $(this);

			var li = i.parents('.zTreeItem:eq(0)');
			var model = li.data();
			if(!model || !model.id){
				model = {};
				var parentModel = li.parents('.zTreeItem:eq(0)').data()
				model.descendant = parentModel.id;
				// model.level = parseInt(parentModel.level) + 1;
			}
			model.categoryName = li.find('[name="name"]').val();
			model.description = li.find('[name="description"]').val();
			if(!model.categoryName){
				oc.dialog.tips('Name is required');
				li.find('[name="name"]').focus();
				return;
			}

			i.removeClass('icon-checkmark').addClass('zLoadingIcon');
			li.removeClass('zTreeItemDes');
			
			var clearEditStatus = function(isOK){
				if(isOK === false){
					i.removeClass('zLoadingIcon').addClass('icon-checkmark');
					return;
				}
				li.parents('.zTreeItem').addClass('hasMore');
				li.data(model).find('>p').html(model.categoryName).removeClass('zTreeEdit zTreeAdd');
				if(model.description){
					li.addClass('zTreeItemDes').find('p').attr('title', model.description);
				}
			}
			model.id? self.updateNode(model, clearEditStatus) : self.addNode(model, clearEditStatus)
			
		})
		.on('click', '.icon-plus2', function(e){
			e.stopPropagation();
			$('.treeRightContainer').removeClass('active');
			var li = $(this).parents('.zTreeItem:eq(0)').addClass('active');

			var data = li.data();
			if(data.level < 3){
				var ul = li.find('>ul');
				if(ul.length === 0){
					ul = $('<ul></ul>').appendTo(li);
				}
				var newLi = $('<li class="zTreeItem"></li>');
				newLi.append('<p class="zTreeEdit zTreeAdd"><input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="description"><i class="iconRight icon-checkmark"></i></p>');
				newLi.appendTo(ul);
			}
			else{
				self.currentLi = null;
				self.parentLi = li;
				if(data.level === 3){
					$('#treeRightContainer').addClass('active').find('input').val('');
				}
				else{
					var rightContaner = $('#treeRightContainer2').addClass('active');
					rightContaner.find('input').val('');
					$.get('/product/rest/v1/pis/categories/' + data.id + '/segments', function(segments){
						var slcSigment = $('[name="sigment"]');
						segments.map(function(item){
							slcSigment.append('<option value="' + item.id + '">' + item.segmentDescription + '</option>')
						})
						$.get("/product/rest/v1/pis/categories/" + data.id + "/singularities", function(res){
							console.log(data)
							rightContaner.find('#categoryName').html(data.name).attr('data-id', data.id);
							var slcSingularity = rightContaner.find('[name="singularity"]').html('');
							res.map(function(item){
								slcSingularity.append('<option value="' + item.segmentId + '">' + item.singularityCode + '-'+ item.singularityName + '</option>');
							})
						})
					})
					
				}		
			}
		});
		
		self.initRightForm();
	}

	self.initRightForm = function(){
		var addSubForm = $('#treeRightContainer form');
		addSubForm.submit(function(){
			var model = {
				category: {
					categoryName: $('[name="name"]').val(),
					description: $('[name="itemDescription"]').val()
				},
				singularities: []
			};
			
			addSubForm.find('[name="singularityName"]').each(function(){
				var nextIpt = $(this).parent().next('td').find('input');
				var one = {
					singularityName : this.value,
					description     : nextIpt.val(),
					singularityCode : model.singularities.length
				}

				if(!self.parentLi){
					one.id = this.getAttribute('data-id');
				}

				model.singularities.push(one);
			})

			if(self.parentLi){ //add new
				model.category.descendant = self.parentLi.data().id;
				oc.ajax.post('/product/rest/v1/pis/categories/subcategory', model, function(res){
					var nodeModel = {
						id: res,
						fid: model.category.descendant,
						name: model.category.categoryName,
						description: model.category.description
					}

					var ul = self.parentLi.find('ul:eq(0)');
					if(ul.length === 0){
						ul = $('<ul></ul>').appendTo(self.parentLi);
					}
					var newLi = $('<li class="zTreeItem zTreeItemDes"><p title="' + nodeModel.description + '">' + nodeModel.name + '</p></li>').appendTo(ul);
					newLi.data(nodeModel);
					self.parentLi.addClass('hasMore');
				})
			}
			else{ //update
				oc.ajax.put('/product/rest/v1/pis/categories/subcategory/' + self.currentLi.data().id, model, function(res){
					oc.dialog.tips('Update success.');
					$('.treeRightContainer').removeClass('active').find('input').val('');
					var nodeModel = self.currentLi.data();
					nodeModel.name = model.category.categoryName;
					nodeModel.description = model.category.description;

					self.currentLi.find('>p').html(nodeModel.name).attr('title', nodeModel.description);
					self.currentLi.data(nodeModel);
				})
			}
			
			return false;
		})
		
		var addSubForm2 = $('#treeRightContainer2 form');
		addSubForm2.submit(function(){
			var model = {};
			model.categoryId = addSubForm2.find('#categoryName').attr('data-id');
			// model.segmentText = addSubForm2.find('#categoryName').html();
			
			model.singularityId = addSubForm2.find('select[name="singularity"]').val();
			model.singularityText = addSubForm2.find('select[name="singularity"]').find(':selected').text().slice(2);
			
			model.countryCodeId = addSubForm2.find('select[name="country"]').val();
			model.countryCodeText = addSubForm2.find('select[name="country"]').find(':selected').text();
			
			model.colorCodeId = addSubForm2.find('select[name="color"]').val();
			model.colorCodeText = addSubForm2.find('select[name="color"]').find(':selected').text();
			
			oc.ajax.post('/product/rest/v1/pis/structure', model, function(res){
				console.log(res);
				self.parentLi.addClass('hasMore active');
				var ul = self.parentLi.find('>ul');
				if(ul.length === 0){
					ul = $('<ul></ul>').appendTo(self.parentLi);
				}
				var newLi = $('<li><p>' + res + '</p></li>').appendTo(ul);
				newLi.data(res);
			})

			return false;
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

	self.render();
}

module.exports = TreePIS;