(function(){
	// window.$ = require('../jquery-2.1.3.min.js');
	window.oc = {};
	
	oc.ui = require('./ui');
	oc.dialog = require('./dialog');
	oc.localStorage = require('./localStorage');
	oc.FileView = require('./fileView');
	oc.Uploader = require('./uploader');
	oc.TreeSelect = require('./treeSelect');
	oc.BUSelect = require('./buSelect');
	oc.TreeDialogSelect = require('./treeDialogSelect');
	oc.Tree = require('./tree');
	oc.ImageCrop = require('./imageCrop');
	oc.Sidebar = require('./sidebar');
	oc.TreeOrganization = require('./treeOrganization');
	oc.TreePIS = require('./treePIS');
	oc.ajax = require('./ajax');
	oc.date = require('./date');
	oc.Table = require('./table');
	oc.location = require('./location');
	oc.tools = {
		dojo: require('./toolsDojo'),
		csv: require('./csvExport')
	}
	var cssPath = $('script[data-occss]').attr('data-occss');
	if(cssPath) {
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
		cssPath = cssPath.replace('oc.css', 'icons/style.css');
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
	}
	else {
		if(top.location.hastname === "local.oceanwing.com") {
			$("<script>").attr({type: "text/javascript", src: 'http://http://172.16.1.233:3009/dest/oc.css'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://http://172.16.1.233:3009/dest/oc.css'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://http://172.16.1.233:3009/dest/icons/style.css'}).appendTo("head");
		}
		else {
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://res.laptopmate.us/webapp/js/oc/oc.css'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://res.laptopmate.us/webapp/js/oc/icons/style.css'}).appendTo("head");
		}
	}
})()