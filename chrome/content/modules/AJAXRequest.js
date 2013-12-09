
var piperka;
if (!piperka) piperka = {};

if (!piperka.AJAXRequest) (function(){
    const Cc = Components.classes, Ci = Components.interfaces,
          Cr = Components.results, Cu = Components.utils;

    /** @class Wrapper for {@link XMLHttpRequest} for JS modules.
     *
     * @description Prepares a new AJAX request.
     * @param {string} uri the absolute URI to be requested
     */
    piperka.AJAXRequest = function (uri) {
        this._uri = uri;
        this._callbacks = new Array();
        this._sent = false;
        this._completed = false;
        this._failed = false;
        
        var request = Cc[ '@mozilla.org/xmlextras/xmlhttprequest;1' ]
        	.createInstance( Ci.nsIXMLHttpRequest );

        var emitter = request.QueryInterface( Ci.nsIDOMEventTarget );
        
		emitter.addEventListener( 'load',  this.listeners.onLoad,  false );
		emitter.addEventListener( 'error', this.listeners.onError, false );

		request.onreadystatechange = function() {
			pk_log( "AJAXRequest ready " + request.readyState );
		}
		
		// prevent the request from triggering the throbber or showing prompts
		request.mozBackgroundRequest = true;
		
		request.open( 'GET', this._uri, true );
		
		// the response is an HTML document, parse it
		request.responseType = "document";
		
		this._request = request;
    };
    const C = piperka.AJAXRequest;
    const P = C.prototype = {};

    P.__defineGetter__( 'listeners', function() {
        if (this._listeners) return this._listeners;
        const L = this._listeners = {};
        const request = this;

        L._interfaces = [
                Ci.nsISupports,
                Ci.nsIInterfaceRequestor
            ];

        L.QueryInterface = function (iid) {
            if (!L._interfaces.some(
                    function (v) { return iid.equals( v ); } ) )
                throw Cr.NS_ERROR_NO_INTERFACE;

            return L;
        };
        L.getInterface = L.QueryInterface;

        L.onLoad = function (event) {
        	request._completed = true;
        	
        	pk_log( "AJAXRequest onLoad" );
        	
        	for (var idx = 0; idx < request._callbacks.length; idx++) {
        		try {
        			request._callbacks[ idx ]( request );
        		} catch (caught) {
        			// XXX: figure out how to report this
        		}
        	}
        };
        
        L.onError = function (event) {
        	request._completed = true;
        	request._failed = true;
        	
        	pk_log( "AJAXRequest onError" );
        };

        return L;
    }); // end listeners

    P.addCallback = function (listener) {
    	if (this._sent)
    		throw new Error( "request has already been sent" );
    	if (typeof listener !== 'function')
    		throw new Error( "listener must be a function" );
    	
    	this._callbacks.push( listener );
    };
    
    P.send = function() {
    	if (this._sent) throw new Error( "request has already been sent" );
    	
    	this._request.send( null );
    	pk_log( "AJAXRequest sent" );
    	this._sent = true;
    };
    
    P.getDocument = function() {
    	pk_log( "completed: " + this._completed + ", failed: " + this._failed );
    	
    	if (!this._completed)
    		throw new Error( "request has not yet completed" );
    	if (this._failed)
    		throw new Error( "request failed" );
    	
    	var doc = this._request.responseXML;
    	pk_log( "document: " + typeof( doc ) );
    	pk_log( "document: " + doc );
    	//if (null == doc)
    	//	throw new Error( "response wrong content type or unparsable" );
    	
    	pk_log( "before return" );
    	
    	return doc;
    };
})(); // end anonymous closure scope
