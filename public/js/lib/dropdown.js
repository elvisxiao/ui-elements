module.exports = {
    show: function(target, title, content, defaultDirect) {
        var target = $(target);
        if(target.data('zTarget')){
            return;
        }
        var elePop = $('<div class="zDropdown"><div class="zDropdownBd"></div></div>');
        
        elePop.find('.zDropdownBd').append(content);
        if(title){
            var hd = $('<div class="zDropdownHd"></div>').append(title);
            elePop.prepend(hd);
        }

        elePop.appendTo('body');
        this._setPosition(target, elePop, title, defaultDirect);
        elePop.data('zTarget', target);
        target.data('zTarget', elePop);

        return elePop;
    },
    
    remove: function(ele){
        if(!ele){
            ele = $('.zDropdown');
        }
        else{
            ele = $(ele);
            if(!ele.hasClass('zDropdown')){
                ele = ele.data('zTarget');
            }
        }

        if(ele && ele.each){
            ele.each(function(){
                var one = $(this);
                var target = one.data('zTarget');
                one.remove();
                one.data('zTarget', null);
                target && target.data('zTarget', null);
            })
        }
    },

    _setPosition: function(target, elePop, hasTitle, defaultDirect){
        var position = target.offset();
        var left = position.left;
        var top = position.top;
        var win = $(window);
        
        var origin = {
            upTop: top - elePop.outerHeight() - 8,
            downTop: top + target.outerHeight() + 8,
            leftLeft: left,
            rightLeft: left - elePop.outerWidth() + target.outerWidth()
        }

        //设置左边距离
        var targetLeft = origin.leftLeft;

        if(defaultDirect === "right" && origin.rightLeft > win.scrollLeft() ){
            targetLeft = origin.rightLeft;
            elePop.addClass('zDropdownRight');
        }
        else if( left + elePop.outerWidth() > win.scrollLeft() + win.width() ){
            targetLeft = origin.rightLeft;
            elePop.addClass('zDropdownRight');
        }

        //设置顶部距离
        var targetTop = origin.downTop;
        if(defaultDirect === "up" && origin.upTop > win.scrollTop()){
            targetTop = origin.upTop;
            elePop.addClass('zDropdownUp');
        }
        else if((targetTop + elePop.height() > win.outerHeight() + win.scrollTop()) ){ //下面位置不够放时，尝试放到上面去
            targetTop = origin.upTop;
            //判断上面位置是否足够放置，如果不行，去上或下高度比较大的一个
            if(targetTop < win.scrollTop() ){
                var alignTop = top - win.scrollTop();
                var alignBottom = win.outerHeight() - alignTop - target.outerHeight();
                var maxHeight = alignTop > alignBottom? alignTop : alignBottom;
                elePop.css('height', maxHeight - 20);
                if(hasTitle){
                    elePop.find('.zDropdownBd').css('height', maxHeight - 40);
                }
                if(alignBottom > alignTop){
                    targetTop = origin.downTop;
                }
                else{//下面的位置比上面高度小，放上去
                    targetTop = top - elePop.outerHeight() - 8;
                    elePop.addClass('zDropdownUp');
                }
            }
            else{ //上面位置够，放上去
                elePop.addClass('zDropdownUp');
            }
        }
        

        elePop.css({
            left: targetLeft,
            top: targetTop,
            "min-width": target.outerWidth()
        })
    }
}
