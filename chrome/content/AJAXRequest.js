
var piperka;
if (!piperka) piperka = {};

if (!piperka.AJAXRequest) (function(){
    const Cc = Components.classes, Ci = Components.interfaces,
          Cr = Components.results, Cu = Components.utils;

    /** @class Wrapper for {@link XmlHttpRequest} for JS modules.
     *
     * @description Prepares a new AJAX request.
     * @param {string} uri the absolute URI to be requested
     */
    piperka.AJAXRequest = function (uri) {
        this._uri = uri;
        
        var request = Cc[ '@mozilla.org/xmlextras/xmlhttprequest;1' ]
        	.createInstance( Ci.nsIDOMEventTarget );

		request.addEventListener( 'load',  this.listeners.onLoad,  false );
		request.addEventListener( 'error', this.listeners.onError, false );

		this._request = request =
			request.QueryInterface( Ci.nsIXMLHttpRequest );
		request.open( 'GET', this._uri, true );
		
		req.responseType = 'document';

		request.channel.notificationCallbacks = this.listeners;
    };
    const C = piperka.AJAXRequest;
    const P = C.prototype = {};

    P.__defineGetter__( 'listeners', function() {
        if (this._listeners) return this._listeners;
        const L = this._listeners = {};
        const request = this;

        L._interfaces = [
                Ci.nsISupports,
                Ci.nsIInterfaceRequestor,
                Ci.nsIBadCertListener2,
                Ci.nsISSLErrorListener,
                Ci.nsIPrompt,
                Ci.nsIAuthPrompt,
                Ci.nsIAuthPromptProvider,
                Ci.nsIProgressEventSink
            ];

        L.QueryInterface = function (iid) {
            if (!L._interfaces.some(
                    function (v) { return iid.equals( v ); } ) )
                throw Cr.NS_ERROR_NO_INTERFACE;

            switch (iid) {
            case Ci.nsIPrompt:
                return L._prompt;
            case Ci.nsIAuthPrompt:
                return L._authPrompt;
            default:
                return L;
            }
        };
        L.getInterface = L.QueryInterface;

        function promptNotImplemented() {
            throw Cr.NS_ERROR_NOT_IMPLEMENTED;
        }

        function promptAuthFail() {
            request._authFailed = true;
            return false;
        }

        L._prompt = {
            QueryInterface: L.QueryInterface,
            getInterface:   L.QueryInterface,
            alert:          promptNotImplemented,
            alertCheck:     promptNotImplemented,
            confirm:        promptNotImplemented,
            confirmCheck:   promptNotImplemented,
            confirmEx:      promptNotImplemented,
            prompt:         promptNotImplemented,
            select:         promptNotImplemented,
            promptPassword: promptAuthFail,
            promptUsernameAndPassword: promptAuthFail
        };

        L._authPrompt = {
            QueryInterface: L.QueryInterface,
            getInterface:   L.QueryInterface,
            prompt: promptAuthFail,
            promptPassword: promptAuthFail,
            promptUsernameAndPassword: promptAuthFail
        };

        L.getAuthPrompt = function() {
            request._authFailed = true;
            throw Cr.NS_ERROR_NOT_AVAILABLE;
        };

        L.notifyCertProblem = function() {
            return true;
        };

        L.notifySSLError = function() {
            return true;
        };

        L.onProgress = function (channel, context, current, max) {};
        L.onStatus = function (channel, context, statCode, statArg) {};

        L.onLoad = function (event) {};
        L.onError = function (event) {};

        return L;
    }); // end listeners

    P.send = function() {
    	request.send( null );
    };
})(); // end anonymous closure scope
