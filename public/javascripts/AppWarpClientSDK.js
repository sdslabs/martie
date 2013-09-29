//
// AppWarp globals
//

var AppWarpServerHost = "ws://appwarp.shephertz.com:12346";
var WarpClient = {};
var ConnectionRequestObservers = new Array();
var LobbyRequestObservers = new Array();
var ZoneRequestObservers = new Array();
var RoomRequestObservers = new Array();
var ChatRequestObservers = new Array();
var UpdateRequestObservers = new Array();
var NotificationObservers = new Array();
var AppWarpApiKey = "";
var AppWarpSecretKey = "";
var AppWarpSessionId = 0;

//
// SHA1 and Base64
//

var Base64 = (function() {
    var maxLineLength = 76;
    var base64chars =  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

   var decode = function(encStr) {
        var base64charToInt = {};
        for (var i = 0; i < 64; i++) base64charToInt[base64chars.substr(i,1)] = i;
        encStr = encStr.replace(/\s+/g, "");
        var decStr = "";
        var decArray=new Array();
        var linelen = 0
        var el=encStr.length;
        var bits24;
        for (var i = 0; i < el; i += 4) {
            bits24  = ( base64charToInt[encStr.charAt(i)] & 0xFF  ) <<  18;
            bits24 |= ( base64charToInt[encStr.charAt(i+1)] & 0xFF  ) <<  12;
            bits24 |= ( base64charToInt[encStr.charAt(i+2)] & 0xFF  ) <<   6;
            bits24 |= ( base64charToInt[encStr.charAt(i+3)] & 0xFF  ) <<   0;
            decStr += String.fromCharCode((bits24 & 0xFF0000) >> 16);
            if (encStr.charAt(i + 2) != '=')  // check for padding character =
                decStr += String.fromCharCode((bits24 &   0xFF00) >>  8);
            if (encStr.charAt(i + 3) != '=')  // check for padding character =
                decStr += String.fromCharCode((bits24 &     0xFF) >>  0);
            if(decStr.length>1024)
            {
                decArray.push(decStr);
                decStr='';
            }
        }
        if(decStr.length>0)
        {
            decArray.push(decStr);
        }

        var ar2=new Array();
        for(;decArray.length>1;)
        {
            var l=decArray.length;
            for(var c=0;c<l;c+=2)
            {
                if(c+1==l)
                {
                    ar2.push(decArray[c]);
                }
                else
                {
                    ar2.push(''+decArray[c]+decArray[c+1]);
                }
            }
            decArray=ar2;
            ar2=new Array();
        }
        return decArray[0];
    };

    var encode = function(decStr)
    {
        var encArray=new Array();
        var bits, dual, i = 0, encOut = "";
        var linelen = 0;
        var encOut='';
        while(decStr.length >= i + 3){
            bits =    (decStr.charCodeAt(i++) & 0xff) <<16 |
                (decStr.charCodeAt(i++) & 0xff) <<8 |
                decStr.charCodeAt(i++) & 0xff;
            encOut +=
                base64chars.charAt((bits & 0x00fc0000) >>18) +
                base64chars.charAt((bits & 0x0003f000) >>12) +
                base64chars.charAt((bits & 0x00000fc0) >> 6) +
                base64chars.charAt((bits & 0x0000003f));
            linelen += 4;
            if (linelen>maxLineLength-3) {
                encOut += "\n";
                encArray.push(encOut);
                encOut='';
                linelen = 0;
            }
        }
        if(decStr.length -i > 0 && decStr.length -i < 3) {
            dual = Boolean(decStr.length -i -1);
            bits =
                ((decStr.charCodeAt(i++) & 0xff) <<16) |
                (dual ? (decStr.charCodeAt(i) & 0xff) <<8 : 0);
            encOut +=
                base64chars.charAt((bits & 0x00fc0000) >>18) +
                base64chars.charAt((bits & 0x0003f000) >>12) +
                      (dual ? base64chars.charAt((bits & 0x00000fc0) >>6) : '=') +
                      '=';
        }

        encArray.push(encOut);
        // this loop progressive concatonates the
        // array elements entil there is only one
        var ar2=new Array();
        for(;encArray.length>1;)
        {
            var l=encArray.length;
            for(var c=0;c<l;c+=2)
            {
                if(c+1==l)
                {
                    ar2.push(encArray[c]);
                }
                else
                {
                    ar2.push(''+encArray[c]+encArray[c+1]);
                }
            }
            encArray=ar2;
            ar2=new Array();
        }
        return encArray[0];
    };
    return {"encode": encode, "decode": decode};
})();

(function(){
    var charSize=8,b64pad="",hexCase=0,str2binb=function(a){
        var b=[],mask=(1<<charSize)-1,length=a.length*charSize,i;
        for(i=0;i<length;i+=charSize){
            b[i>>5]|=(a.charCodeAt(i/charSize)&mask)<<(32-charSize-(i%32))
            }
            return b
        },hex2binb=function(a){
        var b=[],length=a.length,i,num;
        for(i=0;i<length;i+=2){
            num=parseInt(a.substr(i,2),16);
            if(!isNaN(num)){
                b[i>>3]|=num<<(24-(4*(i%8)))
                }else{
                return"INVALID HEX STRING"
                }
            }
        return b
    },binb2hex=function(a){
    var b=(hexCase)?"0123456789ABCDEF":"0123456789abcdef",str="",length=a.length*4,i,srcByte;
    for(i=0;i<length;i+=1){
        srcByte=a[i>>2]>>((3-(i%4))*8);
        str+=b.charAt((srcByte>>4)&0xF)+b.charAt(srcByte&0xF)
        }
        return str
    },binb2b64=function(a){
    var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+"0123456789+/",str="",length=a.length*4,i,j,triplet;
    for(i=0;i<length;i+=3){
        triplet=(((a[i>>2]>>8*(3-i%4))&0xFF)<<16)|(((a[i+1>>2]>>8*(3-(i+1)%4))&0xFF)<<8)|((a[i+2>>2]>>8*(3-(i+2)%4))&0xFF);
        for(j=0;j<4;j+=1){
            if(i*8+j*6<=a.length*32){
                str+=b.charAt((triplet>>6*(3-j))&0x3F)
                }else{
                str+=b64pad
                }
            }
        }
    return str
},rotl=function(x,n){
    return(x<<n)|(x>>>(32-n))
    },parity=function(x,y,z){
    return x^y^z
    },ch=function(x,y,z){
    return(x&y)^(~x&z)
    },maj=function(x,y,z){
    return(x&y)^(x&z)^(y&z)
    },safeAdd_2=function(x,y){
    var a=(x&0xFFFF)+(y&0xFFFF),msw=(x>>>16)+(y>>>16)+(a>>>16);
    return((msw&0xFFFF)<<16)|(a&0xFFFF)
    },safeAdd_5=function(a,b,c,d,e){
    var f=(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF)+(e&0xFFFF),msw=(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(e>>>16)+(f>>>16);
    return((msw&0xFFFF)<<16)|(f&0xFFFF)
    },coreSHA1=function(f,g){
    var W=[],a,b,c,d,e,T,i,t,appendedMessageLength,H=[0x67452301,0xefcdab89,0x98badcfe,0x10325476,0xc3d2e1f0],K=[0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x5a827999,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x6ed9eba1,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0x8f1bbcdc,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6,0xca62c1d6];
    f[g>>5]|=0x80<<(24-(g%32));
    f[(((g+65)>>9)<<4)+15]=g;
    appendedMessageLength=f.length;
    for(i=0;i<appendedMessageLength;i+=16){
        a=H[0];
        b=H[1];
        c=H[2];
        d=H[3];
        e=H[4];
        for(t=0;t<80;t+=1){
            if(t<16){
                W[t]=f[t+i]
                }else{
                W[t]=rotl(W[t-3]^W[t-8]^W[t-14]^W[t-16],1)
                }
                if(t<20){
                T=safeAdd_5(rotl(a,5),ch(b,c,d),e,K[t],W[t])
                }else if(t<40){
                T=safeAdd_5(rotl(a,5),parity(b,c,d),e,K[t],W[t])
                }else if(t<60){
                T=safeAdd_5(rotl(a,5),maj(b,c,d),e,K[t],W[t])
                }else{
                T=safeAdd_5(rotl(a,5),parity(b,c,d),e,K[t],W[t])
                }
                e=d;
            d=c;
            c=rotl(b,30);
            b=a;
            a=T
            }
            H[0]=safeAdd_2(a,H[0]);
        H[1]=safeAdd_2(b,H[1]);
        H[2]=safeAdd_2(c,H[2]);
        H[3]=safeAdd_2(d,H[3]);
        H[4]=safeAdd_2(e,H[4])
        }
        return H
    },jsSHA=function(a,b){
    this.sha1=null;
    this.strBinLen=null;
    this.strToHash=null;
    if("HEX"===b){
        if(0!==(a.length%2)){
            return"TEXT MUST BE IN BYTE INCREMENTS"
            }
            this.strBinLen=a.length*4;
        this.strToHash=hex2binb(a)
        }else if(("ASCII"===b)||('undefined'===typeof(b))){
        this.strBinLen=a.length*charSize;
        this.strToHash=str2binb(a)
        }else{
        return"UNKNOWN TEXT INPUT TYPE"
        }
    };

jsSHA.prototype={
    getHash:function(a){
        var b=null,message=this.strToHash.slice();
        switch(a){
            case"HEX":
                b=binb2hex;
                break;
            case"B64":
                b=binb2b64;
                break;
            default:
                return"FORMAT NOT RECOGNIZED"
                }
                if(null===this.sha1){
            this.sha1=coreSHA1(message,this.strBinLen)
            }
            return b(this.sha1)
        },
    getHMAC:function(a,b,c){
        var d,keyToUse,i,retVal,keyBinLen,keyWithIPad=[],keyWithOPad=[];
        switch(c){
            case"HEX":
                d=binb2hex;
                break;
            case"B64":
                d=binb2b64;
                break;
            default:
                return"FORMAT NOT RECOGNIZED"
                }
                if("HEX"===b){
            if(0!==(a.length%2)){
                return"KEY MUST BE IN BYTE INCREMENTS"
                }
                keyToUse=hex2binb(a);
            keyBinLen=a.length*4
            }else if("ASCII"===b){
            keyToUse=str2binb(a);
            keyBinLen=a.length*charSize
            }else{
            return"UNKNOWN KEY INPUT TYPE"
            }
            if(64<(keyBinLen/8)){
            keyToUse=coreSHA1(keyToUse,keyBinLen);
            keyToUse[15]&=0xFFFFFF00
            }else if(64>(keyBinLen/8)){
            keyToUse[15]&=0xFFFFFF00
            }
            for(i=0;i<=15;i+=1){
            keyWithIPad[i]=keyToUse[i]^0x36363636;
            keyWithOPad[i]=keyToUse[i]^0x5C5C5C5C
            }
            retVal=coreSHA1(keyWithIPad.concat(this.strToHash),512+this.strBinLen);
        retVal=coreSHA1(keyWithOPad.concat(retVal),672);
        return(d(retVal))
        }
    };

window.jsSHA=jsSHA
}());

//
// JSON
//

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

//
// AppWarp client
//

(function() {
	var socket;
	// Connection
    this.initialize = function(pubKey, pvtKey) {
		AppWarpApiKey = pubKey;
		AppWarpSecretKey = pvtKey;
    };

	this.connect = function() {
	  socket = new WebSocket(AppWarpServerHost);
	  socket.binaryType = "arraybuffer";		
	  socket.onopen = function(){	  
			var count = ConnectionRequestObservers.length;		
			for( var i = 0; i < count; i++ ){
			   ConnectionRequestObservers[i].onConnectDone( resultcode_success );	
			}
		}
	  socket.onclose = function(){
			var count = ConnectionRequestObservers.length;		
			for( var i = 0; i < count; i++ ){
			   ConnectionRequestObservers[i].onConnectDone( resultcode_connection_error );	
			}
		}
	  socket.onmessage = this.onMessage;
	};
	
	this.joinZone = function(username) {
		 var bytes = buildAuthRequest(username);
		 socket.send(bytes.buffer);	
	};
	
	this.disconnect = function() {
		socket.close();
		var count = ConnectionRequestObservers.length;		
		for( var i = 0; i < count; i++ ){
		   ConnectionRequestObservers[i].onDisconnectDone( resultcode_success );	
		}
	};
	
	// Lobby
	this.joinLobby = function() {
		 var bytes = buildLobbyRequest(request_type_join_lobby);
		 socket.send(bytes.buffer);	
	};
	
	this.leaveLobby = function() {
		 var bytes = buildLobbyRequest(request_type_leave_lobby);
		 socket.send(bytes.buffer);	
	};
	 this.subscribeLobby = function() {
		 var bytes = buildLobbyRequest(request_type_subscribe_lobby);
		 socket.send(bytes.buffer);	
	};
	this.unSubscribeLobby = function() {
		 var bytes = buildLobbyRequest(request_type_unsubscribe_lobby);
		 socket.send(bytes.buffer);	
	};
	this.getLiveLobbyInfo = function() {
		 var bytes = buildLobbyRequest(request_type_get_lobby_info);
		 socket.send(bytes.buffer);	
	};
	
	// Zone
	this.createRoom = function(name, owner, max) {
		 var params = {};
		 params.name = name;
		 params.owner = owner;
		 params.maxUsers = max;
		 var payloadString = JSON.stringify(params);
		 var bytes = buildWarpRequest(request_type_create_room,payloadString);
		 socket.send(bytes.buffer);
	};
	
	this.deleteRoom = function(roomId) {
		 var bytes = buildRoomRequest(request_type_delete_room,roomId);
		 socket.send(bytes.buffer);	
	};
	
	this.getAllRooms = function() {
		 var bytes = buildWarpRequest(request_type_get_rooms,"");
		 socket.send(bytes.buffer);	
	};
	this.getOnlineUsers = function() {
		 var bytes = buildWarpRequest(request_type_get_users,"");
		 socket.send(bytes.buffer);	
	};
	this.getLiveUserInfo = function(username) {
		 var params = {};
		 params.name = username;		 
		 var payloadString = JSON.stringify(params);
		 var bytes = buildWarpRequest(request_type_get_user_info,payloadString);
		 socket.send(bytes.buffer);	
	};
	this.setCustomUserData = function(userName,customData) {
		 var params = {};
		 params.name = userName;	
		 params.data = customData;
		 var payloadString = JSON.stringify(params);	
		 var bytes = buildWarpRequest(request_type_set_custom_user_data,payloadString);
		 socket.send(bytes.buffer);	
	};
	
    // Room 
	this.subscribeRoom = function(roomId) {
		 var bytes = buildRoomRequest(request_type_subscribe_room,roomId);
		 socket.send(bytes.buffer);	
	};
	this.unSubscribeRoom = function(roomId) {
		 var bytes = buildRoomRequest(request_type_unsubscribe_room,roomId);
		 socket.send(bytes.buffer);	
	};
	this.joinRoom = function(roomId) {
		 var bytes = buildRoomRequest(request_type_join_room,roomId);
		 socket.send(bytes.buffer);	
	};
	this.leaveRoom = function(roomId) {
		 var bytes = buildRoomRequest(request_type_leave_room,roomId);
		 socket.send(bytes.buffer);	
	};
	this.getLiveRoomInfo = function(roomId) {
		 var bytes = buildRoomRequest(request_type_get_room_info,roomId);
		 socket.send(bytes.buffer);	
	};
	this.setCustomRoomData = function(roomId,customRoomData) {
		var params = {};
		params.id = roomId;
		params.data = customRoomData;
		var payloadString = JSON.stringify(params);	
		var bytes = buildWarpRequest(request_type_set_custom_room_data, payloadString);	  	
		socket.send(bytes.buffer);
	};
	
	// Chat
	this.sendChat = function(msg) {
		 if(msg.length >= 512){
			var count = ConnectionRequestObservers.length;		
			for( var i = 0; i < count; i++ ){
			   ChatRequestObservers[i].onSendChatDone( resultcode_bad_request );	
			}
			return;
		 }
		 var params = {};
		 params.chat= msg;		
		 var payloadString = JSON.stringify(params);	
		 var bytes = buildWarpRequest(request_type_chat, payloadString); 
		 socket.send(bytes.buffer);	
	};
	
	// update
	 this.sendUpdate = function(update) {
		 if(update.length >= 512){
			var count = UpdateRequestObservers.length;		
			for( var i = 0; i < count; i++ ){
			   UpdateRequestObservers[i].onSendUpdateDone( resultcode_bad_request );	
			}
			return;
		 }	 
		 var bytes = buildWarpRequest(request_type_update_peers, update, false);
		 socket.send(bytes.buffer);	
	}; 

	this.addNotificationListener = function(observer){
		if(!observer.onRoomCreated || !observer.onRoomDestroyed || !observer.onUserLeftRoom ||
		   !observer.onUserJoinedRoom || !observer.onUserLeftLobby || !observer.onUserJoinedLobby ||
		   !observer.onChatReceived || !observer.onUpdatePeersReceived){
		   throw 'incomplete notification observer implementation';
		}	
		NotificationObservers.push(observer);
	}
	this.removeNotificationListener = function(observer){
		var i = NotificationObservers.indexOf( observer, 0 );
		NotificationObservers.splice(i, 1);
	}
	
	this.addRoomRequestListener = function(observer){
		if(!observer.onSubscribeRoomDone || !observer.onUnsubscribeRoomDone || !observer.onJoinRoomDone ||
		   !observer.onLeaveRoomDone || !observer.onGetLiveRoomInfoDone || !observer.onSetCustomRoomDataDone){
		   throw 'incomplete room request observer implementation';
		}
		RoomRequestObservers.push(observer);
	}
	this.removeRoomRequestListener = function(observer){
		var i = RoomRequestObservers.indexOf( observer, 0 );
		RoomRequestObservers.splice(i, 1);
	}
	
	this.addZoneRequestListener = function(observer){
		if(!observer.onCreateRoomDone || !observer.onDeleteRoomDone || !observer.onGetAllRoomsDone ||
		   !observer.onGetOnlineUsersDone || !observer.onGetLiveUserInfoDone || !observer.onSetCustomUserInfoDone){
		   throw 'incomplete zone request observer implementation';
		}		
		ZoneRequestObservers.push(observer);
	}	
	this.removeZoneRequestListener = function(observer){
		var i = ZoneRequestObservers.indexOf( observer, 0 );
		ZoneRequestObservers.splice(i, 1);
	}
	
	this.addConnectionRequestListener = function(observer){
		if(!observer.onConnectDone || !observer.onJoinZoneDone || !observer.onDisconnectDone){
		   throw 'incomplete connection request observer implementation';
		}	
		ConnectionRequestObservers.push(observer);
	}
	this.removeConnectionRequestListener = function(observer){
		var i = ConnectionRequestObservers.indexOf( observer, 0 );
		ConnectionRequestObservers.splice(i, 1);
	}
	
	this.addLobbyRequestListener = function(observer){
		if(!observer.onJoinLobbyDone || !observer.onLeaveLobbyDone || !observer.onSubscribeLobbyDone ||
		   !observer.onUnsubscribeLobbyDone || !observer.onGetLiveLobbyInfoDone){
		   throw 'incomplete lobby request observer implementation';
		}	
		LobbyRequestObservers.push(observer);
	}	
	this.removeLobbyRequestListener = function(observer){
		var i = LobbyRequestObservers.indexOf( observer, 0 );
		LobbyRequestObservers.splice(i, 1);
	}

	this.addChatRequestListener = function(observer){
		if(!observer.onSendChatDone){
		   throw 'incomplete chat request observer implementation';
		}		
		ChatRequestObservers.push(observer);
	}	
	this.removeChatRequestListener = function(observer){
		var i = ChatRequestObservers.indexOf( observer, 0 );
		ChatRequestObservers.splice(i, 1);
	}

	this.addUpdateRequestListener = function(observer){
		if(!observer.onSendUpdateDone){
		   throw 'incomplete update request observer implementation';
		}	
		UpdateRequestObservers.push(observer);
	}	
	this.removeUpdateRequestListener = function(observer){
		var i = UpdateRequestObservers.indexOf( observer, 0 );
		UpdateRequestObservers.splice(i, 1);
	}	
	
   // Message
	this.onMessage = function(msg){
		 var bytearray = new Uint8Array(msg.data);
		 var numRead = bytearray.length;
		 var numDecoded = 0;
		 while(numDecoded < numRead){
			 if(bytearray[numDecoded] == message_type_response){
				numDecoded += handleResponse(bytearray, numDecoded);
			 }
			 else{
				numDecoded += handleNotify(bytearray, numDecoded);
			 }		 
		 }	   
	};
}).apply(WarpClient);

	function handleNotify(bytearray, startIndex){
		var notify = buildNotify(bytearray, startIndex);
		if(notify.updateType == update_type_room_created){		
			var payLoadString = bin2String(notify.payLoad);
			var data = new RoomData(payLoadString);
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onRoomCreated( data );	
			}
		}
		if(notify.updateType == update_type_room_deleted){
			var payLoadString = bin2String(notify.payLoad);
			var data = new RoomData(payLoadString);
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onRoomDestroyed( data );	
			}
		}		
		if(notify.updateType == update_type_update_peers){
			var event = new UpdateEvent(notify.payLoad);
			
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onUpdatePeersReceived(event);
			}			
		}
		if(notify.updateType == update_type_user_joined_lobby){
			var payLoadString = bin2String(notify.payLoad);
			var data = new LobbyData(payLoadString);			
			var payLoadObj = JSON.parse(payLoadString);
			
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onUserJoinedLobby(data, payLoadObj.user);
			}
		}		
		if(notify.updateType == update_type_user_left_lobby){
			var payLoadString = bin2String(notify.payLoad);
			var data = new LobbyData(payLoadString);			
			var payLoadObj = JSON.parse(payLoadString);
			
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onUserLeftLobby(data, payLoadObj.user);
			}
		}
		if(notify.updateType == update_type_user_joined_room){
			var payLoadString = bin2String(notify.payLoad);
			var data = new RoomData(payLoadString);
			var payLoadObj = JSON.parse(payLoadString);
			
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onUserJoinedRoom(data, payLoadObj.user);
			}
		}		
		if(notify.updateType == update_type_user_left_room){
			var payLoadString = bin2String(notify.payLoad);
			var data = new RoomData(payLoadString);
			var payLoadObj = JSON.parse(payLoadString);
			
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onUserLeftRoom(data, payLoadObj.user);
			}
		}
		if(notify.updateType == update_type_chat){
			var payLoadString = bin2String(notify.payLoad);
			var event = new ChatEvent(payLoadString);
			
			var count = NotificationObservers.length;		
			for( var i = 0; i < count; i++ ){
			   NotificationObservers[i].onChatReceived(event);
			}
		}		
		return (notify.payLoad.length+8);
	}
	
	function handleResponse(bytearray, startIndex){
		 var response = buildResponse(bytearray, startIndex);
		 if(response.requestType == request_type_auth){
			handleAuthResponse(response);
		 }	
		 if(response.requestType == request_type_join_lobby){
			handleJoinLobbyResponse(response);
		 }	
         if(response.requestType == request_type_leave_lobby){
			handleLeaveLobbyResponse(response);
		 }	
         if(response.requestType == request_type_subscribe_lobby){
			handleSubscribeLobbyResponse(response);
		 }	
        if(response.requestType == request_type_unsubscribe_lobby){
			handleUnsubscribeLobbyResponse(response);
		 }
        if(response.requestType == request_type_get_lobby_info){
			handleLiveLobbyInfoResponse(response);
		 }	
        if(response.requestType == request_type_create_room){
			handleCreateRoomResponse(response);
		 }
        if(response.requestType == request_type_delete_room){
			handleDeleteRoomResponse(response);
		 }	
        if(response.requestType == request_type_get_rooms){
			handleGetAllRoomsResponse(response);
		 }	
        if(response.requestType == request_type_get_users){
			handleGetOnlineUsersResponse(response);
		 }	
        if(response.requestType == request_type_get_user_info){
			handleGetLiveUserInfoResponse(response);
		 }
        if(response.requestType == request_type_set_custom_user_data){
			handleSetCustomUserDataResponse(response);
		 }	
        if(response.requestType == request_type_subscribe_room){
			handleSubscribeRoomResponse(response);
		 }	
        if(response.requestType == request_type_unsubscribe_room){
			handleUnsubscribeRoomResponse(response);
		 }	
        if(response.requestType == request_type_join_room){
			handleJoinRoomResponse(response);
		 }
        if(response.requestType == request_type_leave_room){
			handleLeaveRoomResponse(response);
		 }
        if(response.requestType == request_type_get_room_info){
			handleLiveRoomInfoResponse(response);
		 }	
        if(response.requestType == request_type_set_custom_room_data){
			handleSetCustomRoomDataResponse(response);
		 }	
	   if(response.requestType == request_type_chat){
			handleSendChatResponse(response);
		 }
        if(response.requestType == request_type_update_peers){
			handleSendUpdateResponse(response);
		 }	
		return (response.payLoad.length+9);
	}
    // Connection Response
	function handleAuthResponse(authResponse){
		if(authResponse.resultCode == resultcode_success){
			var payLoad = bin2String(authResponse.payLoad);
			var payLoadObj = JSON.parse(payLoad);		
			AppWarpSessionId = parseInt(payLoadObj.sessionid);
		}
	    var count = ConnectionRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ConnectionRequestObservers[i].onJoinZoneDone( authResponse.resultCode );	
		}
	}
	
   // Lobby Response
	function handleJoinLobbyResponse(lobbyResponse){
		var event = new LobbyEvent(lobbyResponse.resultCode, lobbyResponse.payLoad);
	    var count = LobbyRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   LobbyRequestObservers[i].onJoinLobbyDone( event );	
		}
	}
	function handleLeaveLobbyResponse(lobbyResponse){
		var event = new LobbyEvent(lobbyResponse.resultCode, lobbyResponse.payLoad);
	    var count = LobbyRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   LobbyRequestObservers[i].onLeaveLobbyDone( event );	
		}		
	}
	function handleSubscribeLobbyResponse(lobbyResponse){
		var event = new LobbyEvent(lobbyResponse.resultCode, lobbyResponse.payLoad);
	    var count = LobbyRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   LobbyRequestObservers[i].onSubscribeLobbyDone( event );	
		}		
	}
	function handleUnsubscribeLobbyResponse(lobbyResponse){
		var event = new LobbyEvent(lobbyResponse.resultCode, lobbyResponse.payLoad);
	    var count = LobbyRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   LobbyRequestObservers[i].onUnsubscribeLobbyDone( event );	
		}
	}
    function handleLiveLobbyInfoResponse(lobbyResponse){
		var event = new LiveRoomInfoEvent(lobbyResponse.resultCode, lobbyResponse.payLoad);
	    var count = LobbyRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   LobbyRequestObservers[i].onGetLiveLobbyInfoDone( event );	
		}
	}
   
	// Zone Response
	function handleCreateRoomResponse(zoneResponse){
		var event = new RoomEvent(zoneResponse.resultCode, zoneResponse.payLoad);
	    var count = ZoneRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ZoneRequestObservers[i].onCreateRoomDone(event);
		}
	}
	function handleDeleteRoomResponse(zoneResponse){
		var event = new RoomEvent(zoneResponse.resultCode, zoneResponse.payLoad);
	    var count = ZoneRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ZoneRequestObservers[i].onDeleteRoomDone(event);
		}
	}
	function handleGetAllRoomsResponse(zoneResponse){
		var event = new AllRoomsEvent(zoneResponse.resultCode, zoneResponse.payLoad);
	    var count = ZoneRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ZoneRequestObservers[i].onGetAllRoomsDone(event);
		}
	}
    function handleGetOnlineUsersResponse(zoneResponse){
		var event = new AllUsersEvent(zoneResponse.resultCode, zoneResponse.payLoad);
	    var count = ZoneRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ZoneRequestObservers[i].onGetOnlineUsersDone(event);
		}
	}
	function handleGetLiveUserInfoResponse(zoneResponse){
		var event = new LiveUserInfoEvent(zoneResponse.resultCode, zoneResponse.payLoad);
	    var count = ZoneRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ZoneRequestObservers[i].onGetLiveUserInfoDone(event);
		}
	}
	function handleSetCustomUserDataResponse(zoneResponse){
		var event = new LiveUserInfoEvent(zoneResponse.resultCode, zoneResponse.payLoad);
	    var count = ZoneRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ZoneRequestObservers[i].onSetCustomUserInfoDone(event);
		}
	}
	
	// Room Response
	function handleSubscribeRoomResponse(roomResponse){
		var event = new RoomEvent(roomResponse.resultCode, roomResponse.payLoad);
	    var count = RoomRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   RoomRequestObservers[i].onSubscribeRoomDone(event);
		}
	}
	function handleUnsubscribeRoomResponse(roomResponse){
		var event = new RoomEvent(roomResponse.resultCode, roomResponse.payLoad);
	    var count = RoomRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   RoomRequestObservers[i].onUnsubscribeRoomDone(event);
		}
	}
	function handleJoinRoomResponse(roomResponse){
		var event = new RoomEvent(roomResponse.resultCode, roomResponse.payLoad);
	    var count = RoomRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   RoomRequestObservers[i].onJoinRoomDone(event);
		}
	}
	function handleLeaveRoomResponse(roomResponse){
		var event = new RoomEvent(roomResponse.resultCode, roomResponse.payLoad);
	    var count = RoomRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   RoomRequestObservers[i].onLeaveRoomDone(event);
		}
	}
	function handleLiveRoomInfoResponse(roomResponse){
		var event = new LiveRoomInfoEvent(roomResponse.resultCode, roomResponse.payLoad);
	    var count = RoomRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   RoomRequestObservers[i].onGetLiveRoomInfoDone(event);
		}
	}
	function handleSetCustomRoomDataResponse(roomResponse){
		var event = new LiveRoomInfoEvent(roomResponse.resultCode, roomResponse.payLoad);
	    var count = RoomRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   RoomRequestObservers[i].onSetCustomRoomDataDone(event);
		}
	}
	
	// Chat Response
	function handleSendChatResponse(chatResponse){
	    var count = ChatRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   ChatRequestObservers[i].onSendChatDone(chatResponse.resultCode);
		}
	}
	// Update Response
	function handleSendUpdateResponse(updateResponse){
	    var count = UpdateRequestObservers.length;		
	    for( var i = 0; i < count; i++ ){
		   UpdateRequestObservers[i].onSendUpdateDone(updateResponse.resultCode);
		}
	}
	
	function buildResponse(responseBytes, startIndex){
		var response = {};
		response.messageType = responseBytes[startIndex+0];
		response.requestType = responseBytes[startIndex+1];
		response.resultCode = responseBytes[startIndex+2];
		response.reserved = responseBytes[startIndex+3];
		response.payLoadType = responseBytes[startIndex+4];
		response.payLoadSize = bytesToIntger(responseBytes,startIndex+5);
		response.payLoad = new Uint8Array(response.payLoadSize);
		for(var i=0;i<response.payLoadSize;i++){
			response.payLoad[i] = responseBytes[9+startIndex+i];
		}
		return response;
	}	  

	function buildNotify(responseBytes, startIndex){
		var notify = {};
		notify.messageType = responseBytes[startIndex+0];
		notify.updateType = responseBytes[startIndex+1];
		notify.reserved = responseBytes[startIndex+2];
		notify.payLoadType = responseBytes[startIndex+3];
		notify.payLoadSize = bytesToIntger(responseBytes,startIndex+4);
		notify.payLoad = new Uint8Array(notify.payLoadSize);
		for(var i=0;i<notify.payLoadSize;i++){
			notify.payLoad[i] = responseBytes[8+startIndex+i];
		}
		return notify;
	}
	
	  function buildAuthRequest(username){
		//Construct the payload		
		var timeStamp = getODataUTCDateFilter();
		var params = {};
		params.apiKey = AppWarpApiKey;
		params.version = "0.1";
		params.timeStamp = timeStamp;
		params.user = username;
		var shaObj = new jsSHA(sortAssoc(params), "ASCII");
		var hmac = shaObj.getHMAC(AppWarpSecretKey, "ASCII", "HEX");
		var signature = Convert(hmac);
		params.signature = signature;		
		var payloadString = JSON.stringify(params);	
		return buildWarpRequest(request_type_auth, payloadString);
	  }
	  
	  function buildWarpRequest(requestType, payload, isText){
		// Construct binary warp request
		var bytearray = new Uint8Array(16+payload.length);
		bytearray[0] = message_type_request;	// message type: request
		bytearray[1] = requestType;	// request type
		
		// bytes 2-5 : session id
		bytearray[2] = AppWarpSessionId>>>24;
		bytearray[3] = AppWarpSessionId>>>16;
		bytearray[4] = AppWarpSessionId>>>8;
		bytearray[5] = AppWarpSessionId;
		// bytes 6-9 : request id
		for(var i=6; i<=9; i++){
			bytearray[i] = 0;
		}
		// byte 10: reserved
		bytearray[10] = 0;
		
		// byte 11 : payload type String, Binary, JSON
		
		if(payload.length > 0 && requestType!=request_type_update_peers){
			bytearray[11] = payload_type_json;	// TODO: change for chat/update messages
		}
		else{
			bytearray[11] = payload_type_binary;	// TODO: change for chat/update messages
		}
		
		// byte 12-15: payload size
		var payloadSize = payload.length;
		bytearray[12] = payloadSize>>>24;
		bytearray[13] = payloadSize>>>16;
		bytearray[14] = payloadSize>>>8;
		bytearray[15] = payloadSize;
		
		// bytes 16 onwards : actual payload	
		if(isText == false){
			for (var i = 0; i < payloadSize; ++i)
			{
				bytearray[16+i] = payload[i];
			}
		}
		else{
			for (var i = 0; i < payloadSize; ++i)
			{
				bytearray[16+i] = payload.charCodeAt(i);
			}				
		}
		return bytearray;		
	  }
	  	  
	  function buildLobbyRequest(requestType){
		var params = {};
		params.isPrimary = true;		
		var payloadString = JSON.stringify(params);	
		return buildWarpRequest(requestType, payloadString);	  
	  }
	  	  
	  function buildRoomRequest(code, id){
		var params = {};
		params.id = id;
		var payloadString = JSON.stringify(params);	
		return buildWarpRequest(code, payloadString);	  
	  }	  
	  
//	  
// AppWarp Utils		  
//

function bin2String(array) {
	var str = "";
	for(var i = 0; i < array.length; i ++) {
		var char = array[i];
		str += String.fromCharCode(char);
	}
	return str;
}	
	

function bytesToIntger(bytes, offset){
					
	var value = 0;
	for (var i = 0; i < 4; i++)
	{
		value = (value << 8) + (bytes[offset + i] & 0xff);
	}  
	
	return value;
}

function sortAssoc(arrayVal)
{
	var aTemp = [];
	for (var sKey in arrayVal)
		aTemp.push([sKey, arrayVal[sKey]]);

	aTemp.sort(function(a,b)
	{
		return ((a[0] > b[0]) ? -1 : ((a[0] < b[0]) ? 1 : 0));
	});

	var aOutPutString = "";
	var aOutput = [];
	for (var nIndex = aTemp.length-1; nIndex >=0; nIndex--){
		aOutput[aTemp[nIndex][0]] = aTemp[nIndex][1];
		aOutPutString+= aTemp[nIndex][0]+aTemp[nIndex][1];
	}
	return aOutPutString;
}	 

function getODataUTCDateFilter(date) {
	var date = new Date();
	var monthString;
	var rawMonth = (date.getUTCMonth()+1).toString();
	if (rawMonth.length == 1) {
		monthString = "0" + rawMonth;
	}
	else
	{
		monthString = rawMonth;
	}

	var dateString;
	var rawDate = date.getUTCDate().toString();
	if (rawDate.length == 1) {
		dateString = "0" + rawDate;
	}
	else
	{
		dateString = rawDate;
	}
	//var DateFilter = "datetime\'";
	var DateFilter = "";
	DateFilter += date.getUTCFullYear() + "-";
	DateFilter += monthString + "-";
	DateFilter += dateString;
	DateFilter += "T" + date.getUTCHours() + ":";
	DateFilter += date.getUTCMinutes() + ":";
	DateFilter += date.getUTCSeconds() + ".";
	DateFilter += date.getUTCMilliseconds();
	DateFilter += "Z";
	return DateFilter;
}

//
// AppWarp Events	
//

function AllRoomsEvent(code, payload) {
	
	this.result = 0;		
	if(code == resultcode_success){		
		var payLoadString = bin2String(payload);
		var payLoadObj = JSON.parse(payLoadString);
		var ids = payLoadObj.ids;
		this.roomIdArray = ids.split(";");
		if(this.roomIdArray.length>0){
			this.roomIdArray.pop();
		}
	}	
}
	
function AllUsersEvent(code, payload) {	
	this.result = 0;		
	if(code == resultcode_success){		
		var payLoadString = bin2String(payload);
		var payLoadObj = JSON.parse(payLoadString);
		var usernames = payLoadObj.names;
		this.userNameArray = usernames.split(";");
		if(this.userNameArray.length>0){
			this.userNameArray.pop();
		}
	}	
}

function ChatEvent(payloadString) {	
	var payLoadObj = JSON.parse(payloadString);
	this.chat = payLoadObj.chat;
	this.sender = payLoadObj.sender;
	this.locid = payLoadObj.id;
	this.isLocationLobby = false;
	if(payLoadObj.isLobby){
		this.isLocationLobby = true;	
	}
}

function UpdateEvent(payload) {	
	this.update = payload;
}

function RoomData(payload) {	
	var payLoadObj = JSON.parse(payload);
	this.id = payLoadObj.id;
	this.owner = payLoadObj.owner;
	this.maxUsers = payLoadObj.maxUsers;
	this.name = payLoadObj.name;
}

function LobbyData(payload) {
	var payLoadObj = JSON.parse(payload);
	this.lobbyid = payLoadObj.id;
	this.owner = payLoadObj.owner;
	this.maxUsers = payLoadObj.maxUsers;
	this.name = payLoadObj.name;
	this.isPrimary = payLoadObj.isPrimary;		
}

function RoomEvent(code, payload) {	
	this.result = code;
	if(code == resultcode_success){	
		var payLoadString = bin2String(payload);
		this.roomdata = new RoomData(payLoadString);
	}	
}

function LobbyEvent(code, payload) {		
	this.result = code;
	if(code == resultcode_success){	
		var payLoadString = bin2String(payload);
		this.lobbydata = new LobbyData(payLoadString);
	}	
}

function LiveRoomInfoEvent(code, payload) {
	this.result = code;
	if(code == resultcode_success){		
		var payLoadString = bin2String(payload);
		this.roomdata = new RoomData(payLoadString);		
		var payLoadObj = JSON.parse(payLoadString);
		this.customData = payLoadObj.data
		var usernames = payLoadObj.usernames;
		this.userNameArray = usernames.split(";");
		if(this.userNameArray.length>0){
			this.userNameArray.pop();
		}
	}
}

function LiveUserInfoEvent(code, payload) {
	this.result = code;
	if(code == resultcode_success){		
		var payLoadString = bin2String(payload);
		var payLoadObj = JSON.parse(payLoadString);
		this.locId = payLoadObj.locationId;
		this.name = payLoadObj.name;
		this.customData = payLoadObj.custom;
		this.isLobby = payLoadObj.isLobby;	
	}
}

//
// Request Type Codes
//	
var request_type_auth = 1;
var request_type_join_lobby = 2;
var request_type_subscribe_lobby = 3;   
var request_type_unsubscribe_lobby = 4;    
var request_type_leave_lobby = 5;    
var request_type_create_room = 6;    
var request_type_join_room = 7;    
var request_type_subscribe_room = 8;    
var request_type_unsubscribe_room = 9;    
var request_type_leave_room = 10;    
var request_type_delete_room = 11;    
var request_type_chat = 12;    
var request_type_update_peers = 13;    
var request_type_signout = 14;
var request_type_create_zone = 15;
var request_type_delete_zone = 16;  
var request_type_get_rooms = 17;
var request_type_get_users = 18;
var request_type_get_user_info = 19;
var request_type_get_room_info = 20;
var request_type_set_custom_room_data = 21;
var request_type_set_custom_user_data = 22;        
var request_type_get_lobby_info = 23;

//
// Payload Type Codes
//	
var payload_type_flat_string = 0;    
var payload_type_binary = 1;    
var payload_type_json = 2;

//
// Warp Message Type
//	
var message_type_request = 0;    
var message_type_response = 1;    
var message_type_update = 2;

//
// Warp Response Result Code 
//
var resultcode_success = 0; 	
var resultcode_auth_error = 1;    	
var resultcode_resource_not_found = 2;    	
var resultcode_resource_moved = 3;     	
var resultcode_bad_request = 4;	
var resultcode_connection_error = 5;	
var resultcode_unknown_error = 6;

//
//  Warp Notify
//
var update_type_room_created = 1;
var update_type_room_deleted = 2;
var update_type_user_joined_lobby = 3;
var update_type_user_left_lobby = 4;
var update_type_user_joined_room = 5;
var update_type_user_left_room = 6;
var update_type_user_online = 7;
var update_type_user_offline = 8;
var update_type_chat = 9;
var update_type_update_peers = 10;    

//
// AppWarp Utilities
//
function clean_hex(input, remove_0x) {
	input = input.toUpperCase();

	if (remove_0x) {
	  input = input.replace(/0x/gi, "");
	}

	var orig_input = input;
	input = input.replace(/[^A-Fa-f0-9]/g, "");
	if (orig_input != input)
		alert ("Warning! Non-hex characters in input string ignored.");
	return input;
}

var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
function binary_to_base64(input) {
  var ret = new Array();
  var i = 0;
  var j = 0;
  var char_array_3 = new Array(3);
  var char_array_4 = new Array(4);
  var in_len = input.length;
  var pos = 0;

  while (in_len--)
  {
	  char_array_3[i++] = input[pos++];
	  if (i == 3)
	  {
		  char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
		  char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
		  char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
		  char_array_4[3] = char_array_3[2] & 0x3f;

		  for (i = 0; (i <4) ; i++){
			  var valueToAppend = base64_chars.charAt(char_array_4[i]);
			  if(valueToAppend == '+'){
				valueToAppend = '%2B';
			  }
			  else if(valueToAppend == '/'){
				valueToAppend = '%2F';
			  }
			  ret += valueToAppend;
			  }
		  i = 0;
	  }
  }

  if (i)
  {
	  for (j = i; j < 3; j++)
		  char_array_3[j] = 0;

	  char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
	  char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
	  char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
	  char_array_4[3] = char_array_3[2] & 0x3f;

	  for (j = 0; (j < i + 1); j++){
		  var valueToAppend = base64_chars.charAt(char_array_4[j]);
		  if(valueToAppend == '+'){
			valueToAppend = '%2B';
		  }
		  ret += valueToAppend;			  
	  }
	  while ((i++ < 3))
		  ret += '%3D';

  }

  return ret;
}

function Convert(hexString) {
  var cleaned_hex = clean_hex(hexString, false);
  if (cleaned_hex.length % 2) {
	alert ("Error: cleaned hex string length is odd.");
	document.frmConvert.base64.value = "";
	return false;
  }
  var binary = new Array();
  for (var i=0; i<cleaned_hex.length/2; i++) {
	var h = cleaned_hex.substr(i*2, 2);
	binary[i] = parseInt(h,16);
  }
  return binary_to_base64(binary);
  //document.frmConvert.base64.value = binary_to_base64(binary);
}	