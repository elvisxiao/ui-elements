/** 
* @file 基于FormData和FileReader的文件预览、上传组件 
* @author <a href="http://www.tinyp2p.com">Elvis Xiao</a> 
* @version 0.1 
*/ 


/**
* 基于FormData和FileReader的文件预览、上传组件
* @class Uploader
* @constructor
* @param {object} options 配置变量对象：<br /> 
	container：容器对象，默认为document.body<br />
	maxSize：单次最大允许添加的文件数量，默认为10<br />
	uploadAction：接收文件的接口地址（post方法） <br />
	postParams：其他需要与文件一起post过去的数据 <br />
	oneFileLimit：单个文件限制大小，默认为10M <br />
	callback：单次所有文件上传完成后的执行的回调接口 <br />
	uploadOneCallback：单个文件上传完成后的执行的回调接口 <br />
* @example
* var uploader = new oc.Uploader({
        container: '.fileContainer',
        postParams: {
            savePath: 'upload'
        },
        callback: function(files){
            console.log('all file uploaded:', files);
        },
        uploadOneCallback: function(file){
            console.log('uploaded one file:', file);
        },
        blobSize: 100
    })

    uploader.files = [{
        name: 'test.jpg',
        status: uploader.STATUS.success
    },
    {
        name: 'test2.jpg',
        status: uploader.STATUS.success
    }]
    uploader.deleteFile = function(file){
        console.log(file);
    }
    uploader.reloadList();
*/
var Uploader = function(options) {
	/** @memberof ImageCrop */

	var self = this;

	this.config = {
		container: 'body',
		auto: false,
		maxSize: 10,
		uploadAction: '/upload',
		postParams: {},
		oneFileLimit: 10 * 1024 * 1024,
		callback: null,
		uploadOneCallback: null,
		checkFileCallback: null //限制类型或者检测文件是否可用的回调--------
	};

	/** @property {function} deleteFile 对于已经上传完成的文件提供删除接口，如提供了，则文件可以被删除 */
	this.deleteFile = null;

	/** @property {function} STATUS 文件状态枚举值 */
	this.STATUS = {
		waiting: 0,
		process: 1,
		success: 2,
		failed: 3
	};

	/** @property {object} files 当前在显示的文件集合 */
	this.files = [];

	/** @property {object} ele 最外层的jquery对象 */
	this.ele = null;

	/** @property {string} msg 标记文件的错误信息 */
	this.msg = '';

	/** @property {number} queueSize 当前还未上传的文件总大小 */
	this.queueSize = 0;

	/** @property {number} uploadedSize 当前已经上传的文件总大小 */
	this.uploadedSize = 0;

	/** @property {object} slice Blob对象，暂未使用，留作以后分段上传 */
	this.slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	/** 
	* 更新统计信息
    * @method _renderFoot 
    * @return {object} div - jquery对象
    * @memberof FileView 
    * @instance 
    */
	self._renderFoot = function(){
		var div = $('<div class="zUploaderFoot"></div>');
		div.append('<p class="zUploaderStatic">Selected 0 File，Total 0K</p>');
		div.append('<span class="zUploaderControl"><span class="zUploaderFileBtn"><input type="file" multiple="multiple" />' + 
			'<span class="zUploaderBtnText">Add</span></span><button class="zUploaderBtn" type="button">Upload</button></span>');

		if(self.config.auto) {
			div.find('.zUploaderBtn').remove();
		}
		return div;
	}

	/** 
	* 当没有文件时，界面显示为请选择或拖拽文件
    * @method _renderNoFile 
    * @return {object} div - jquery对象
    * @memberof FileView 
    * @instance 
    */
	self._renderNoFile = function(){
	    var div = $('<div class="zUploaderNoFile"></div>');
	    div.append('<div class="icon"><i class="icon-images"></i></div>');
	    div.append('<span class="zUploaderFileBtn "><input type="file" multiple="multiple" /><span class="zUploaderBtnText">Select a file </span></div>');
	    div.append('<p>Drag files here to select them, limited ' + self.config.maxSize + ' files</p>');

	    return div;
	}

	/** 
	* 生成整个Uploader结构
    * @method _render 
    * @memberof FileView 
    * @instance 
    */
	self._render = function(){
		self.ele = $('<div class="zUploader"></div>');
		var uploadList = $('<div class="zUploaderList"></div>');
		uploadList.append(self._renderNoFile());
		var foot = self._renderFoot().hide();
		self.ele.append(uploadList);
		self.ele.append(foot);
		self.ele.appendTo(self.config.container);
	}

	/** 
	* 根据当前文件，重新生成整个Uploader结构
    * @method reloadList 
    * @memberof FileView 
    * @instance 
    */
	self.reloadList = function(){
		self.ele.find('.zUploaderItem').remove();
		var len = self.files.length;
		
		if(len === 0){
			self.ele.find('.zUploaderNoFile').show();
			self.ele.find('.zUploaderFoot').hide();
			return;
		}

		self.ele.find('.zUploaderNoFile').hide();
		self.ele.find('.zUploaderFoot').show();
		var zUploaderList = self.ele.find('.zUploaderList');
		var size = 0;
		var waitingCount = 0;
		for(var i = 0; i < len; i++){
			var file = self.files[i];
			if(file.status == self.STATUS.waiting){
				size += file.size;
				waitingCount ++;
			}
			var zUploaderItem = self._renderOneFile(file);
			file.target = zUploaderItem;
			zUploaderList.append(zUploaderItem);
		}
		
		if(self.files.length < self.config.maxSize) {
			self.ele.find('.zUploaderFoot .zUploaderFileBtn').show();
		}
		self.ele.find('.zUploaderStatic').html('Selected ' + waitingCount + ' files，total ' + (size / 1000.0).toFixed(2) + 'K');
	}

	//清除所有文件---
	self.clear = function() {
		self.files = [];
		self.reloadList();
	}

	/** 
	* 选择文件后，添加到files中，并重新绘制
    * @method _pushFiles 
    * @param {objec} files - 被添加的文件集合
    * @memberof FileView 
    * @instance 
    */
	self._pushFiles = function(files){
		for(var i = 0; i < files.length; i++){
			var file = files[i];
			var finds = self.files.filter(function(oneFile) {
				return oneFile.name == file.name && oneFile.lastModified == file.lastModified && oneFile.size == file.size;
			})
			if(finds.length > 0){
				oc.dialog.tips(file.name + ' file already exist');
				continue; 
			}
			if(file.size > self.config.oneFileLimit) {
				oc.dialog.tips('File ' + file.name + ' is over max size limited（' + parseInt(self.config.oneFileLimit / 1024) + 'K)');
				continue; 
			}
			
			if(self.files.length === self.config.maxSize){
				alert('Files quanlity is over limted size');
				return false;
			}

			if(self.files.length >= self.config.maxSize - 1) {
				self.ele.find('.zUploaderFoot .zUploaderFileBtn').hide();
			}

			if(!self.config.checkFileCallback || self.config.checkFileCallback(file)) {
				files[i].status = self.STATUS.waiting;
				self.files.push(files[i]);
			}
		}
		self.reloadList();

		//自动上传
		if(self.config.auto) {
			self._upload();	
		}
	}

	/** 
	* 删除文件，未上传的直接删除，已经上传的取决与deleteFile方法是否设置
    * @method _deleteFile 
    * @param {number} index - 需要删除的文件位置
    * @memberof FileView 
    * @instance 
    */
	self._deleteFile = function(index){
		if(self.files[index].status === self.STATUS.process){
			return alert('This file is not allow delete');
		}
		var file = self.files[index];
		if(file.status === self.STATUS.success){
			self.deleteFile && self.deleteFile(file, function(){
				self.files.splice(index, 1);
				self.reloadList();
			});
		}
		else{
			self.files.splice(index, 1);
			self.reloadList();
		}
	}

	/** 
	* 内部事件绑定
    * @method _bindEvent 
    * @memberof FileView 
    * @instance 
    */
	self._bindEvent = function(){
		self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
			self._pushFiles(this.files);
			$(this).replaceWith(this.outerHTML);
		}).on('click', '.zUploaderBtn', self._upload).on('click', '.zUploaderItemHd i', function(){
			var fileItem = $(this).parents('.zUploaderItem');
			var index = fileItem.index();
			self._deleteFile(index - 1);
		}).on('click', '.zUploaderReset', function(e){
			self.files.map(function(model){
				model.status = self.STATUS.waiting;
				model.msg = '';
				model.target.find('.zUploaderMsg').removeClass('error').html('');
				e.preventDefault();
			})
		})

		self.ele[0].addEventListener("drop", function(e){
			e.preventDefault();
			self._pushFiles(e.dataTransfer.files);
		})

		$(document).on({
	        dragleave:function(e){
	            e.preventDefault();
	        },
	        drop:function(e){
	            e.preventDefault();
	        },
	        dragenter:function(e){
	            e.preventDefault();
	        },
	        dragover:function(e){
	            e.preventDefault();
	        }
	    });
	}

	/** 
	* 生成单个文件的HTML结构
    * @method _renderOneFile 
    * @param {object} file - 文件对象
    * @return {object} item - Juery 对象
    * @memberof FileView 
    * @instance 
    */
	self._renderOneFile = function(file){
		var item = $('<div class="zUploaderItem"></div>');
		item.append('<div class="icon"><i class="icon-images"></i></div>');
		item.append('<p class="zUploaderMsg"></p>');
		item.append('<div class="zUploaderItemHd"><i class="icon-cross"></i></div>');
		var fileName = file.name;
		if(fileName.length > 25){
			fileName = fileName.slice(0, 20) + ' ...';
		}
		if(file.status === self.STATUS.success && file.response.files && file.response.files.length && file.response.files[0].path) {
			var path = file.response.files[0].path;
			if(/\w{8}-\w{4}-\w+/.test(path)) {
				path = '/product/util/accessory.jsp?id=' + path + '&name=' + file.name;
			}
			fileName = '<a href="' + path + '" target="_blank">' + fileName + '</a>';
		}
		item.append('<p class="zUploaderName">'+ fileName + '</p>');
		if (file.status === self.STATUS.success){
			item.find('.zUploaderMsg').addClass('ok').html('upload success');
			if(!self.deleteFile){
				item.find('.zUploaderItemHd').remove();
			}
		}
		else if (file.status === self.STATUS.failed){
			item.find('.zUploaderMsg').addClass('error').html('upload failed').attr('title', file.msg);
		}

		//图片文件，支持预览功能---------------------
		if(/image\/\w+/.test(file.type)){
			var reader = new FileReader();
			reader.onload = function(){
				var result = reader.result;
				item.find('.icon i').replaceWith('<img src="' + result + '" />');
			}
			reader.readAsDataURL(file);
		}
		return item;
	}

	/** 
	* 设置文件的状态和错误信息
    * @method setStatus 
    * @param {object} file - 文件对象
    * @param {number} status - 状态枚举
    * @param {string} msg - 错误信息
    * @memberof FileView 
    * @instance 
    */
	self.setStatus = function(file, status, msg){
		file.status = status;
		if(status === self.STATUS.success){
			file.target.find('.zUploaderMsg').addClass('ok').html('upload success');
			if(!self.deleteFile) {
	    		file.target.find('.zUploaderItemHd').remove();
			}
	    	file.status = self.STATUS.success;
		}
		else if(status === self.STATUS.failed){
			// console.error('file "' + file.name + '" 失败:' + msg);
			file.target.find('.zUploaderMsg').addClass('error').html('upload failed').attr('title', msg);
		    file.status = 'failed';
		}
	}

	/** 
	* 上传单个文件
    * @method _uploadOneFile 
    * @param {object} file - 文件对象
    * @param {function} cb - 上传完成后的回调方法
    * @memberof FileView 
    * @instance 
    */
	self._uploadOneFile = function(file, cb){
		self.setStatus(file, self.STATUS.process);

		if(window.FormData && window.XMLHttpRequest){
			self._sendFileByFormData(file, cb);
			return;
		}

		// console.log('Not support window.FormData');
		// var fileName = new Date().getTime() + '_' + file.name;

		// var reader = new FileReader();
		// reader.onerror = function(err){
		// 	self._process(file.size);
	 //        self.setStatus(file, self.STATUS.failed, '文件读取失败:' + err);
	 //        cb();
	 //    }
	 //    reader.onload = function(){
		// 	var params = self.config.postParams;
		// 	params.fileName = fileName;
		// 	var fileData = reader.result;
			
		// 	var sendPice = function(){
		// 		params.fileData = fileData.slice(0, self.config.blobSize);
		// 		fileData = fileData.slice(self.config.blobSize);
		// 		if(params.fileData.length === 0){
		// 			self.setStatus(file, self.STATUS.success);
		// 			cb();
		// 	    	return;
		// 		}
		// 		self._process(params.fileData.length);
		// 		$.ajax({
		//     		type: "post",
		//     		url: self.config.uploadAction,
		//     		data: params,
		//     		success: function(){
		//     			self._process(params.fileData.length);
		//     			sendPice();
		//     		},
		//     		error: function(res){
		//     			self._process(file.size - fileData.length);
		//     			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
		//     			cb();
		//     		}
		//     	})
		// 	}
		// 	sendPice();
	 //    }
	 //    reader.readAsBinaryString(file);
	}

	/** 
	* 使用FormData的方式Post文件到服务器
    * @method _sendFileByFormData 
    * @param {object} file - 文件对象
    * @param {function} cb - 上传完成后的回调方法
    * @memberof FileView 
    * @instance 
    */
	self._sendFileByFormData = function(file, cb){
	    var xhr = new XMLHttpRequest();
	    if(file.size === 0) {
	    	self.setStatus(file, self.STATUS.failed, '文件大小为0');
	    	cb();
	    	return;
	    }

	    xhr.open('POST', self.config.uploadAction, true);
		var data = new FormData();
		data.append('file', file);
		xhr.upload.onload = function (e){
			console.log('onload', e.loaded);
		}
		xhr.upload.onprogress = function(e){
			console.log('process');
			self._process(e.loaded * file.size / e.total, true);
		}
		xhr.upload.onerror = function(err){
			self._process(file.size);	
			self.setStatus(file, self.STATUS.failed, 'file upload abort:' + res.statusText);
			cb();
		}
		xhr.onreadystatechange = function(){
			console.log('status change');
			if(xhr.readyState == 3) {
				console.log(xhr);
			}
			if(xhr.readyState == 4 && xhr.status !== 200) {
				self._process(0);	
				self.setStatus(file, self.STATUS.failed, 'file upload abort:' + xhr.statusText);
				cb();

				return;
			}
			if(xhr.readyState == 4 && xhr.status == 200){  
				self._process(file.size);  
				try {
					file.response = JSON.parse(xhr.response);
					if(file.response.flag === true){
						self.setStatus(file, self.STATUS.success);	
					}
					else{
						self.setStatus(file, self.STATUS.failed);	
					}
				}
				catch(err) {
					console.log('uploader unkonwn error', err);
					self.setStatus(file, self.STATUS.failed);	
				}

				cb();
		    }
		}
		xhr.send(data);
	}

	/** 
	* 文件上传过程中，更新统计信息
    * @method _process 
    * @param {number} addSize - 本次发送的文件块大小
    * @param {boolean} isNotAppend - 文件大小是否追加到uploadedSize中
    * @memberof FileView 
    * @instance 
    */
	self._process = function(addSize, isNotAppend){
		var eleStatic = self.ele.find('.zUploaderStatic');
		var eleProcess = eleStatic.find('.zUploaderProcess');
		if(eleProcess.length === 0){
			eleStatic.html('');
			eleProcess = $('<span class="zUploaderProcess"><span class="zUploaderProcessInner"></span></span>').appendTo(eleStatic);
			eleProcesText = $('<span class="zUploaderProcessText"></span>').appendTo(eleStatic);
		}
		var currentSize = self.uploadedSize + addSize;
		var maxSize = self.queueSize * 0.9;
		if(currentSize > maxSize) {
			currentSize = maxSize;
		}
		if(addSize !== 0){
			var width = 0;
			if(self.queueSize !== 0) {
				width = currentSize * 100 / self.queueSize;
			}
			// if(width > 90) {
			// 	width = 90;
			// }
			eleProcess.attr('data-count', currentSize).find('.zUploaderProcessInner').css('width', width + '%');
		}
		eleStatic.find('.zUploaderProcessText').html('( ' + (currentSize / 1000).toFixed(2) + ' KB / ' + (self.queueSize / 1000).toFixed(2)  + ' KB )');
		if(isNotAppend !== true){
			self.uploadedSize += addSize;
		}
	}

	/** 
	* 执行文件上传操作，采用回调方式，一个一个上传
    * @method _upload 
    * @memberof FileView 
    * @instance 
    */
	self._upload = function(){
		var processList = self.files.filter(function(model){
			return model.status === self.STATUS.process;
		});
		if(processList.length > 0){
			return alert('Some file is uploading, please wait a moment ...');
		}

		self.queueSize = 0;
		self.uploadedSize = 0;
		var queueList = self.files.filter(function(model){
			if(model.status === self.STATUS.waiting){
				self.queueSize += model.size;
				return true;
			}
			
			return false;
		});

		// if(self.queueSize > 10000000){
		// 	self.config.blobSize = 4000000;
		// }
		if(self.config.auto) {
			self.ele.find('.zUploaderFileBtn').hide();
		}
		self._process(0);
		var i = 0;
		var uploadFiles = [];
		var uploadQueue = function(){
			if(i === queueList.length){
				self.ele.find('.zUploaderFileBtn').show();
				self._setFootStatics();
				self.config.callback && self.config.callback(self.files, uploadFiles);
				return;
			}

			uploadFiles.push(queueList[i]);
			self._uploadOneFile(queueList[i], function(){
				self.config.uploadOneCallback && self.config.uploadOneCallback(queueList[i]);
				uploadQueue(i++);
			});
		}
		uploadQueue();
	}

	/** 
	* 上传后生成统计信息
    * @method _setFootStatics 
    * @memberof FileView 
    * @instance 
    */
	self._setFootStatics = function(){
		var successList = self.files.filter(function(model){
			return model.status == self.STATUS.success;
		});
		var successCount = successList.length;
		var failedCount = self.files.length - successCount;
		var text = 'Uploaded ' + successCount + ' files';
		if(failedCount > 0){
			text += '，' + failedCount + ' files upload failed, <a class="zUploaderReset" href="#">reset those files？</a>';
		}
		self.ele.find('.zUploaderStatic').html(text);
	}

	self._render();
	self._bindEvent();
}

module.exports = Uploader;