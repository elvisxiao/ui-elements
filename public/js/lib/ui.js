var UI = {};

UI.toggleBtn = function(){
    $('.zToggleBtn').each(function(){
        var ele = $(this).removeClass('zToggleBtn');
        var span = $('<span class="zToggleBtn"><i class="zToggleBtnON">ON</i><i class="zToggleBtnOFF">OFF</i>' +  ele[0].outerHTML + '</span>');
        ele.replaceWith(span);
    })

    $('.zToggleBtn').off('change', 'input').on('change', 'input', function(){
        if(this.checked){
            $(this).parents('.zToggleBtn:eq(0)').addClass('active');
        }
        else{
            $(this).parents('.zToggleBtn:eq(0)').removeClass('active');
        }
    })
},

// ele: 作用的元素 - jquery对象集合
// array：autoComplete的数据来源，为数组 - 可选
// cb：选择后的回调函数 - 可选
UI.autoComplete = function(ele, array, cb){
    if(typeof array === 'function'){
        cb = array;
        array = null;
    }
    ele.off('keyup').off('keydown').off('blur');
    ele.on('keydown', function(e){
        if(e.keyCode === 13){
            event.preventDefault();
            return false;
        }
    })
    ele.on('keyup', function(e){
        var ipt = $(this);

        if(e.keyCode === 13){
            var val = $('.zAutoComplete li.active').html();
            if(val){
                ipt.val(val);
                $('.zAutoComplete').remove();
            }

            event.preventDefault();

            return false;
        }
        
        var source = array;
        if(!array){
            var sourceString = ipt.attr('data-source');
            if(sourceString){
                source = eval(sourceString);
            }
            else{
                source = ipt.data('source');
            }
        }
        if(!source){
            return;
        }

        $('.zAutoComplete').remove();
        var val = $.trim(this.value);
        if(!val){

            return;
        }
        var matchedArray = source.filter(function(item){
            return item.toUpperCase().indexOf(val.toUpperCase()) > -1;
        });
        
        var len = matchedArray.length;
        if(len === 0) {

            return;
        }

        if(len > 8){
            len = 8;
        }

        var ul = $('<ul class="zAutoComplete"></ul>');
        for(var i = 0; i < len; i++){
            ul.append('<li>' + matchedArray[i] + '</li>');
        }
        var top = ipt.offset().top + ipt.outerHeight();
        var left = ipt.offset().left;
        ul.css({top: top, left: left}).on('click', 'li', function(){
            var slc = $(this).html();
            ipt.val(slc);
            $('.zAutoComplete').remove();
            cb && cb(slc);
        }).on('mouseenter', 'li', function(){
            ul.find('.active').removeClass('active');
            $(this).addClass('active');
        });
        
        ipt.after(ul);

    }).on('blur', function(){
        setTimeout(function(){
            $('.zAutoComplete').remove();
        }, 200);
    });
}

module.exports = UI;