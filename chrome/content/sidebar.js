
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
	window.setTimeout( init_sidebar, 2000 );
}, false );