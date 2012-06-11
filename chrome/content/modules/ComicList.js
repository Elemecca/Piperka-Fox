
var piperka;
if (!piperka) piperka = {};

if (!piperka.ComicList) (function(){
	
	piperka.ComicList = function () {
		this._user = "elemecca_test";
		
		this.fetchComicList = this.fetchComicList.bind( this );
		this.parseComicList = this.parseComicList.bind( this );
		this.fetchUpdateList = this.fetchUpdateList.bind( this );
		this.parseUpdateList = this.parseUpdateList.bind( this );
	};
	const C = piperka.ComicList;
	const P = piperka.ComicList.prototype = {};
	
	P.fetchComicList = function (offset) {
		var request = new piperka.AJAXRequest(
				"http://piperka.net/profile.html?name="
				+ encodeURIComponent( this._user ) + "&offset=" + offset );
		request.addCallback( this.parseComicList );
		request.send();
	};
	
	P.parseComicList = function (request) {
		var document = request.getDocument();
		
		var result = document.evaluate( '//ul[@class="list"]/li/a',
				document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
		if (null == result) {
			// TODO: handle error
		}
		
		var anchor;
		while (null != (anchor = result.iterateNext())) {
			var match = anchor.getAttribute( 'href' ).match(
					/^info.html\?cid=(\d+)$/ );
			if (null == match) {
				// TODO: handle error
			}
			
			var comic_id = match[ 1 ];
			var comic = this._comics[ comic_id ] = {
					id: comic_id,
					name: anchor.innerText
				};
			
			this._comics_sort_name.push( comic );
		}
		
		// find the link to the next page
		result = document.evaluate(
				'//div[@id="paginate"]/a[text()="Next"]',
				document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null );
		if (null != result) {
			match = result.singleNodeValue.getAttribute( 'href' ).match(
					/^updates.html\?offset=(\d+)$/ );
			this.fetchUpdateList( match[ 1 ] );
		}
	};
	
	P.fetchUpdateList = function (offset) {
		var request = new piperka.AJAXRequest(
				"http://piperka.net/updates.html?offset=" + offset );
		request.addCallback( this.parseUpdateList );
		request.send();
	};
	
	P.parseUpdateList = function (request) {
		var document = request.getDocument();
		
		var result = document.evaluate( '//ul[@class="list"]/li/a',
				document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
		if (null == result) {
			// TODO: handle error
		}
		
		var anchor;
		while (null != (anchor = result.iterateNext())) {
			var match = anchor.getAttribute( 'href' ).match(
					/^updates.html\?redir=(\d+)&csrf_ham=([^&]+)$/ );
			if (null == match) {
				// TODO: handle error
			}
			
			var comic_id = match[ 1 ];
			this._csrf_ham = match[ 2 ];
			
			match = anchor.nextSibling.textContent.match( /^\((\d+) new\)$/ );
			if (null == match) {
				// TODO: handle error
			}
			
			var comic = this._comics[ comic_id ];
			comic.updates = match[ 1 ];
			
			this._comics_sort_updates.push( comic );
		}
		
		// find the link to the next page
		result = document.evaluate(
				'//div[@id="paginate"]/a[text()="Next"]',
				document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null );
		if (null != result) {
			match = result.singleNodeValue.getAttribute( 'href' ).match(
					/^updates.html\?offset=(\d+)$/ );
			this.fetchUpdateList( match[ 1 ] );
		}
	};
	
})(); // end anonymous closure scope