
var piperka;
if (!piperka) piperka = {};

if (!piperka.AJAXRequest) (function(){
    const Cc = Components.classes, Ci = Components.interfaces,
          Cr = Components.results, Cu = Components.utils;

    /** @class Alternative to {@link XmlHttpRequest} with HTML support.
     *
     * @description Prepares a new AJAX request.
     * @param {nsIURI|string} uri the absolute URI to be requested
     */
    piperka.AJAXRequest = function (uri) {
        const ios = Cc[ "@mozilla.org/network/io-service;1" ]
                    .getService( Ci.nsIIOService );

        // get an nsIURI from whatever the caller gave us
        if (typeof uri === 'string') {
            this._uri = uri = ios.newURI( uri, null, null );
        } else {
            this._uri = uri = uri.QueryInterface( Ci.nsIURI );
        }
        
        // verify that they gave us an HTTP URI
        if (!uri.schemeIs( "http" ) && !uri.schemeIs( "https" ))
            throw new Error( "only HTTP(S) requests are supported" );
        
        this._channel = ios.newChannelFromURI( uri )
                        .QueryInterface( Ci.nsIHttpChannel );
        this._channel.notificationCallbacks = this.listeners;
    };
    const C = piperka.AJAXRequest;
    const P = C.prototype = {};

    P.__defineGetter__( 'uri', function() {
        return this._uri;
    });

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
                Ci.nsIProgressEventSink,
                //Ci.nsIChannelEventSink,
                Ci.nsIRequestObserver,
                Ci.nsIStreamListener
            ];

        L.QueryInterface = function (iid) {
            if (!L._interfaces.some(
                    function (v) { return iid.equals( v ); } )
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

        L.onProgress = function (request, context, current, max) {};
        L.onStatus = function (request, context, statCode, statArg) {};

        L.onStartRequest = function (request, context) {
            
        };

        L.onStopRequest = function (request, context, status) {

        };

        L.onDataAvailable = function (request, context, stream, offset, count) {

        };

        return L;
    }); // end listeners

})(); // end anonymouse closure scope
