var Dialog = {};

Dialog.removeMadal = function(){
    this.removeAllTips();
    this.close();
},

Dialog.removeAllTips = function(){
    $(".zLoading, .tips").remove();
},

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

Dialog.loading = function(msg){
    this.removeMadal();
    var loading = $('<div class="zLoading"></div><div class="tips">' + msg + '</div>');
    loading.appendTo('body');
    var width = $(".tips").width();
    loading.css('margin-left', -width / 2 + 'px');

    return loading;
}

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


