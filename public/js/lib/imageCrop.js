/** 
* @file 前端图片裁剪预览
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* 前端图片裁剪预览
* @class ImageCrop
* @constructor
* @param {object} options 配置变量对象：<br /> container为容器对象
* @example
* var imageCrop = new ImageCrop({
    container: '#container'
})
*/
var ImageCrop = function(options){
	/** @memberof ImageCrop */

    /** @property {object} options 配置变量对象：<br /> container为容器对象, remoteImg: 初始化时，加载远程图片 */
    this.config = {
		container: 'body',
        remoteImg: 0,
        height: 500,
	};

    /** @property {object} ele - 最外层Jquery对象 */
	this.ele = null;  

    /** @property {object} canvas - canvas元素 */
	this.canvas = null;

    /** @property {object} ctx - canvas.getContext()的返回值 */
	this.ctx = null;   

    /** @property {object} img - 当前的图片 */
	this.img = null;   

    /** @property {object} filter - Jquery对象，裁剪框 */
	this.filter = null;   

    /** @property {number} scaleHeight - 未放大或者缩小的初始高度 */
	this.scaleHeight = 0; 

    /** @property {number} scaleWidth - 未放大或者缩小的初始宽度 */
	this.scaleWidth = 0; 


	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

    var self = this;

    /** @method _render 初始化界面
    *@memberof ImageCrop 
    *@instance
    */
	self.render = function(){
		self.ele = $('<div class="zImageCrop"></div>');
        if(self.config.height) {
            self.ele.css({
                'min-height': self.config.height + 'px',
                height: self.config.height + 'px'
            })
        }
		var wrap = $('<div class="zImageCropWrap"></div>').appendTo(self.ele);
		wrap.append('<canvas class="zImageCropCanvas"></canvas>');
        wrap.append('<span class="zImageCropCover zImageCropCoverTop"></span>');
        wrap.append('<span class="zImageCropCover zImageCropCoverRight"></span>');
        wrap.append('<span class="zImageCropCover zImageCropCoverLeft"></span>');
        wrap.append('<span class="zImageCropCover zImageCropCoverBottom"></span>');
		wrap.append('<span class="zImageCropFilter"><i class="zCutDown"></i><i class="zCutLeft"></i><i class="zCutRight"></i><i class="zCutUp"></i></span>');
		self.ele.append('<div class="zImageCropControl"><span class="iptFile"><input type="file" accept="image/*">Open</span><span class="zCutRange"><b>－</b><input type="range" min="50" max="500" step="1"><b>＋</b><span class="zRangePercent">0%</span></span><span class="zCutImageSize">0 × 0</span><button class="btnCut">Cut</button></div>');
        self.ele.append('<h3 class="zImageCropDropInfo mt50">Drop image here</h3>');
		self.canvas = self.ele.find('canvas')[0];
		self.ctx = self.canvas.getContext('2d');
		self.img = new Image();
		self.filter = self.ele.find('.zImageCropFilter');

		self.ele.appendTo(self.config.container);

        if(self.config.remoteImg){
            self.readFile(self.config.remoteImg);
        }

		self.bindEvents();
	}

    /** 
    * 支持拖拽更换图片
    * @method supportDrop 
    * @memberof ImageCrop 
    * @instance
    */
    self.supportDrop = function(){
        self.ele.on('dragover', function(e){
            e.stopPropagation();    
            e.preventDefault();
        })
        .on('dragenter', function(e){
            e.stopPropagation();    
            e.preventDefault();
            self.ele.addClass('zImageCropDrag');
        })
        .on('dragleave', function(e){
            e.stopPropagation();    
            e.preventDefault();
            self.ele.removeClass('zImageCropDrag');
        })

        self.ele.on('drop', function(e){
            e.stopPropagation();    
            e.preventDefault();
            self.ele.removeClass('zImageCropDrag');
            var file = e.originalEvent.dataTransfer.files;
            self.readFile(file[0]);
        })
    }

    self.getImage = function() {
        return self.img;
    }

    /** 
    * 图片加载完成后显示该图片
    * @method imgLoaded 
    * @memberof ImageCrop 
    * @instance
    */
    self.imgLoaded = function(){
        self.ele.find('.zImageCropDropInfo').hide();
        self.ele.find('.zImageCropFilter').css('display', 'block');
        self.drawImage();
        self.scaleWidth = self.img.width;
        self.scaleHeight = self.img.height;

        self.ele.find('.zCutImageSize').html(self.img.width + ' × ' + self.img.height);
        var min = self.ele.width() * 100 / self.img.width;
        if(min > 100) {
            min = 100;
        }
        var max = min * 10;
        var iptRange = self.ele.find('.zCutRange input').attr({min: min, max: max}).val(100);
        self.ele.find('.zRangePercent').html(parseInt(iptRange.val()) + '%');
    }
    /** 
    * 通过FileReader读取文件内容
    * @method readFile 
    * @param {object} file - 需要读取的文件对象
    * @memberof ImageCrop 
    * @instance
    */
    self.readFile = function(file){
        var reader = new FileReader();


        reader.onload = function(e){
            self.img.src = this.result;
            self.imgLoaded();
        }

        if(typeof file === 'object'){
            if(!/image\/.*/.test(file.type)){
                if(window.oc){
                    oc.dialog.tips('Only image file is accept');
                }
                else{
                    alert('Only image file is accept');
                }
                return;
            }

            reader.readAsDataURL(file);
        }
        else{  //远程图片
            // self.img = new Image();
            self.img.src = file;
            self.img.onload = self.imgLoaded;
        }
        
    }

    /**
    * 事件绑定相关
    * @method bindEvents 
    * @memberof ImageCrop 
    * @instance
    */
	self.bindEvents = function(){
		self.downWidth = self.filter.width();
        self.downHeight = self.filter.height();
        self.downLeft = self.filter.position().left;
        self.downTop = self.filter.position().top;
        self.downPosition = {};
        
        var reader = new FileReader();
        
        self.supportDrop();
		self.ele.on('change', 'input[type="file"]', function(){
            self.readFile(this.files[0]);
        })
        .on('input', '.zImageCropControl input[type="range"]', function(){
            self.ele.find('.zImageCropControl .zRangePercent').html(parseInt(this.value) + '%');
            self.range();
        })
        .on('click', '.zImageCropControl b', function(){
            var range = parseInt(self.ele.find('.zImageCropControl .zRangePercent').html());
            var iptRange = self.ele.find('input[type="range"]');
            var min = parseFloat(iptRange.attr('min'));
            var max = parseFloat(iptRange.attr('max'));
            if(this.innerHTML === '－'){
                range -= 10;
                (range < min) && (range = min);
            }
            else{
                range += 10;
                (range > max) && (range = max);
            }
            self.ele.find('.zImageCropControl .zRangePercent').html(parseInt(range) + '%');
            self.ele.find('.zImageCropControl input[type="range"]').val(range);
            self.range();
        })
        .on('click', '.btnCut', self.cutImage)
		.on('mousedown', '.zImageCropFilter', function(e){
			if(e.which === 1){
                self.downPosition = e.originalEvent;
                downLeft = self.filter.position().left;
                downTop = self.filter.position().top;
       
                $(document).off('mousemove');
                $(document).on('mousemove', function(e){
                	self.moveFilter(e);
                });
            }
            else{
            	console.log('off move');
                $(document).off('mousemove');
            }
		})
		.on('mousedown', '.zImageCropFilter i', function(e){
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
            $(document).off('mousemove');
        })
	}

    /** 使用Canvas绘制图片
    * @method drawImage 
    * @memberof ImageCrop 
    * @instance
    */
	self.drawImage = function(){
        if(!self.img.src){
            return;
        }
        self.canvas.width = self.img.width;
        self.canvas.height = self.img.height;
        $(self.canvas).parent().css({
            'margin-left': self.canvas.width / -2.0,
            'margin-top': self.canvas.height / -2.0,
        });
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        self.ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height);
        self.resetFilter();
        self.resetCover();
    }

    /** 放大或者缩小图片
    * @method range 
    * @memberof ImageCrop 
    * @instance
    */
    self.range = function(){
        var rangeVal = self.ele.find('.zImageCropControl input[type="range"]').val();
        self.canvas.width = self.scaleWidth * rangeVal / 100.0;
        self.canvas.height = self.scaleHeight * rangeVal / 100.0;

        $(self.canvas).parent().css({
            'margin-left': self.canvas.width / -2.0,
            'margin-top': self.canvas.height / -2.0,
        });
        self.ctx.drawImage(self.img, 0, 0, self.canvas.width, self.canvas.height);
        self.resetFilter();
        self.resetCover();
    }

    /** 根据选择框进行图片裁剪
    * @method cutImage 
    * @memberof ImageCrop 
    * @instance
    */
    self.cutImage = function(){
        if(!self.img.src){
            return;
        }

        var currRange = self.ele.find('.zImageCropControl input[type="range"]').val() / 100;
        var width = self.filter.outerWidth();
        var height = self.filter.outerHeight();
        self.canvas.width = width;
        self.canvas.height = height;

        $(self.canvas).parent().css({
            'margin-left': self.canvas.width / -2.0,
            'margin-top': self.canvas.height / -2.0,
        });
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        self.ctx.drawImage(self.img, self.filter.position().left / currRange, self.filter.position().top / currRange, 
           width / currRange, height / currRange, 0, 0, width, height);

        self.resetFilter();
        self.resetCover();
        
        self.ele.find('.zImageCropCover').css({
            width: 0,
            height: 0
        });
        var iptRange = self.ele.find('.zImageCropControl input[type="range"]').val(100);
        self.ele.find('.zImageCropControl .zRangePercent').html(parseInt(iptRange.val()) + '%');
        self.ele.find('.zImageCropControl .zCutImageSize').html(width + ' × ' + height);
        self.scaleWidth = width / currRange;
        self.scaleHeight = height / currRange;
        self.img.src = self.canvas.toDataURL("image/png"); 
    }

    /** 移动选择框时的处理函数
    * @method moveFilter 
    * @memberof ImageCrop 
    * @instance
    */
    self.moveFilter = function(e){
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
            top: top
        })
        // self.resetFilter();

        self.resetCover();
    }

    /** 
    * 裁剪图片后，重置选择框的位置到初始状态
    * @method resetFilter 
    * @memberof ImageCrop 
    * @instance
    */
    self.resetFilter = function(){
        var parent = $(self.canvas).parent();
        var left = parseInt(parent.css('margin-left')) + self.ele.width() / 2;
        var right = self.ele.width() - self.canvas.width - left;
        var top = parseInt(parent.css('margin-top')) + self.ele.height() / 2;
        var bottom = self.ele.height() - self.canvas.height - top;

        left < 0? (left *= -1) : (left = 0);
        right < 0? (right *= -1) : (right = 0);
        bottom < 0? (bottom *= -1) : (bottom = 0);
        top < 0? (top *= -1) : (top = 0);

        self.filter.css({
            width: 'auto',
            height: 'auto',
            left: left,
            right: right,
            top: top,
            bottom: bottom
        })
    }

    /**
    * 裁剪图片后，重置遮罩框的位置到初始状态
    * @method resetCover 
    * @memberof ImageCrop 
    * @instance
    */
    self.resetCover = function(){
        var position = self.filter.position();

        self.ele.find('.zImageCropCoverTop').css({
            height: position.top,
            width: '100%',
            left: 0,
            top: 0
        });
        self.ele.find('.zImageCropCoverBottom').css({
            height: self.canvas.height - position.top - self.filter.height() - 2,
            width: '100%',
            bottom: '2px',
            left: 0
        });
        self.ele.find('.zImageCropCoverRight').css({
            width: self.canvas.width - self.filter.width() - position.left,
            height: self.filter.height() + 2,
            top: position.top,
            right: 0
        });
        self.ele.find('.zImageCropCoverLeft').css({
            width: position.left,
            height: self.filter.height() + 2,
            top: position.top,
            left: 0
        });
    }

    /** 
    * 拖动改变裁剪框大小
    * @method moveFilterIcon 
    * @memberof ImageCrop 
    * @instance
    */
    self.moveFilterIcon = function(e, i){
    	
    	e.stopPropagation();

        var currentPosition = e.originalEvent;
        var ele = $(i);
        var parent = ele.parent();
        // console.log(currentPosition.clientX - self.downPosition.clientX);
        var addWidth = currentPosition.clientX - self.downPosition.clientX;
        var addHeight = currentPosition.clientY - self.downPosition.clientY;

        var width = self.downWidth + addWidth;
        var height = self.downHeight + addHeight;

        var canvasParent = $(self.canvas).parent();
        var left = parseInt(canvasParent.css('margin-left')) + self.ele.width() / 2;
        var right = self.ele.width() - self.canvas.width - left;
        var top = parseInt(canvasParent.css('margin-top')) + self.ele.height() / 2;
        var bottom = self.ele.height() - self.canvas.height - top;

        if(i.hasClass('zCutRight')){
            var max = self.canvas.width + right - self.downLeft;
            if(right < 0 && max < width){
                width = max;
            }
            else if(right > 0){
                max = self.canvas.width - self.downLeft;
                if(max < width){
                    width = max;
                }
            }
            
            parent.css({
                width: width
            })
        }
        else if(i.hasClass('zCutDown')){
            var max = self.canvas.height + bottom - self.downTop;
            if(bottom < 0 && max < height){
                height = max;
            }
            else if(bottom > 0){
                max = self.canvas.height - self.downTop;
                if(max < height){
                    height = max;
                }
            }
            
            parent.css({
                height: height
            })
        }
        else if(i.hasClass('zCutLeft')){
            if(left < 0 && self.downLeft + left <= -1 * addWidth){
                addWidth = (self.downLeft + left) * -1;
            }
            else if(left > 0 && self.downLeft <= -1 * addWidth){
                addWidth = -1 * self.downLeft;
            }
            parent.css({
                left: self.downLeft + addWidth,
                width: self.downWidth - addWidth + 2
            })
        }
        else if(i.hasClass('zCutUp')){
            if(top < 0 && self.downTop + top <= -1 * addHeight){
                addHeight = (self.downTop + top) * -1;
            }
            else if(top > 0 && self.downTop <= -1 * addHeight){
                addHeight = -1 * self.downTop;
            }
            parent.css({
                top: self.downTop + addHeight,
                height: self.downHeight - addHeight + 2
            })
        }
        

        self.resetCover();
    }


    self.render();
}

module.exports = ImageCrop;