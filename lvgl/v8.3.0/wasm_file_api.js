// ============================== FILE I/O (sync => bad) =================================

import { FS } from './micropython.js';
import assets from './assets.js';


window.urls = {"name":"webcache","id":-1, "index": "/index.html"}



var searchParams = new URL(window.top.location.href).searchParams;

var scriptLocationPrefix = null;

if(searchParams.get("script") != null) {
    let scriptPath = new URL(searchParams.get("script"));
    scriptLocationPrefix = scriptPath.origin + scriptPath.pathname.substring(0, scriptPath.pathname.lastIndexOf("/")+1);
    console.warn("Attempts to open() files using relative paths will also try:", scriptLocationPrefix);
} else {
    // console.error("Attempts to open() files using relative paths will fail! No script parameter in URL.");
}

function is_relative(url) {
    return !(/^https?:/.test(url)) && !(/^http?:/.test(url));
}
function allow_relative(url) {
    const isAllowed = scriptLocationPrefix != null && is_relative(url);
    return isAllowed;
}

function get_relative(url) {
    return scriptLocationPrefix + url;
}

function awfull_get(url) {
    function updateProgress (oEvent) {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total;
      } else {
            // Unable to compute progress information since the total size is unknown
          // on binary XHR
      }
    }

    function transferFailed(evt) {
        console.log("awfull_get: An error occurred while transferring the file '"+window.currentTransfer+"'");
        window.currentTransferSize = -1 ;
    }

    function transferCanceled(evt) {
        console.log("awfull_get: transfer '"+window.currentTransfer+"' has been canceled by the user.");
        window.currentTransferSize = -1 ;
    }

    

    function buildXMLRequest(url) {
        var oReq = new XMLHttpRequest();

        function transferComplete(evt) {
            if (oReq.status==404){
                //console.log("awfull_get: File not found : "+ url );
                window.currentTransferSize = -1 ;
    
            } else {
                window.currentTransferSize = oReq.response.length;
                //console.log("awfull_get: Transfer is complete saving : "+window.currentTransferSize);
            }
        }
        oReq.overrideMimeType("text/plain; charset=x-user-defined");
        // oReq.overrideMimeType("*/*");
        oReq.addEventListener("progress", updateProgress);
        oReq.addEventListener("load", transferComplete);
        oReq.addEventListener("error", transferFailed);
        oReq.addEventListener("abort", transferCanceled);
        oReq.open("GET",url ,false);
        return oReq;
    }
    var defaultReq = null;
    if(!is_relative(url)) {
        defaultReq = buildXMLRequest(url);
        defaultReq.send();
    }
    if((defaultReq == null || defaultReq.status == 404) && allow_relative(url)) {
        defaultReq = buildXMLRequest(get_relative(url))
        defaultReq.send();
    }
    if(defaultReq != null)
        return defaultReq.response
    else {
        window.currentTransferSize = -1 ;
        return "";
    }
}

let cache = {};
function awfull_get_cache(url) {
    let v = assets.get(url);
    if (v) {
        return v;
    }
    
    if (cache[url])
        return cache[url];
    return cache[url] = awfull_get(url);
}


window.wasm_file_open = function(url, cachefile) {
    var dirpath = ""
    if ( url == cachefile ) {
        //we need to build the target path, it could be a module import.

        //transform to relative path to /
        while (cachefile.startswith("/"))
            cachefile = cachefile.substring(1)

        while (url.startswith("/"))
            url = url.substring(1)

        // is it still a path with at least a one char folder ?
        if (cachefile.indexOf('/')>0) {
            var path = cachefile.split('/')

            // last elem is the filename
            while (path.length>1) {
                var current_folder = path.shift()
                try {
                    FS.createFolder(dirpath, current_folder, true, true)
                    //FS.createPath('/', dirname, true, true)
                } catch (err) {
                    if (err.code !== 'EEXIST') throw err
                }
                dirpath = dirpath + "/" + current_folder
            }
            console.log("+dir: "+dirpath+" +file: " + path.shift())
        } else {
            // this is a root folder, abort
            if (url.indexOf(".") <1 )
                return -1
        }
        cachefile = "/" + url
        console.log("in /  +" + cachefile)
    }

    try {
        if (url[0]==":")
            url = url.substr(1)
        else {
            // [TODO:do some tests there for your CORS integration]
            if (window.urls.cors)
                url = window.urls.cors(url)
        }

        var ab = awfull_get_cache(url)

        // is file found and complete ?
        if (window.currentTransferSize<0)
            return -1
        var ret = ab.length

        window.urls.id += 1
        if (!cachefile){
            cachefile = "cache_"+window.urls.id
            ret = window.urls.id
        }
        FS.createDataFile("/", cachefile, ab, true, true);
        return ret
    } catch (x) {
        console.log("wasm_file_open :"+x)
        return -1
    }
}



window.wasm_file_exists = function(url, need_dot) {
    // need_dot reminds we can't check for directory on webserver
    // but we can check for a know file (probaby with a dot) under it
    // -1 not found , 1 is a file on server , 2 is a directory

    function url_exists(url,code) {
        var xhr = new XMLHttpRequest()
        xhr.open('HEAD', url, false)
        xhr.send()
        if (xhr.status == 200 )
            return code
        
        if(allow_relative(url) && params.get("script") != null) {
            /* Try relative */
            xhr.open('HEAD', get_relative(url), false)
            xhr.send()
            if (xhr.status == 200 )
                return code
        }
        
        return -1
    }

    // we know those are all MEMFS local files.
    // and yes it's the same folder name as in another OS apps
    if (url.startswith('assets/'))
        return -1

    if (url.endswith('.mpy'))
        return -1


    // are we possibly doing folder checking ?
    if (need_dot) {


        // .mpy is blacklisted for now
        // so if it's not .py then it's a folder check.
        if (!url.endswith('.py')) {
            var found = -1

            // TODO: gain 1 call if .py exists we can discard both __init__ and index checks
            // -> would need a path cache that is usefull anyway

            // package search
            found = url_exists( url + '/__init__.py' , 2 )
            //console.log("wasm_([dir]/file)_exists ? :"+url+ ' --> ' + '/__init__.py => '+found)
            if (found>0) return found

            //namespace search
            found = url_exists( url + window.urls.index , 2 )
            //console.log("wasm_([dir]/file)_exists ? :"+url+ ' --> ' + window.urls.index + " => "+found)
            if (found>0) return found
        }

        // if name has no dot then it was a folder check
        //console.log("wasm_(dir/[file])_exists ? :"+url)
        need_dot = url.split('.').pop()
        if (need_dot==url) {
            console.log("wasm_file_exists not-a-file :"+url)
            return -1
        }
    }

    // default is a file search
    return url_exists(url, 1)
}


