/**
* @file 以遮盖形式弹出错误提示，对话框等
* @author Elvis Xiao
* @version 0.1 
*/

/**
* 以遮盖形式弹出错误提示，对话框等
* @exports oc.dialog

* @example
* oc.dialog.tips('服务器端报错了', 2000)
* @example
* oc.dialog.confirm('确定要删除？', function(){
    console.log('well，真的删掉了');
}, function(){
    console.log('原来你只是逗我玩的');
})
*/
var Dialog = {
    template: '<div class="zDialogCover"><div class="zDialog"><div class="zDialogHd"></div><div class="zDialogBd"></div><div class="zDialogFt"><button class="zDialogOk" type="button">确 认</button><button class="zDialogCancel" type="button">取 消</button></div></div></div>'
};


/**
* 移除所有由oc.dialog生成的对话框
*/
Dialog.removeMadal = function(){
    this.removeAllTips();
    this.close();
    Dialog.resetBody();
},

/**
* 移除所有由dialog.open以外的对话框
*/
Dialog.removeAllTips = function(){
    $(".zLoading, .tips").remove();
    Dialog.resetBody();
},

/**
* 展示一个过了指定时间即消失的提示信息，一般内容简短
* @param {string} msg - 需要弹出的信息
* @param {number} time - 信息显示时长，单位为毫秒，可省略，默认为1500
* @param {function} callback - 时间到了之后回调的方法
*/
Dialog.tips = function(msg, time, cb){
    if(!msg) {
        return;
    }
    if(time === undefined){
        time = 1500;
    }
    if(typeof time === 'function'){
        cb = time;
        time = 1500;
    }
    var dialog = $(Dialog.template).addClass('tips');
    dialog.find('.zDialogFt').remove();
    dialog.find('.zDialogBd').html(msg);
    if(time > 0) {
        dialog.find('.zDialogHd').remove();
        
        setTimeout(function() {
            dialog.remove();
            cb && cb();
            Dialog.resetBody();
        }, time)
    }
    else {
        dialog.find('.zDialogHd').append('Tips<i class="zDialogClose close">×</i>');
        dialog.on('click', '.zDialogClose', function() {
            dialog.remove();
            cb && cb();
            Dialog.resetBody();
        })
    }
    dialog.appendTo('body');
    $(document.body).addClass('zDialogOn');
    
    return dialog;
}

/**
* 展示一个Loading信息，一般用于Ajax时的等待过程，使用较少
* @param {string} msg - 需要弹出的信息
* @param {number} time - 信息显示时长，单位为毫秒，可省略，默认为1500
* @param {function} callback - 时间到了之后回调的方法
*/
Dialog.loading = function(msg){
    this.removeMadal();
    var dialog = $(Dialog.template).addClass('tips');
    dialog.find('.zDialogHd, .zDialogFt').remove();
    dialog.find('.zDialogBd').html('<div class="zLoadingIcon"></div>' + msg);
    dialog.appendTo('body');

    return dialog;
}

Dialog.resetBody = function() {
    if($('.zDialogCover').length === 0) {
        $(document.body).removeClass('zDialogOn');
    }
}

/**
* 类似window.confirm，确认对话框
* @param {string} msg - 需要弹出的信息
* @param {function} cbOK - 用户点击了确认后的回调
* @param {function} cbNO - 用户点击取消后的回调
* @param {boolean} required - 如果弹出框中有个input输入框，则此参数用来设置此输入框是否必填
*/
Dialog.confirm = function(msg, cbOK, cbNO, required, autoRemove){
    var confirm = $(Dialog.template);
    confirm.find('.zDialogBd').html(msg);
    confirm.find('.zDialogHd').remove();

    confirm.appendTo('body').on('click', '.zDialogOk, .zDialogCancel', function(){
        var ipt = confirm.find('input, textarea');
        var val = '';
        if(ipt.length > 0){
            val = ipt.val();
        }
        
        if($(this).hasClass('zDialogOk')){
            if(required === true && ipt.length > 0 && (!val) ){
                Dialog.tips('message is required.');
                ipt.focus();
                return;
            }
            if(autoRemove !== false) {
                cbOK && cbOK(val);
                confirm.remove();
                Dialog.resetBody();
            }
            else {
                if(val) {
                    cbOK && cbOK(val, function() {
                        confirm.remove();
                        Dialog.resetBody();
                    });
                }
                else {
                    cbOK && cbOK(function() {
                        confirm.remove();
                        Dialog.resetBody();
                    });
                }   
            }
        }
        else{
            cbNO && cbNO(val);
            confirm.remove();
            Dialog.resetBody();
        }
    }).on('click', 'input, textarea', function(){
        confirm.removeClass('has-error');
    });

    confirm.focus();
    $(document.body).addClass('zDialogOn');
    
    return confirm;
}

/**
* 打开一个相对比较复杂的弹出框，需要手动关闭
* @param {string} title - 弹出标题
* @param {string} content - 弹出部分的内容，一般为html
* @param {function} cb - 弹出框完全展现之后的回调接口
*/
Dialog.open = function(title, content, cb, showFoot){
    this.removeMadal();
    if(!content){
        content = title;
        title = '';
    }

    var dialog = $(Dialog.template);
    dialog.find('.zDialogHd').append(title + '<i class="zDialogClose close">×</i>');
    dialog.find('.zDialogBd').append(content);
    if(typeof cb !== true && showFoot !== true) {
        dialog.find('.zDialogFt').remove();
    }

    dialog.appendTo(document.body);
    $(document.body).addClass('zDialogOn');
    
    if(cb && typeof cb == 'function') {
        setTimeout(cb, 300);
    }
    
    dialog.on('click', '.close, .zDialogClose, .zDialogCancel', function(){
        dialog.onclose && dialog.onclose();
        dialog.onClose && dialog.onClose();
        dialog.remove();
        Dialog.resetBody();
    })

    
    return dialog;
}

/**
* 关闭由oc.dialog.open打开的所有对话框
*/
Dialog.close = function(ele){
    if(ele) {
        ele = $(ele);
        if(!ele.hasClass('zDialogCover')) {
            ele = ele.parents('.zDialogCover');
        }
    }
    else {
        ele = $(".zDialogCover");
    }
    ele.remove();
    Dialog.resetBody();
}

Dialog.tooltips = function(msg, ele) {
    ele = $(ele);
    var tips = $('<span class="zTooltips none">' + msg + '</span>');
    
    tips.appendTo('body');
    tips.fadeIn(500, function() {
        setTimeout(function() {
            tips.fadeOut(500, function() {
                tips.remove();
            })
        }, 1500)
    });
    
    tips.css({
        left: ele.offset().left - parseInt(tips.css('width')) - 20,
        top: ele.offset().top
    })
    
    return tips;
}

Dialog.warn = function(msg, ele) {
    ele = $(ele);
    
    var removeTips = function(ele) {
        if(!ele) {
            return;
        }
        ele = ele.target || ele.srcElement || ele;
        ele = $(ele);
        var tips = ele.data('target');
        if(tips) {
            tips.data('timer') && clearTimeout(tips.data('timer'));
            tips.remove();
            ele.data('target', null);
        }
    };

    if(ele.data('target')) {
        removeTips(ele);
    }

    ele.off('click', removeTips);
    ele.on('click', removeTips);
    ele.on('blur', removeTips);

    var tips = $('<span class="zTooltips warn none">' + msg + '</span>');
    ele.after(tips);
    tips.fadeIn(200, function() {
        var timer = setTimeout(function() {
            removeTips();
        }, 5000);
        tips.data('timer', timer);
    });
    
    tips.css({
        left: ele.position().left,
        top: ele.position().top + ele.height() + 10
    });
    
    ele.data('target', tips);
    return tips;
}



module.exports = Dialog;


