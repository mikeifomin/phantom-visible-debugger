var server = require("./phantom-vdebugger/server");
var webPage = require('webpage');
var page = webPage.create();
//page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36';
//page.go('https://eu1.badoo.com/',function(status){
//
//})
//
page.viewportSize = {
    width: 1000,
    height: 700
};
var serv = new server(8990,page);
serv.runServer();