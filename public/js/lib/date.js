 
/**
* @file 用于Javascript Date类型的扩展
* @author Elvis
* @version 0.1 
*/ 

/**
* 用于Javascript Date类型的扩展
* @exports oc.date

* @example
* // returns 2015年01月01日
* oc.date.format('2015-01-01', 'yyyy年mm月dd日')
* @example
* // returns 一天的毫秒数（24 * 60 * 60000）
* oc.date.compare('2015-01-02', '2015-01-01')
*/
var ZDate = {};

/**
* 根据传入格式，格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.format = function(date, format){
    if(!date) {
        return '';
    }
    if(date.toString().indexOf('-') > 0 && date.toString().length === 10){
        date = date.toString().replace(/-/g, '/');
    }
    else if(/^\d{8}$/.test(date)) {
        date = date.toString().replace(/(\d{4})(\d{2})/g, '$1/$2/');
    };
    
    var reg = {
        yyyy: 'year',
        hh: 'hours',
        mm: 'month',
        dd: 'date',
        hh: 'hours',
        MM: 'minites',
        ss: 'seconds',
        ms: 'millSeconds'
    }
    
    var date = new Date(date);
    var model = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: date.getHours(),
        minites: date.getMinutes(),
        seconds: date.getSeconds(),
        millSeconds: date.getMilliseconds()
    }

    if(!format){
        format = 'yyyy-mm-dd';
    }
    
    for(var key in reg){
        var param = reg[key];
        var val = model[param];
        if(val.toString().length < 2){
            val = '0' + val.toString();
        }
        format = format.replace(key, val);
    }

    return format;
}

/**
* 根据传入格式，返回UTC时间的毫秒数
* @param {date} date 时间值 - 可以为Timespane
* @returns {number} UTC时间毫秒数
*/
ZDate.getUTCTimespan = function(date) {
    var date = new Date(date);
    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), 
        date.getUTCSeconds(), date.getUTCMilliseconds() );

    return date.getTime();
}

/**
* 根据传入格式，使用UTC时间格式化输出
* 格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.formatUTC = function(date, format) {
    if(!date) {
        return '';
    }
    var date = ZDate.getUTCTimespan(date);
    
    return ZDate.format(date, format);
}

/**
* 根据传入格式，使用PDT时间格式化输出
* 格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.formatPDT = function(date, format) {
    if(!date) {
        return '';
    }
    var date = ZDate.getUTCTimespan(date);
    
    var pdtDate = date - 8 * 60 * 60000;
    
    return ZDate.format(pdtDate, format);
}

/**
* 根据传入格式，使用北京时间格式化输出
* 格式化输出时间字符串
* @param {date} date 时间值 - 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {string} format 格式化输出方式 - yyyy年，mm月，dd天，hh小时，MM分钟，ss秒，ms，分秒
* @returns {string} 格式化后的字符串
*/
ZDate.formatCN = function(date, format) {
    if(!date) {
        return '';
    }
    var date = ZDate.getUTCTimespan(date);
    
    var cnData = date + 8 * 60 * 60000;
    
    return ZDate.format(cnData, format);
}


/**
* 根据传入格式，格式必须为 '2015-12-12 13:01:01'
* 格式化本地时间的Timespan
* @param {str} 时间字符串 - '2015-01-01'、'2015-01-01 12'、 '2015-01-01 12:11'、'2015-01-01 12:12:12'格式
* @returns {number} number timespan
*/
ZDate.getLocaleTimespan = function(str) {
    if(!str || typeof str !== 'string') {
        return null;
    }

    str = str.replace(/(^\s*)|(\s*$)/g, ""); 
    if(str.length < 10) {
        return null;
    }

    if(str.length === 10) { //2015-12-11格式
        str += ' 00:00:00';
    }
    else if(str.length === 13) { //2015-12-11 12 格式
        str += ':00:00';
    }

    return new Date(str).getTime();
}

/**
* 比较时间大小，返回date1 - date2得到的timespane
* @param {date} date1 - 时间被减数: 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @param {date}  date2 - 时间减数: 可以为Timespane，或者'2015/01/01'、'2015-01-01'或其他可new Date()的时间字符串
* @returns {number} date1 - date2得到的timespane
*/
ZDate.compare = function(date1, date2){
    if(typeof date1 == "string"){
        date1 = date1.replace(/-/g, '/');
    }
    if(typeof date2 == "string"){
        date2 = date2.replace(/-/g, '/');
    }

    var date1 = new Date(date1).getTime();
    var date2 = new Date(date2).getTime();

    return date1 - date2;
}   

/**
* 根据传入的年，获取该年一共有多少周
* @param {number} year 四位的年（2015）
* @returns {number} 这一年一共有多少周，（52/53）
*/
ZDate.getWeeksByYear = function(year){
    var ret = 52;

    var year = parseInt(year + "");
    
    var has53Years = [1994,2000,2005,2011,2016,2022,2028,2033,2039,2044,2050,2056,2061,2067,2072,2078,2084,2089,2095,2101,2107,2112,2118,2124,2129,2135,2140,2146,2152,2157,2163,2168,2174,2180,2185,2191,2196,2203,2208,2214,2220,2225,2231,2236,2242,2248,2253,2259,2264,2270,2276,2281,2287,2292,2298,2304,2310,2316,2321,2327,2332,2338,2344,2349,2355,2360,2366,2372,2377,2383,2388,2394];
    
    if($.inArray(year, has53Years) !== -1){
        ret ++;
    }

    return ret;
}

/**
* 根据传入的date字符串或者timespan，返回该天在这一年中的第几周中：201406 - 2015年06周
* @param {object} date 传入的date字符串（2014-12-12或者2014/12/12)，或者timespan，默认值为JS当天
* @returns {string} 该天在这一年中的第几周中，如：201406 - 2015年06周
*/
ZDate.getWeekString = function(date) {
    if (!date) {
        date = new Date();
    }
    if (typeof date === 'string') {
        if(date.indexOf('-') > -1){
            date = date.replace(/-/g, '/');
        }
        else{
            var year = date.slice(0, 4);
            var month = date.slice(4, 6);
            var day = date.slice(6);
            date = year + '/' + month + '/' + day;
        }
    }
    date = new Date(date);

    if (date.getMonth() == 11 && date.getDate() > 20) {
        var anotherDay = new Date(date);
        anotherDay.setDate(anotherDay.getDate() + 6 - anotherDay.getDay());

        if (anotherDay.getFullYear() > date.getFullYear()) {
            return anotherDay.getFullYear() * 100 + 1;
        }
    }
    var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    var day = firstDayOfYear.getDay();
    firstDayOfYear.setDate(8 - firstDayOfYear.getDay());

    if (firstDayOfYear > date) {
        return date.getFullYear() * 100 + 1;
    }
    var week = Math.floor((date - firstDayOfYear) / (1000 * 60 * 60 * 24 * 7));

    return date.getFullYear() * 100 + week + 2;
}

/**
* 根据传入的date字符串或者timespan，返回该天在这一年中的第几周中：201406 - 2015年06周
* @param {string} week 传入的周字符串，格式为:201510，代表2015年的第十周
* @returns {object} 该周的起始时间值
*/
ZDate.getStartDateByWeek = function(week) {
    if (!week) {
        return '';
    }

    if (typeof week === 'string') {
        week = parseInt(week);
    }

    var year = Math.floor(week / 100);
    var w = week % 100;
    var weekDate = new Date(year, 0, 1);

    weekDate.setDate((w - 1) * 7 + 1 - weekDate.getDay());

    return weekDate;
}

/**
* 根据传入的周，获取下一周
* @param {string} week 传入的周字符串，格式为:201510，代表2015年的第十周
* @returns {string} 该周的下一周
*/
ZDate.getNextWeek = function(week) {
    if (typeof week === 'string') {
        week = week.replace(/-/g, '');
        week = parseInt(week);
    }
    var year = Math.floor(week / 100);
    var w = week % 100;
    if (w < 52) {
        return year * 100 + w + 1;
    } 
    if (w == 53) {
        return (year + 1) * 100 + 1;
    } 
 
    if (this.getWeeksByYear(year) == 52) {
        return (year + 1) * 100 + 1;
    } 

    return year * 100 + w + 1;
}


/**
* 周选择器，类似与日期选择控件一样，用来选择周，如201523代表2015年第23周
* @param {object} ipt 输入周的输入框对象或者jquery选择器
*/
ZDate.weekPicker = function(ipt){
    var ipt = $(ipt);
    var initVal = $.trim(ipt.val());

    var reanderTable = function(){
        var tableContainer = $('<div class="zWeekPicker"><table></table></div>');
        var table = tableContainer.find('table');
        var thead = $('<thead></thead>').appendTo(table);
        var curr = new Date();
        if(!initVal){
            initVal = ZDate.getWeekString(curr).toString();
        }
        var year = initVal.slice(0, 4);
        var week = initVal.slice(4);
        
        thead.append('<tr><th colspan="100"><i class="icon-arrow-left"></i><span class="spanYear">' + year + '</span><i class="icon-arrow-right"></i></th></tr>');

        var tbody = $('<tbody></tbody>').appendTo(table);

        var weekCount = ZDate.getWeeksByYear(year);

        var tr = $('<tr></tr>').appendTo(tbody);
        for(var i = 0; i < weekCount; i++){
            if(i % 7 === 0){
                tr = $('<tr></tr>').appendTo(tbody);
            }
            var str = (i + 1).toString();
            if(i < 9){
                str = '0' + str;
            }
            tr.append('<td>' + str + '</td>')
        }
       
        tbody.find('td:contains(' + week + '):not(.zWeekPickerTag)').addClass('active');

        var weekStart = ZDate.getStartDateByWeek(year + week);

        var weekEnd = weekStart.getTime() + 6 * 24 * 60 * 60000;
        weekEnd = ZDate.format(weekEnd, 'mmdd');
        weekStart = ZDate.format(weekStart, 'mmdd');
        tbody.find('tr:last-child').append('<td colspan="10" class="zWeekPickerTag"><i class="icon-clock2"></i><span>' + weekStart + ' - ' + weekEnd + '</span></td>');

        table.on('click', 'thead i', function(e){
            var i = $(this);
            var eleYear = i.parent().find('.spanYear');
            var year = parseInt(eleYear.text());
            if(i.hasClass('icon-arrow-left')){
                year --;
            }
            else{
                year ++;
            }
            weekCount = ZDate.getWeeksByYear(year);
            if(weekCount == 52){
                table.find('td:contains(53)').remove();
            }
            else if(table.find('td:contains(53)').length === 0){
                // table.find('tbody tr:last-child').append('<td>53</td>');
                $('<td>53</td>').insertBefore(table.find('td.zWeekPickerTag'));
            }
            eleYear.html(year);
        })
        .on('mouseenter', 'tbody td:not(.zWeekPickerTag)', function(){
            var thisWeek = this.innerHTML;
            var thisYear = $(this).parents('table:eq(0)').find('.spanYear').html();
            var weekStart = ZDate.getStartDateByWeek(thisYear + thisWeek);
            var weekEnd = weekStart.getTime() + 6 * 24 * 60 * 60000;
            weekEnd = ZDate.format(weekEnd, 'mmdd');
            weekStart = ZDate.format(weekStart, 'mmdd');
            tbody.find('td.zWeekPickerTag span').html(weekStart + ' - ' + weekEnd);
        })
        .on('mouseleave', 'tbody', function() {
            var weekStart = ZDate.getStartDateByWeek(year + week);
            var weekEnd = new Date(weekStart).getTime() + 6 * 24 * 60 * 60000;
            weekEnd = ZDate.format(weekEnd, 'mmdd');
            weekStart = ZDate.format(weekStart, 'mmdd');
            
            tbody.find('td.zWeekPickerTag span').html(weekStart + ' - ' + weekEnd);
        })
        .on('click', function(e){
            e.stopPropagation();
        })

        $('body').on('click', function(){
            tableContainer.hide();
        })
        tableContainer.appendTo('body');

        return tableContainer;
    }


    var _put = function(dropBody, top, maxHeight, isTop) {
        dropBody.style.top = top + 'px';
        dropBody.style.maxHeight = maxHeight + 'px';
        if(isTop) {
            dropBody.style.transform = 'translate(0, -100%)';
        }
        else {
            dropBody.style.transform = 'none';
        }
    }

    var setPosition = function(dropBody, dropHead) {
        var bodyWidth = dropBody.clientWidth;
        var headWidth = dropHead.clientWidth;
        bodyWidth = bodyWidth > headWidth? bodyWidth : headWidth;
        this.isSetMinWidth && (dropBody.style.minWidth = bodyWidth + 'px');
        var docRight = document.documentElement.clientWidth + document.body.scrollLeft;
        var headLeft = $(dropHead).offset().left;

        var left = headLeft + bodyWidth > docRight? headLeft + headWidth - bodyWidth : headLeft;
        dropBody.style.left =  left + 'px';
        
        var docHeight = document.documentElement.clientHeight;
        var docTop = document.body.scrollTop;
        var docBottom = docHeight + document.body.scrollTop;
        var headTop = $(dropHead).offset().top;
        var headHeight = $(dropHead).outerHeight();
        var headBottom = headTop + headHeight;

        var bodyHeight = dropBody.clientHeight;

        var bottomSpace = docBottom - headBottom - 10;
        var topSpace = headTop - docTop - 50;
        
         // 可以放到下面
        if(bottomSpace > bodyHeight) {
            _put(dropBody, headBottom, bottomSpace);
            return -1;
        }
        
        //上面可以容纳
        if(topSpace > bodyHeight) {
            _put(dropBody, headTop, topSpace, true);
            return 1;
        }

        var maxHeight = (topSpace > bottomSpace? topSpace : bottomSpace) + 'px';
        // console.log('都容纳不了', [topSpace, bottomSpace, maxHeight, bodyHeight]);
        $(dropBody).css({'max-height': maxHeight});
        var isTop = topSpace > bottomSpace;
        _put(dropBody, isTop? headTop : headBottom, maxHeight, isTop);

        return isTop? 1: -1;
    }

    var setTablePosition = function(ipt){
        var ele = $('.zWeekPicker');
        if(ele.length === 0){
            ele = reanderTable();
        }
            
        // var offset = ipt.offset();
        var val = $.trim(ipt.val());

        if(!val || val.length !== 6) {
            val = ZDate.getWeekString(new Date()).toString();
        }
        var year = val.slice(0, 4);
        var week = val.slice(4);
        var weekStart = ZDate.getStartDateByWeek(year + week);
        var weekEnd = weekStart.getTime() + 6 * 24 * 60 * 60000;
        weekEnd = ZDate.format(weekEnd, 'mmdd');
        weekStart = ZDate.format(weekStart, 'mmdd');
        ele.find('.spanYear').html(year);
        ele.find('td.active').removeClass('active');
        ele.find('td:contains(' + week + '):not(.zWeekPickerTag)').addClass('active');
        ele.find('.zWeekPickerTag>span').html(weekStart + ' - ' + weekEnd);
        ele.css({ 'display': 'block' });
        
        setPosition(ele[0], ipt[0]);
        
        ele.find('table').off('click', 'tbody td:not(.zWeekPickerTag)').on('click', 'tbody td:not(.zWeekPickerTag)', function(){
            ele.hide();
            var year = ele.find('.spanYear').text();
            var week = $(this).html();
            var text = year + week
            ipt.val(text);
            
            ipt.change();
            // ev = document.createEvent("HTMLEvents");  
            // ev.initEvent("change", false, true);  
            // ipt[0].dispatchEvent(ev);  
        })

    }

    ipt = $(ipt);

    ipt.on('click', function(e){
        e.stopPropagation();
        setTablePosition(ipt);
    })
}   


module.exports = ZDate;