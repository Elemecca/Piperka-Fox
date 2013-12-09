
const Cc = Components.classes, Ci = Components.interfaces;

function pk_log (message) {
	Cc[ "@mozilla.org/consoleservice;1" ]
			.getService( Ci.nsIConsoleService )
			.logStringMessage( "piperka: " + message );
}

function doneLoading() {
	var page = document.getElementsByTagName( 'page' )[ 0 ];
	page.className = '';
}

function init_sidebar() {
	var tree = document.getElementById( 'comic-list' );
	tree.view = new piperka.treeView();

	doneLoading();
}

window.addEventListener( 'load', function () {
	pk_log( "saw load event" );
	
	var list = new piperka.ComicList();
	list.fetchComicList( 0 );
}, false );