
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
        	.createInstance( Ci.nsIDOMEventTarget );

		request.addEventListener( 'load',  this.listeners.onLoad,  false );
		request.addEventListener( 'error', this.listeners.onError, false );

		request = request.QueryInterface( Ci.nsIXMLHttpRequest );
		request.open( 'GET', this._uri, true );
		
		// the response is an HTML document, parse it
		request.responseType = 'document';
		
		// prevent the request from triggering the throbber or showing prompts
		request.mozBackgroundRequest = true;
		
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
        	this._completed = true;
        	
        	for (var idx = 0; idx < request._callbacks.length; idx++) {
        		try {
        			request._callbacks[ idx ]( request );
        		} catch (caught) {
        			// XXX: figure out how to report this
        		}
        	}
        };
        
        L.onError = function (event) {
        	this._completed = true;
        	this._failed = true;
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
    	
    	this._sent = true;
    };
    
    P.getDocument = function() {
    	if (!this._completed)
    		throw new Error( "request has not yet completed" );
    	if (this._failed)
    		throw new Error( "request failed" );
    	
    	var document = this._request.responseXML;
    	if (null == document)
    		throw new Error( "response wrong content type or unparsable" );
    	
    	return document;
    };
})(); // end anonymous closure scope
