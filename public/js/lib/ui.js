var UI = {};

UI.toggleBtn = function(on, off){
    if(on === undefined){
        on = 'ON';
        off = 'OFF';
    }
    var self = this;
    $('.zToggleBtn, .zToggleBtnSm').each(function(){
        var ele = $(this);
        self.toggleOneBtn(ele, on, off);
    })
},

UI.toggleOneBtn = function(btn, on, off){
    console.log('eee')
    var btnClass = 'zToggleBtn';
    btn.removeClass('zToggleBtn');
    if(btn.hasClass('zToggleBtnSm')){
        btn.removeClass('zToggleBtnSm');
        btnClass += ' zToggleBtnSm';
    }

    var span = $('<span class="' + btnClass + '"><i class="zToggleBtnON">' + on + '</i><i class="zToggleBtnOFF">' + off + '</i>' +  btn[0].outerHTML + '</span>');
    btn.replaceWith(span);
    
    span.off('change', 'input').on('change', 'input', function(){
        console.log('333');
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
        console.log('keydow');
        if(e.keyCode === 13){
            event.preventDefault();
            return false;
        }
    })
    ele.on('keyup', function(e){
        var ipt = $(this);
        var ul = ipt.next('ul.zAutoComplete');

        if(e.keyCode === 40){
            var focusLi = ul.find('li.active');
            if(focusLi.length === 0){
                ul.find('li:eq(0)').addClass('active');
            }
            else{
                var nextLi = focusLi.next('li');
                if(nextLi.length > 0){
                    nextLi.addClass('active');
                    focusLi.removeClass('active');
                }
            }

            return;
        }
        if(e.keyCode === 38){
            var focusLi = ul.find('li.active');
            if(focusLi.length === 0){
                return;
            }
            
            var prevLi = focusLi.prev('li');
            if(prevLi.length > 0){
                prevLi.addClass('active');
                focusLi.removeClass('active');
            }

            return;
        }

        if(e.keyCode === 13){
            var focusLi = ul.find('li.active');
            if(focusLi.length > 0){
                ipt.val(focusLi.html());
                ul.remove();
            }
            return;
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
            ul.append('<li tabindex="0">' + matchedArray[i] + '</li>');
        }
        var top = ipt.position().top + ipt.outerHeight();
        var left = ipt.position().left;
        ul.css({top: top, left: left}).on('click', 'li', function(){
            var slc = $(this).html();
            ipt.val(slc);
            $('.zAutoComplete').remove();
            cb && cb(slc);
        })
        .on('mouseenter', 'li', function(){
            ul.find('.active').removeClass('active');
            $(this).addClass('active');
        })
        
        ipt.after(ul);

    }).on('blur', function(){
        setTimeout(function(){
            // $('.zAutoComplete').remove();
        }, 200);
    });
}

module.exports = UI;