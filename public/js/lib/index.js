(function(){
	// window.$ = require('../jquery-2.1.3.min.js');
	window.oc = {};
	
	oc.ui = require('./ui');
	oc.dialog = require('./dialog');
	oc.localSorage = require('./localStorage');
	oc.FileView = require('./fileView');
	oc.Uploader = require('./uploader');
	oc.TreeSelect = require('./treeSelect');
	oc.TreeDialogSelect = require('./treeDialogSelect');
	oc.Tree = require('./tree');
	oc.Sidebar = require('./sidebar');
	oc.TreeOrganization = require('./treeOrganization');
	oc.ajax = require('./ajax');
	
	var cssPath = $('script[data-occss]').attr('data-occss');
	if(cssPath){
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
		cssPath.replace('oc.css', 'icons/style.css');
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: cssPath}).appendTo("head");
	}
	else{
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: '//ui.tinyp2p.com/dest/oc.css'}).appendTo("head");
		$("<link>").attr({ rel: "stylesheet", type: "text/css", href: '//ui.tinyp2p.com/icons/style.css'}).appendTo("head");
	}
})()