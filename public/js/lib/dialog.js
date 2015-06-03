
/**
以遮盖形式弹出错误提示，对话框等
@author Elvis
@exports oc.dialog

* @example
* oc.dialog.tips('服务器端报错了', 2000)
* @example
* oc.dialog.confirm('确定要删除？', function(){
    console.log('well，真的删掉了');
}, function(){
    console.log('原来你只是逗我玩的');
})
*/
var Dialog = {};

/**
* 移除所有由oc.dialog生成的对话框
*/
Dialog.removeMadal = function(){
    this.removeAllTips();
    this.close();
},

/**
* 移除所有由dialog.open以外的对话框
*/
Dialog.removeAllTips = function(){
    $(".zLoading, .tips").remove();
},

/**
* 展示一个过了指定时间即消失的提示信息，一般内容简短
* @param {string} msg - 需要弹出的信息
* @param {number} time - 信息显示时长，单位为毫秒，可省略，默认为1500
* @param {function} callback - 时间到了之后回调的方法
*/
Dialog.tips = function(msg, time, cb){
    if(time === undefined){
        time = 1500;
    }
    if(typeof time === 'function'){
        cb = time;
        time = 1000;
    }
    var tips = $('<div class="tips">' + msg + '</div>');
    tips.appendTo('body');
    var width = tips.width();
    tips.css('margin-left', -width / 2 + 'px');
    setTimeout(function(){
        tips.remove();
        cb && cb();
    }, time);
}

/**
* 展示一个Loading信息，一般用于Ajax时的等待过程，使用较少
* @param {string} msg - 需要弹出的信息
* @param {number} time - 信息显示时长，单位为毫秒，可省略，默认为1500
* @param {function} callback - 时间到了之后回调的方法
*/
Dialog.loading = function(msg){
    this.removeMadal();
    var loading = $('<div class="zLoading"></div><div class="tips">' + msg + '</div>');
    loading.appendTo('body');
    var width = $(".tips").width();
    loading.css('margin-left', -width / 2 + 'px');

    return loading;
}

/**
* 类似window.confirm，确认对话框
* @param {string} msg - 需要弹出的信息
* @param {function} cbOK - 用户点击了确认后的回调
* @param {function} cbNO - 用户点击取消后的回调
* @param {boolean} required - 如果弹出框中有个input输入框，则此参数用来设置此输入框是否必填
*/
Dialog.confirm = function(msg, cbOK, cbNO, required){
    var confirm = $('<div class="zLoading"></div><div class="tips confirm" style="min-width: 500px;">' + msg + '<div style="border-top: 1px dashed #ddd;" class="tc mt20 pt10"><button class="btn btn-info btn-sm btnOK mr20 w80">OK</button><button class="btn btn-default btn-sm btnCancel w80" style="margin-right: 0">Cancel</button></div></div>');
    confirm.appendTo('body').on('click', '.btnOK, .btnCancel', function(){
        var ipt = confirm.find('input, textarea');
        var val = '';
        if(ipt.length > 0){
            val = ipt.val();
        }
        
        if($(this).hasClass('btnOK')){
            if(required === true && ipt.length > 0 && (!val) ){
                Dialog.tips('message is required.');
                ipt.focus();
                return;
            }
            cbOK && cbOK(val);
        }
        else{
            cbNO && cbNO(val);
        }

        confirm.remove();
    }).on('click', 'input, textarea', function(){
        confirm.removeClass('has-error');
    });

    var width = $(".tips").width();
    confirm.css('margin-left', -width / 2 + 'px');

    return confirm;
}

/**
* 打开一个相对比较复杂的弹出框，需要手动关闭
* @param {string} title - 弹出标题
* @param {string} content - 弹出部分的内容，一般为html
* @param {function} cb - 弹出框完全展现之后的回调接口
*/
Dialog.open = function(title, content, cb){
    this.removeMadal();
    if(!content){
        content = title;
        title = '';
    }
    var dialogCover = $('<div class="zDialogCover"><div class="zDialog"><p class="zDialogTitle"><span class="close">×</span>' + title + '</p></div></div>').appendTo(document.body);
    var dialog = dialogCover.find('.zDialog');
    dialog.append(content);

    var width = dialog.outerWidth();
    var height = dialog.outerHeight();
    dialog.css({'margin-left': -width / 2 + 'px', 'left': '50%'});
    
    var bodyHeight = $(document).outerHeight();

    dialog.on('click', '.close', function(){
        dialog.animate({
            top: 0,
            opacity: 0
        }, 500, function(){
            dialogCover.remove();
        })
    })

    var top = '20%';
    if(height > bodyHeight){
        top = '5%';
    }

    if(height > 500){
        dialog.css({'position': 'absolute'});
        top = $(document).scrollTop() + 50 + 'px';
    }
    dialog.animate({
        top: top,
        opacity: 1
    }, 500, function(){
        cb && cb();
    })
}

/**
* 关闭由oc.dialog.open打开的所有对话框
*/
Dialog.close = function(){
    var cover = $(".zDialogCover");
    if(!cover.length){
        return;
    }

    var dialog = cover.find('.zDialog');
    dialog.animate({
        top: 0,
        opacity: 0
    }, 500, function(){
        cover.remove();
    })
}

module.exports = Dialog;


