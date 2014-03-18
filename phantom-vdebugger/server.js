var webserver = require("webserver");
var system = require('system');
var log = require("./log");
var fs = require("fs");
var helpers = require("./helpers") ;
function Server(bind,page){
    log.debug("server constructor start execute");
    this.COMMAND_FUNCTION_NAME_SIGNATURE = "command_" ;
    this.page = page;
    this.serverBind = bind || "127.0.0.1:5030";
    this.serverHandler = webserver.create();
}

Server.prototype.runServer = function(){
//    console.log(this.serverBind);
    log.debug("Try to run server at ", this.serverBind);
    this.serverHandler.listen(this.serverBind, (function(self){
        var f = function(req, res){
            self.requestHeader.call(self, req, res);
        }
        return f;
    })(this));
}

Server.prototype.urlParse = function(url){
    var pattern = "^(([^:/\\?#]+):)?(//(([^:/\\?#]*)(?::([^/\\?#]*))?))?([^\\?#]*)(\\?([^#]*))?(#(.*))?$";
    var rx = new RegExp(pattern);
    var parts = rx.exec(url);
    var resultURL = {};
    resultURL.href = parts[0] || "";
    resultURL.protocol = parts[1] || "";
    resultURL.host = parts[4] || "";
    resultURL.hostname = parts[5] || "";
    resultURL.port = parts[6] || "";
    resultURL.pathname = parts[7] || "/";
    resultURL.search = parts[8] || "";
    resultURL.hash = parts[10] || "";
    return resultURL
}

Server.prototype.requestHeader = function(req, res){
    log.debug("Got server request ", req.url);

    var url = this.urlParse(req.url);
    var parsedPath = url.pathname.split("/");
    var property = this.COMMAND_FUNCTION_NAME_SIGNATURE + parsedPath[1];
    var parsedArgs = parsedPath.slice(2);

    log.debug("Try to find function "+property+ ". And pass this params ->",parsedArgs );
    if (typeof this[property] == "function") {
        try{
            log.debug("Found ", property);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html;charset=utf-8");
            var result = this[property].call(this, req, res, parsedArgs);

            if (typeof result == "string"){
                log.debug("Function `" + property + "` returned string, so closing and send to client response ",result);
                res.write(result);
                res.close();
            } else if (result === undefined) {
                log.debug("Function `" + property + "` returned undefined, so waiting `res.close()` from `" + property);
            } else {
                log.warning("Function `" + property + "` returned not string! close request using `res.close()`", result);
                res.write(result);
                res.close();
            }

        } catch (error){
            log.error("Function `" + property + "` return error " + error.name, error);
            res.statusCode = 500;
            res.write("internal error");
            res.close();
        }

    } else {
        log.warning("For url " + req.url +" not found function `" + property + "`");
        res.statusCode = 404;
        res.write("command not found");
        res.close();
    }
}




Server.prototype.command_screenshot = function (req,res,argv){
    log.debug("Rendered screenshot function")
    if (this.page) {
        this.renderIndex = this.renderIndex || 0;
        this.renderIndex++;
        var filename = 'render/' + (name?name:"img" + this.renderIndex + ".png");
        log.notice("Rendered to " + filename);
        this.page.render(filename);
        return "file save at " + filename;


    } else {
        log.critical("Webpage object not found in class!");
        return "page not loaded";
    }
}

Server.prototype.command_sys = function (req,res,argv){
    log.debug("Return `system` var",system);
    return JSON.stringify(system);
}


Server.prototype.command_dump = function (req,res,argv){
    log.debug("Return `this` var",this);
    return JSON.stringify(this);

}

Server.prototype.command_ls = function(req,res,argv){
    log.debug("Return list of available commands");
    var html = ""
    var obj = this;
    var commandList = Array()
    for(var property in obj) {
        if(typeof obj[property] == "function") {
            if (property.indexOf(this.COMMAND_FUNCTION_NAME_SIGNATURE)==0){
                var commandName = property.slice(this.COMMAND_FUNCTION_NAME_SIGNATURE.length);
                commandList.push(commandName);
                html += "<li>";
                html += "<a href='/" + commandName + "'>" + commandName + "<a/>";
                html += "</li>";

            }
        }
    }
    log.debug("Total " + commandList.length + " commands ", commandList)
    html = "<ul>" + html +"</ul>"
    return html

}
Server.prototype.command_index = function(req,res,argv){

    res.statusCode=200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(fs.read('phantom-vdebugger/index.html'));
    res.close();
}

Server.prototype.command_screenshot = function(req,res,argv){
    res.statusCode=200;
    res.setHeader('Content-Type','image/png');
    res.setEncoding('binary');
    res.write(atob(this.page.renderBase64()));
    res.close();
//    return true
}

//var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+Base64._keyStr.charAt(s)+Base64._keyStr.charAt(o)+Base64._keyStr.charAt(u)+Base64._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}} ;

Server.prototype.command_gourl = function(req,res,argv){
    var response = res;

    var url =  helpers.base64.decode(decodeURIComponent(argv[0]));
    log.info("go to url ", decodeURIComponent(argv[0])) ;

    response.write(url);
    this.page.open(url,function(status){
         response.write(status);
         response.close()
    });
//    return true

}
Server.prototype.command_mouseevent = function(req,res,argv) {
    this.page.sendEvent(argv[0],argv[1],argv[2]);
    var result = this.page.evaluate(function(){

    }) ;
    return true
}
module.exports = Server;

