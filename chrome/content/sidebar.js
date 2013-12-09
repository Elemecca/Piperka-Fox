
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

function init_sidebar (list) {
    pk_log( "done loading" );
	var tree = document.getElementById( 'comic-list' );
	tree.view = new piperka.treeView( list );

	doneLoading();
}

window.addEventListener( 'load', function () {
	pk_log( "saw load event" );
	
    var that = this;
	var list = new piperka.ComicList();
	list.fetchComicList( 0, function() {
        list.fetchUpdateList( 0, function() {
            that.init_sidebar( list );
        });
    });
}, false );
