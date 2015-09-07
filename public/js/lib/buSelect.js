var dropdown = require('./dropdown');

var BUSelect = function(options){
	this.config = {
		container: 'body',
		dataList: null,
		limited: null,
        showLevel: null,
		onlyLast: false //禁止选中非末级几点
	};
	
	this.ele = null;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}
	
	$(this.config.container).addClass('buSlc');
	var self = this;

	self.formatData = function(){
        var rootTree = {
            "id"          : 1,
            "fid"         : 0,
            "items"    : [],
            "name"        : "PIS",
            "description" : "",
            "level"       : 1
        };

        var treeMap = {};
        treeMap[1] = rootTree;

        self.config.dataList.map(function(relation){
            var fid = relation["ancestor"];
            fTree = treeMap[fid];
            if(!fTree || !fTree.level){
                return true;
            }
            var tree = {
                "id"          : relation["descendant"],
                "fid"         : fid,
                "items"       : [],
                "name"        : relation["categoryName"],
                "description" : relation["description"],
                "level"       : fTree["level"] + 1,
                "segments"    : relation["segments"],
            };
            fTree["items"].push(tree);
            treeMap[tree["id"]] = tree;
        })

        self.treeData = rootTree;
        console.log('format data', rootTree);
    }

	self.initSelect = function(){
        var div = $('<div class="mixSelectWrap"><p><input class="form-control zIpt" type="text" placeholder="Search here ..." /></p></div>');

        self.renderTree(self.treeData, div, 0);

        self.dropdownText = div[0].outerHTML;

        self.bindEvents();
    },

    self.renderTree = function(dataList, ele, level){
        if(!dataList || (self.config.showLevel && level > self.config.showLevel)){
            return;
        }

        var ul = $('<ul></ul>');

        if(dataList && dataList.length === undefined){ 
            self.renderTree(dataList.items, ul, 1);

            ul.appendTo(ele);

            return;
        }
        
        var len = dataList.length;

        for(var i = 0; i < len; i++){
            var one = dataList[i];

            var li = $('<li><p style="padding-left: ' + level * 15 + 'px" data-id="' + one.id + '">' + one.name + '</p></li>');
            
            li.appendTo(ul);

            if(one.items && one.items.length > 0){
                this.renderTree(one.items, li, level + 1);
            }
        }

        if(ul.find('li').length > 0){
        	ul.appendTo(ele);
            //非最后一级节点不允许选择 -----
            if(self.config.onlyLast){
            	ul.prev('p').addClass('disabled');
            }
        }
    }
	
	self.getResult = function(){
        var ret = [];
        $(self.config.container).find('.zBadge').each(function(){
            var badge = $(this);
    
            ret.push( parseInt(badge.attr('data-id')) );
        })

        return ret;
    }

    self.getResultModels = function(){
        var ids = this.getResult();

        var models = [];
        
        self.config.dataList.map(function(one){
            if($.inArray(one.descendant, ids) !== -1){
                models.push(one);
            }
        })

        return models;
    }

    self.setResult = function(list, disabled){
        var repoItem = $(self.config.container).html('');
        if(! (list && list.length) ){
            return;
        }

        for(var i = 0; i < list.length; i ++){
            var one = list[i];
            repoItem.append('<label class="zBadge" data-id="' + one.id + '"><i class="icon-cancel-circle"></i>' + one.name + '</label>');
        }

        if(disabled){
            repoItem.find('.zBadge .icon-cancel-circle').remove();
        }
    }

    self.bindEvents = function(){
        var repoItem = $(self.config.container);
        repoItem.on('click', '.zBadge .icon-cancel-circle', function(e){
            e.stopPropagation();
            $(this).parent().remove();
        })
        .on('click', function(e){
            e.stopPropagation();
            dropdown.remove(repoItem);
            var drop = dropdown.show(this, '', self.dropdownText);
            
            var ul = drop.find('.mixSelectWrap>ul');
            repoItem.find('.zBadge').each(function(){
                var badge = $(this);
                var id = this.getAttribute('data-id');
                var p = ul.find('p[data-id="' + id + '"]').addClass('active').data('target', badge);
                p.parent().find('>ul').hide();
            })

            drop.on('click', 'ul li p:not(.disabled)', function(e){
                var p = $(this);
                if(p.hasClass('active')){
                    p.removeClass('active').data('target').remove();
                    p.data('target', null);
                    p.parent().find('>ul').show();
                }
                else{
                    p.addClass('active');
                    var label = $('<label class="zBadge" data-id="' + p.attr('data-id') + '"><i class="icon-cancel-circle"></i>' + p.html() + '</label>');
                    label.appendTo(repoItem);
                    p.data('target', label);
                    p.parent().find('>ul').hide().find('p').each(function(){
                        var one = $(this).removeClass('active');
                        one.data('target') && one.data('target').remove();
                        one.data('target', null);
                    })

                    if(self.config.limited > 0){
                        var len = repoItem.find('.zBadge').length;
                        
                        if(len - self.config.limited > 0){
                            repoItem.find('.zBadge:eq(' + (len - 2) + ')').remove();
                        }

                        dropdown.remove(repoItem);
                    }
                }
            })
            .on('input', '.zIpt', function(){
                var val = $.trim(this.value).toUpperCase();

                drop.find('ul p').hide().each(function(){
                    var oneNode = $(this);
                    if(oneNode.html().toUpperCase().indexOf(val) !== -1){
                        oneNode.show();
                        oneNode.parents('li').find('>p').show();
                    }
                })
            })
        })

        $('body').off('click', '.zDropdown').on('click', '.zDropdown', function(e){
            e.stopPropagation();
        })

        $('body').on('click', function(){
            dropdown.remove(repoItem);
        })
    }

	self.formatData();
	self.initSelect();
}

module.exports = BUSelect;