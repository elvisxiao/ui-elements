(function(){
	// window.$ = require('../jquery-2.1.3.min.js');
	window.oc = {};
	
	oc.ui = require('./ui');
	oc.algorithm = require('./algorithm');
	oc.dialog = require('./dialog');
	oc.dropdown = require('./dropdown');
	oc.localStorage = require('./localStorage');
	oc.FileView = require('./fileView');
	oc.Uploader = require('./uploader');
	oc.select = require('./select');
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
		csv: require('./csvExport'),
		table: require('./toolsTable'),
		number: require('./toolsNumber'),
		form: require('./toolsForm')
	}
	var cssPath = $('script[data-occss]').attr('data-occss');
	if(cssPath) {
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
		cssPath = cssPath.replace('oc.css', 'icons/style.css');
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
	}
	else {
		if(location.href.indexOf('ocdebug') > -1) {
			// $("<script>").attr({type: "text/javascript", src: 'http://172.16.1.233:3009/dest/oc.js'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://localhost:3009/dest/oc.css'}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://localhost:3009/icons/style.css'}).appendTo("head");
		}
		else {
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://static.oceanwing.com/webapp/js/oc/oc.css?r=' + Math.random()}).appendTo("head");
			$("<link>").attr({ rel: "stylesheet", type: "text/css", href: 'http://static.oceanwing.com/webapp/js/oc/icons/style.css?r=' + + Math.random()}).appendTo("head");
		}
	}

	window.z && (window.z = oc.dialog);
	$(function() {
		window.z && (window.z = oc.dialog);
	})
	setTimeout(function() {
		window.z && (window.z = oc.dialog);
	}, 1000)
})()