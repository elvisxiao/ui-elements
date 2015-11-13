
var TreePIS = function(options){
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
			var li = $('<li class="zTreeItem" draggable="true" data-level="' + one.level + '"><p>' + one.name + '</p></li>');
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
			var p = $(this);
			$('<span class="zTreeControl"><i class="icon-plus2" title="Add"></i><i class="icon-cog" title="Setting"></i><i class="icon-align-justify" title="Show MN list"></i></span>').hide().appendTo(this).fadeIn(1000);
			if(p.hasClass('zTreeAdd')){
				p.find('.icon-align-justify').removeClass('icon-align-justify').addClass('icon-minus2');
			}
		})
		.on('mouseleave', '.zTreeItem p', function(){
			$(this).find('.zTreeControl').remove();
		})
		.on('click', '.icon-cog', function(e){
			e.stopPropagation();
			$('.treeRightContainer').removeClass('active');
			var p = $(this).parent().parent();
			var li = p.parent();
			var model = li.data();
			
			if(model.level < 4){
				p.addClass('zTreeEdit');
				p.html('<input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="category, separate by dot or space"><i class="iconRight icon-checkmark" title="Save"></i>');
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
						rightContaner.find('#aEditSubCategory').show();
						rightContaner.find('.trBtns').hide();

						rightContaner.find('[name="singularityName"]').each(function(i, ele){
							var nextIpt = $(ele).parent().next('td').find('input');
                            if(res.length <= i){
                            	ele.value = "";
                                ele.removeAttribute('data-id');
                                nextIpt.val("");
                            }else{
                            	var item = res[i];
                                ele.value = item.singularityName;
                                ele.setAttribute('data-id', item.id);
                                nextIpt.val(item.description);
                            }
						})

						rightContaner.find('.form-control').attr('disabled', true);
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
				if(!model.level){
					model.level = parseInt(parentModel.level) + 1;
				}
				model.name = model.categoryName;
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
				newLi.append('<p class="zTreeEdit zTreeAdd"><input type="text" name="name" placeholder="name"><input type="text" name="description" placeholder="description"><i class="iconRight icon-checkmark" title="Save"></i></p>');
				newLi.appendTo(ul);
			}
			else{
				self.currentLi = null;
				self.parentLi = li;
				if(data.level === 3){
					var rightContaner = $('#treeRightContainer');
					rightContaner.addClass('active').find('input').removeAttr('disabled').val('');
					rightContaner.find('#aEditSubCategory').hide();
					rightContaner.find('.trBtns').show();
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


			var btn = addSubForm.find('button[type="submit"]').html('<i class="zLoadingIcon"></i>').attr('disabled', true);
			if(self.parentLi){ //add new
				model.category.descendant = self.parentLi.data().id;
				oc.ajax.post('/product/rest/v1/pis/categories/subcategory', model, function(res){
					btn.html('Save').removeAttr('disabled');
					oc.dialog.tips('Add success.');
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
				}, function(res){
					oc.dialog.tips('Update failed:' + res.responseText);
					btn.html('Save').removeAttr('disabled');
				})
			}
			else{ //update
				oc.ajax.put('/product/rest/v1/pis/categories/subcategory/' + self.currentLi.data().id, model, function(res){
					btn.html('Save').removeAttr('disabled');
					oc.dialog.tips('Update success.');
					$('.treeRightContainer').removeClass('active').find('input').val('');
					var nodeModel = self.currentLi.data();
					nodeModel.name = model.category.categoryName;
					nodeModel.description = model.category.description;

					self.currentLi.find('>p').html(nodeModel.name).attr('title', nodeModel.description);
					self.currentLi.data(nodeModel);
				}, function(res){
					oc.dialog.tips('Update failed:' + res.responseText);
					btn.html('Save').removeAttr('disabled');
				})
			}
			
			return false;
		})
		
		var addSubForm2 = $('#treeRightContainer2 form');
		addSubForm2.submit(function(){
			var model = {};
			model.subCategoryId = addSubForm2.find('#categoryName').attr('data-id');
			model.segmentId = addSubForm2.find('select[name="sigment"]').val();
			model.segmentText = addSubForm2.find('select[name="sigment"]').find(':selected').text();
			
			model.singularityId = addSubForm2.find('select[name="singularity"]').val();
			model.singularityText = addSubForm2.find('select[name="singularity"]').find(':selected').attr('data-id');
			
			model.countryCodeId = addSubForm2.find('select[name="country"]').val();
			model.countryCodeText = addSubForm2.find('select[name="country"]').find(':selected').attr('data-code');
			
			model.colorCodeId = addSubForm2.find('select[name="color"]').val();
			model.colorCodeText = addSubForm2.find('select[name="color"]').find(':selected').attr('data-code');
			
			oc.ajax.post('/product/rest/v1/pis/structure', model, function(res){
				console.log(res);
				oc.dialog.tips('Add success, MN is:<b>' + res.text + '</b>', 3000);
				$('#treeRightContainer2').removeClass('active');
				window.open('/product/index.htm?mo=good&sku_add=' + res.text);
				// window.open('http://pre-launch.oceanwing.com/product/index.htm?mo=good&sku_add=A1109009');
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