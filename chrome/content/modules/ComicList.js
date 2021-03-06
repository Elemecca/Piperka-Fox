
var piperka;
if (!piperka) piperka = {};

if (!piperka.ComicList) (function(){
	
	piperka.ComicList = function () {
		pk_log( "constructing ComicList" );
		this._user = "elemecca_test";
        this._comics = {};
        this._comics_sort_name = new Array();
        this._comics_sort_updates = new Array();
		
		this.fetchComicList = this.fetchComicList.bind( this );
		this.parseComicList = this.parseComicList.bind( this );
		this.fetchUpdateList = this.fetchUpdateList.bind( this );
		this.parseUpdateList = this.parseUpdateList.bind( this );
	};
	const C = piperka.ComicList;
	const P = piperka.ComicList.prototype = {};

    P.count = function() {
        return this._comics_sort_name.length;
    }

    P.getComicByNameIndex = function (index) {
        return this._comics_sort_name[ index ];
    }

	P.fetchComicList = function (offset, callback) {
		pk_log( "fetching list at offset " + offset );
	
        var request = new XMLHttpRequest();
        request.mozBackgroundRequest = true;
        request.open( 'GET',
				"http://piperka.net/profile.html?sort=name&name="
				+ encodeURIComponent( this._user ) + "&offset=" + offset );
        request.responseType = "document";
        request.onload = this.parseComicList.bind( this, callback );
		request.send();
	};
	
	P.parseComicList = function (callback, event) {
		pk_log( "got list response" );
        var request = event.target;
        if (200 != request.status) {
            pk_log( "list request failed: " + request.statusText );
            return;
        }
		var res_doc = request.responseXML;
		
		pk_log( "after getDocument()" );
		pk_log( "result " + typeof( res_doc ) );
		pk_log( "list is " + res_doc.documentURI );
		
		var result = res_doc.evaluate( '//ul[@class="list"]/li/a',
				res_doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
		if (null == result) {
			// TODO: handle error
		}
		
		var anchor;
		while (null != (anchor = result.iterateNext())) {
            var href = anchor.getAttribute( 'href' );
            if (null == href) continue;

			var match = href.match( /^info.html\?cid=(\d+)$/ );
			if (null == match) {
				// TODO: handle error
                continue;
			}
			
			var comic_id = match[ 1 ];
			var comic = this._comics[ comic_id ] = {
					id: comic_id,
					name: anchor.textContent,
                    updates: 0
				};
			
			this._comics_sort_name.push( comic );
		}
		
		// find the link to the next page
        var next = res_doc.querySelector( '.paginate a.next' );
		if (null != next) {
			var href = next.getAttribute( 'href' );
            if (null == href) {
                callback();
                return;
            }

            var match = href.match( /^profile.html\?(?:.*&)?offset=(\d+)$/ );
			this.fetchComicList( match[ 1 ], callback );
		}
	};
	
	P.fetchUpdateList = function (offset, callback) {
        var request = new XMLHttpRequest();
        request.mozBackgroundRequest = true;
        request.open( 'GET',
				"http://piperka.net/updates.html?offset=" + offset );
        request.onload = this.parseUpdateList.bind( this, callback );
        request.responseType = "document";
		request.send();
	};
	
	P.parseUpdateList = function (callback, event) {
        var request = event.target;
        if (200 != request.status) {
            pk_log( 'update list request failed: ' + request.statusText );
            return;
        }
		var res_doc = request.responseXML;
		
		var result = res_doc.evaluate( '//ul[@class="list"]/li/a',
				res_doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );
		if (null == result) {
			// TODO: handle error
		}
		
		var anchor;
		while (null != (anchor = result.iterateNext())) {
			var href = anchor.getAttribute( 'href' );
            if (null == href) continue;
            
            var match = href.match(
					/^updates.html\?redir=(\d+)&csrf_ham=([^&]+)$/ );
			if (null == match) {
				// TODO: handle error
			}
			
			var comic_id = match[ 1 ];
			this._csrf_ham = match[ 2 ];
			
			match = anchor.nextSibling.textContent.match( /\((\d+) new\)/ );
			if (null == match) {
				// TODO: handle error
			}
			
			var comic = this._comics[ comic_id ];
			comic.updates = match[ 1 ];
			
			this._comics_sort_updates.push( comic );
		}
		
		// find the link to the next page
        var next = res_doc.querySelector( '.paginate a.next' );
		if (null != next) {
			var href = next.getAttribute( 'href' )
            if (null == href) {
                callback();
                return;
            }
            
            var match = href.match( /^updates.html\?offset=(\d+)$/ );
			this.fetchUpdateList( match[ 1 ], callback );
		}
	};
	
})(); // end anonymous closure scope
