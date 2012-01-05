
var piperka;
if (!piperka) piperka = {};

if (!piperka.ajaxRequest) (function(){
    var Cc = Components.classes, Ci = Components.interfaces,
        Cr = Components.results, Cu = Components.utils;

    /** 
     */
    piperka.ajaxRequest = function (uri) {
        this._uri = uri;
    };
    var P = piperka.ajaxRequest.prototype = {};

    P.__defineGetter__( 'listeners', function() {
        if (this._listeners) return this._listeners;
        var L = this._listeners = {};
        var request = this;

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

        return L;
    }); // end listeners

    P.__defineGetter__( 'uri', function() {
        return this._uri;
    });

    P.open = function() {
        var request = Cc[ '@mozilla.org/xmlextras/xmlhttprequest;1' ]
                .createInstance( Ci.nsIDOMEventTarget );
        


        request = request.QueryInterface( Ci.nsIXMLHttpRequest );
        request.open( 'GET', this._uri, true );

        request.channel.notificationCallbacks = this.listeners;

        request.send( null );
    };
})(); // end anonymouse closure scope
