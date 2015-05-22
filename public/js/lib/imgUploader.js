var ImgUploader = function(options){
	this.config = {
		container: 'body'
	};
	this.ele = null;     //jquery对象，最外层
	this.canvas = null;  //canvas元素
	this.ctx = null;   //canvas.getContext();
	this.img = null;   //当前的图片
	this.filter = null;    //Jquery对象，裁剪框
	this.currentScale = 1;  //当前放大倍数
	this.scaleRate = 1.1;  //放大系数

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	var self = this;

	self.render = function(){
		self.ele = $('<div class="zImgUploader"></div>');
		var wrap = $('<div class="zImgUploaderWrap"></div>').appendTo(self.ele);
		wrap.append('<canvas class="zImgUploaderCanvas"></canvas>');
		wrap.append('<span class="zImgUploaderFilter none"><i class="zCutDown"></i><i class="zCutLeft"></i><i class="zCutRight"></i><i class="zCutUp"></i></span>');
		self.ele.append('<div class="zImgUploaderControl tc"><input type="file"><button class="btn btn-primary">Submit</button><button class="btn btn-warning btnToCut">Cut Image</button><button class="btn btn-info none btnCut">Cut</button></div>');
		

		self.canvas = self.ele.find('canvas')[0];
		self.ctx = self.canvas.getContext('2d');
		self.img = new Image();
		self.filter = self.ele.find('.zImgUploaderFilter');

		self.ele.appendTo(self.config.container);

		
		self.bindEvents();
	}

	self.showCut = function(){

	}

	self.bindEvents = function(){
		self.downWidth = self.filter.width();
        self.downHeight = self.filter.height();
        self.downLeft = self.filter.position().left;
        self.downTop = self.filter.position().top;
        self.downPosition = {};

        var reader = new FileReader();

		self.ele.on('change', 'input[type="file"]', function(){
			var file = this.files[0];
            if(!/image\/.*/.test(file.type)){
                oc.dialog.tips('Only image file is accept');
                return;
            }

            reader.onload = function(e){
                self.img.src = this.result;
                self.drawImage();
            }

            reader.readAsDataURL(file);
		})
		.on('click', '.btnToCut', function(){
			self.ele.find('.btnCut, .zImgUploaderFilter').show();
			$(this).addClass('none');
		})
		.on('mousedown', '.zImgUploaderFilter', function(e){
			if(e.which === 1){
                self.downPosition = e.originalEvent;
                downLeft = self.filter.position().left;
                downTop = self.filter.position().top;
                console.log('begin move');
                $(document).off('mousemove');
                $(document).on('mousemove', function(e){
                	console.log('222');
                	self.moveFilter(e);
                });
            }
            else{
            	console.log('off move');
                $(document).off('mousemove');
            }
		})
		.on('mousedown', '.zImgUploaderFilter i', function(e){
			e.stopPropagation();
            self.downWidth = self.filter.width();
            self.downHeight = self.filter.height();
            self.downLeft = self.filter.position().left;
            self.downTop = self.filter.position().top;

            var ele = $(this);
            if(e.which === 1){
                self.downPosition = e.originalEvent;
                $(document).off('mousemove');
                $(document).on('mousemove', function(e){
                    self.moveFilterIcon(e, ele);
                });
            }
            else{
            	console.log('off move');
                $(document).off('mousemove');
            }
		})

		$(document).on('mouseup', function(){
			console.log('mouseUp');
            // $(document).off('mousemove');
        })

		var eleFilter = self.filter[0];
		eleFilter.onmousewheel = eleFilter.onwheel = self.canvas.onmousewheel = self.canvas.onwheel = function(event){//chrome firefox浏览器兼容
            event.preventDefault();
            event.wheelDelta = event.wheelDelta? event.wheelDelta : (event.deltaY * (-40));
            if(event.wheelDelta > 0){
                self.currentScale = self.currentScale * self.scaleRate;
                self.drawImage(false, self.scaleRate);
            }
            else{
                self.currentScale = self.currentScale * 1.0 / self.scaleRate;
                self.drawImage(false, 1.0 / self.scaleRate);
            }
        }
	}

	self.drawImage = function(isCut, scale){
        self.canvas.width = self.img.width;
        self.canvas.height = self.img.height;
        if(isCut){
            self.canvas.width = self.filter.width();
            self.canvas.height = self.filter.height();
        }

        if(scale){
            self.canvas.width = self.canvas.width * scale;
            self.canvas.height = self.canvas.height * scale;
            self.img.width = self.canvas.width;
            self.img.height = self.canvas.height;
        }
        
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        if(isCut){
            self.canvas.width = self.canvas.width / self.currentScale;
            self.canvas.height = self.canvas.height / self.currentScale;
    	
            self.ctx.drawImage(self.img, self.filter.position().left / self.currentScale, self.filter.position().top / self.currentScale, self.canvas.width, self.canvas.height, 0, 0, self.canvas.width, self.canvas.height);

            var image = self.canvas.toDataURL("image/png");  
            self.img.src = image;
            self.img.width = self.canvas.width;
            self.img.height = self.canvas.height;

            self.ele.find('.btnCut, .zImgUploaderFilter').hide();
            self.ele.find('.btnToCut').show();
        }
        else{
            self.ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height);
        }
    }

    self.moveFilter = function(e){
    	console.log('mouse move');
    	var currentPosition = e.originalEvent;
   		
        var left = downLeft + currentPosition.clientX - self.downPosition.clientX;
        var top = downTop + currentPosition.clientY - self.downPosition.clientY;
        if(left < 0){
            left = 0;
        }
        if(top < 0){
            top = 0;
        }
        self.filter.css({
            left: left,
            top: top,
        })
    }

    self.moveFilterIcon = function(e, i){
    	console.log('mouse move');
    	e.stopPropagation();

        var currentPosition = e.originalEvent;
        var ele = $(i);
        var parent = ele.parent();
        
        var addWidth = currentPosition.clientX - self.downPosition.clientX;
        var addHeight = currentPosition.clientY - self.downPosition.clientY;

        var width = self.downWidth + self.addWidth;
        var height = self.downHeight + self.addHeight;

        if(i.hasClass('zCutRight')){
            parent.css({
                width: width
            })
        }
        else if(i.hasClass('zCutLeft')){
            parent.css({
                left: self.downLeft + self.addWidth,
                width: downWidth - addWidth
            })
        }
        else if(i.hasClass('zCutUp')){
            parent.css({
                top: self.downTop + addHeight,
                height: self.downHeight - addHeight
            })
        }
        else if(i.hasClass('zCutDown')){
            parent.css({
                height: height
            })
        }
    }

    self.render();
}

module.exports = ImgUploader;