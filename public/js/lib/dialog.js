var Dialog = {};

Dialog.tips = function(msg, time, cb){
    this.removeAllTips();
    if(time === undefined){
        time = 1500;
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

Dialog.loading = function(msg){
    this.removeAllTips();
    var loading = $('<div class="zLoading"></div><div class="tips">' + msg + '</div>');
    loading.appendTo('body');
    var width = $(".tips").width();
    loading.css('margin-left', -width / 2 + 'px');

    return loading;
}
       
Dialog.confirm = function(msg, cbOK, cbNO){
    this.removeMadal();
    var confirm = $('<div class="zLoading"></div><div class="tips confirm w500">' + msg + '<div style="border-top: 1px dashed #ddd;" class="tc mt20 pt10"><button class="btn btn-info btn-sm btnOK mr20">确定</button><button class="btn btn-default btn-sm btnCancel" style="margin-right: 0">取消</button></div></div>');
    confirm.appendTo('body').on('click', '.btnOK, .btnCancel', function(){
        var ipt = confirm.find('input');
        var val = '';
        if(ipt.length > 0){
            val = ipt.val();
        }
        confirm.remove();
        if($(this).hasClass('btnOK')){
            cbOK && cbOK(val);
        }
        else{
            cbNO && cbNO(val);
        }
    }).on('click', 'input', function(){
        confirm.removeClass('has-error');
    });

    var width = $(".tips").width();
    confirm.css('margin-left', -width / 2 + 'px');

    return confirm;
}

Dialog.open = function(title, content){
    this.removeAllTips();
    if(!content){
        content = title;
        title = '';
    }
    var dialogCover = $('<div class="zDialogCover"><div class="zDialog"><p class="zDialogTitle"><span class="close">×</span>' + title + '</p>' + content + '</div></div>').appendTo(document.body);
    var dialog = dialogCover.find('.zDialog');
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
    dialog.animate({
        top: top,
        opacity: 1
    }, 500)
}

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


