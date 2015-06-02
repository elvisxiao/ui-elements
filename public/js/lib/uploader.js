var Uploader = function(options) {
	var self = this;

	this.config = {
		container: 'body',
		maxSize: 10,
		uploadAction: '/upload',
		postParams: {},
		blobSize: 1000000,
		callback: null,
		uploadOneCallback: null
	};

	this.deleteFile = null;

	this.STATUS = {
		waiting: 0,
		process: 1,
		success: 2,
		failed: 3
	};
	this.files = [];
	this.ele = null;
	this.msg = '';
	this.queueSize = 0;
	this.uploadedSize = 0;
	this.slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;

	for(var key in options){
		if(this.config.hasOwnProperty(key)){
			this.config[key] = options[key];
		}
	}

	self._renderFoot = function(){
		var div = $('<div class="zUploaderFoot"></div>');
		div.append('<p class="zUploaderStatic">选中0个文件，共0K</p>');
		div.append('<span class="zUploaderControl"><span class="zUploaderFileBtn"><input type="file" multiple="multiple" />' + 
			'<span class="zUploaderBtnText">继续添加</span></span><button class="zUploaderBtn" type="button">开始上传</button></span>');

		return div;
	}

	self._renderNoFile = function(){
	    var div = $('<div class="zUploaderNoFile"></div>');
	    div.append('<div class="icon"><i class="icon-images"></i></div>');
	    div.append('<span class="zUploaderFileBtn "><input type="file" multiple="multiple" /><span class="zUploaderBtnText">点击选择文件</span></div>');
	    div.append('<p>或将文件拖到这里，单次最多可上传文件' + self.config.maxSize + '个</p>');

	    return div;
	}

	self._render = function(){
		self.ele = $('<div class="zUploader"></div>');
		var uploadList = $('<div class="zUploaderList"></div>');
		uploadList.append(self._renderNoFile());
		var foot = self._renderFoot().hide();
		self.ele.append(uploadList);
		self.ele.append(foot);
		self.ele.appendTo(self.config.container);
	}

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

		self.ele.find('.zUploaderStatic').html('选中' + waitingCount + '个文件，共' + (size/1000.0).toFixed(2) + 'K');
	}

	self._pushFiles = function(files){
		for(var i = 0; i < files.length; i++){
			var file = files[i];
			if($.inArray(file, self.files) === -1){
				if(self.files.length === self.config.maxSize){
					alert('超出了最大文件数量');
					return false;
				}
				files[i].status = self.STATUS.waiting;
				self.files.push(files[i]);
			}
		}
		self.reloadList();
	}

	self._deleteFile = function(index){
		if(self.files[index].status === self.STATUS.process){
			return alert('改文件当前不允许删除');
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

	self._bindEvent = function(){
		self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
			self._pushFiles(this.files);
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

	self._renderOneFile = function(file){
		var item = $('<div class="zUploaderItem"></div>');
		item.append('<div class="icon"><i class="icon-images"></i></div>');
		item.append('<p class="zUploaderMsg"></p>');
		item.append('<div class="zUploaderItemHd"><i class="icon-cross"></i></div>');
		var fileName = file.name;
		if(fileName.length > 25){
			fileName = fileName.slice(0, 20) + ' ...';
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

	self.setStatus = function(file, status, msg){
		file.status = status;
		if(status === self.STATUS.success){
			file.target.find('.zUploaderMsg').addClass('ok').html('upload success');
	    	file.target.find('.zUploaderItemHd').remove();
	    	file.status = self.STATUS.success;
		}
		else if(status === self.STATUS.failed){
			// console.error('file "' + file.name + '" 失败:' + msg);
			file.target.find('.zUploaderMsg').addClass('error').html('upload failed');
		    file.status = 'failed';
		}
	}

	self._uploadOneFile = function(file, cb){
		self.setStatus(file, self.STATUS.process);

		if(window.FormData && window.XMLHttpRequest){
			self._sendFileByFormData(file, cb);
			return;
		}

		console.log('Not support window.FormData');
		var fileName = new Date().getTime() + '_' + file.name;

		var reader = new FileReader();
		reader.onerror = function(err){
			self._process(file.size);
	        self.setStatus(file, self.STATUS.failed, '文件读取失败:' + err);
	        cb();
	    }
	    reader.onload = function(){
			var params = self.config.postParams;
			params.fileName = fileName;
			var fileData = reader.result;
			
			var sendPice = function(){
				params.fileData = fileData.slice(0, self.config.blobSize);
				fileData = fileData.slice(self.config.blobSize);
				if(params.fileData.length === 0){
					self.setStatus(file, self.STATUS.success);
					cb();
			    	return;
				}
				self._process(params.fileData.length);
				$.ajax({
		    		type: "post",
		    		url: self.config.uploadAction,
		    		data: params,
		    		success: function(){
		    			self._process(params.fileData.length);
		    			sendPice();
		    		},
		    		error: function(res){
		    			self._process(file.size - fileData.length);
		    			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
		    			cb();
		    		}
		    	})
			}
			sendPice();
	    }
	    reader.readAsBinaryString(file);
	}

	self._sendFileByFormData = function(file, cb){
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', self.config.uploadAction, true);
		var data = new FormData();
		data.append('file', file);
		xhr.upload.onload = function (e){
			
		}
		xhr.upload.onprogress = function(e){
			self._process(e.loaded, true);
		}
		xhr.upload.onerror = function(err){
			self._process(file.size);	
			// console.log('uploader error', err)
			self.setStatus(file, self.STATUS.failed, '文件传输中断:' + res.statusText);
			cb();
		}
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){  
				self._process(file.size);  
				file.response = xhr.response;
				self.setStatus(file, self.STATUS.success);	
				cb();
		    }
		}
		xhr.send(data);
	}

	self._process = function(addSize, isNotAppend){
		var eleStatic = self.ele.find('.zUploaderStatic');
		var eleProcess = eleStatic.find('.zUploaderProcess');
		if(eleProcess.length === 0){
			eleStatic.html('');
			eleProcess = $('<span class="zUploaderProcess"><span class="zUploaderProcessInner"></span></span>').appendTo(eleStatic);
			eleProcesText = $('<span class="zUploaderProcessText"></span>').appendTo(eleStatic);
		}
		var currentSize = self.uploadedSize + addSize;
		if(addSize !== 0){
			eleProcess.attr('data-count', currentSize).find('.zUploaderProcessInner').css('width', currentSize * 100 / self.queueSize + '%');
		}
		eleStatic.find('.zUploaderProcessText').html('( ' + (currentSize / 1000).toFixed(2) + ' KB / ' + (self.queueSize / 1000).toFixed(2)  + ' KB )');
		if(isNotAppend !== true){
			self.uploadedSize += addSize;
		}
	}


	self._upload = function(){
		var processList = self.files.filter(function(model){
			return model.status === self.STATUS.process;
		});
		if(processList.length > 0){

			return alert('有文件正在上传，请稍后...');
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

		if(self.queueSize > 10000000){
			self.config.blobSize = 4000000;
		}
		self._process(0);
		var i = 0;
		var uploadQueue = function(){
			if(i === queueList.length){
				self._setFootStatics();
				self.config.callback && self.config.callback(self.files);
				return;
			}
			
			self._uploadOneFile(queueList[i], function(){
				self.config.uploadOneCallback && self.config.uploadOneCallback(queueList[i]);
				uploadQueue(i++);
			});
		}
		uploadQueue();
	}

	self._setFootStatics = function(){
		var successList = self.files.filter(function(model){
			return model.status == self.STATUS.success;
		});
		var successCount = successList.length;
		var failedCount = self.files.length - successCount;
		var text = '已成功上传' + successCount + '个文件';
		if(failedCount > 0){
			text += '，' + failedCount + '个文件上传失败，<a class="zUploaderReset" href="#">重置失败文件？</a>';
		}
		self.ele.find('.zUploaderStatic').html(text);
	}

	self._render();
	self._bindEvent();
}

module.exports = Uploader;