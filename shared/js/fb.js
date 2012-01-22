(function(){
    window.FB = window.FB || {};



    /*
    Copyright (c) 2008 Stefan Lange-Hegermann

    @modified frenkie 2011
     - moved the onreadystatechange according to http://snook.ca/archives/javascript/xmlhttprequest_activex_ie
     - changed the getRequest also according to the above mentioned blogpost

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    */
    FB.ajax = function(url, callbackFunction){

        this.bindFunction = function (caller, object) {
            return function() {
                return caller.apply(object, [object]);
            };
        };

        this.stateChange = function (object) {
            if (this.request.readyState==4)
                this.callbackFunction(this.request.responseText);
        };

        this.getRequest = function() {
            var transport;
            // check native support first
            if(window.XMLHttpRequest) {
                return function(){ return new XMLHttpRequest() };
            }else{
                // check for version 6 before version 3
                try{
                        transport = new ActiveXObject("MSXML2.XMLHTTP.6.0");
                    if( transport){
                        return function(){ return new ActiveXObject("MSXML2.XMLHTTP.6.0") };
                    }

                }catch(e){}
                try{
                    if(!transport){
                          transport = new ActiveXObject("MSXML2.XMLHTTP");
                       if(transport){
                           return function(){ return new ActiveXObject("MSXML2.XMLHTTP"); };
                       }
                    }
                }catch(e){}
            }
            return function(){};
        }();

        this.postBody = (arguments[2] || "");

        this.callbackFunction = callbackFunction || function(){};
        this.url=url;
        this.request = this.getRequest();

        if(this.request) {
            var req = this.request;

            if (this.postBody!=="") {
                req.open("POST", url, true);
                req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.setRequestHeader('Connection', 'close');
            } else {
                req.open("GET", url, true);
            }

            req.onreadystatechange = this.bindFunction(this.stateChange, this);
            req.send(this.postBody);
        }
    };

    FB.addEvent = function(){
        if (document.addEventListener){
            return function(elem, event, callback){
                return elem.addEventListener(event, callback, false);
            };
        }else if (document.attachEvent) { // IE DOM
            return function(elem, event, callback){
                return elem.attachEvent("on"+event, callback);
            };
        }else{
            return function(){};
        }
    }();

})();