var instance = {}

var setThWidth = function(originTable){
	var newTable = originTable.next('.zTableFixHead');
	newTable.find('thead tr').each(function(i){
		var tr = $(this);
		var trOrigin = originTable.find('tr:eq(' + i + ')');
		tr.find('th').each(function(j){
			var th = $(this);
			var thOrigin = trOrigin.find('th:eq(' + j + ')');
			th.css('width', thOrigin.outerWidth());
		})
	})
}

var setStyle = function(originTable){
	var newTable = originTable.next('.zTableFixHead');
	originTable.parent().scrollTop(0);
	var position = originTable.position();

	newTable.css({
		position: 'absolute',
		left: position.left,
		width: originTable.width(),
		top:  position.top
	})
}

var setScrollLeft = function(originTable){
	var newTable = originTable.next('.zTableFixHead');

	newTable.css({
		left: originTable.position().left
	})
}

instance.fixHead = function(eles){
	eles = $(eles);
	eles.each(function(){
		var table = $(this);
		
		table.next('.zTableFixHead').remove();
		newTable = $(this).clone().addClass('zTableFixHead');
		newTable.find('tbody, tfoot').remove();

		var originHead = table.find('thead');
		table.after(newTable);

		setThWidth(table);
		setStyle(table);

		table.parent().on('scroll', function(){
			if(timer){
				clearTimeout(timer);
			}
			else{
				var timer = setTimeout(function(){
					eles.each(function(){
						var table = $(this);
						setScrollLeft(table);
					})
				}, 100);
			}
		})
	})

	$(window).on('resize', function(){
		if(timer){
			clearTimeout(timer);
		}
		else{
			var timer = setTimeout(function(){
				eles.each(function(){
					var table = $(this);
					setThWidth(table);
					setStyle(table);
				})
			}, 100);
		}
	})
}


module.exports = instance;
