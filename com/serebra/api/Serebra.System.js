var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.System = {};

Serebra.System.GetVersion = function() {
		var appXML = air.NativeApplication.nativeApplication.applicationDescriptor;
		var version = jQuery('version', appXML).text();
		return version;
};

Serebra.System.InitUserAgentString = function() {
	var newString = Serebra.System.SetUserAgent('Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Serebra Desktop Connect/' + Serebra.System.GetVersion());
	return newString;
};

Serebra.System.GetUserAgent = function() {
	return window.htmlLoader.userAgent;
};

Serebra.System.SetUserAgent = function(uastring) {
	window.htmlLoader.userAgent = uastring;
	return window.htmlLoader.userAgent;
};

Serebra.System.getRuntimeInfo = function(){
	return {
		'os' : air.Capabilities.os,
		'version': air.Capabilities.version, 
		'manufacturer': air.Capabilities.manufacturer,
		'totalMemory': air.System.totalMemory
	};
};

Serebra.System.getClipboardText = function() {
	if(air.Clipboard.generalClipboard.hasFormat("text/plain")){
	    var text = air.Clipboard.generalClipboard.getData("text/plain");
		return text;
	} else {
		return '';
	}
};

Serebra.System.setClipboardText = function(text) {
	air.Clipboard.generalClipboard.clear();
	air.Clipboard.generalClipboard.setData(air.ClipboardFormats.TEXT_FORMAT,text,false);
};

Serebra.System.getFileContents = function(path) {
	var f = new air.File(path);
	if (f.exists) {
		var fs = new air.FileStream();
		fs.open(f, air.FileMode.READ);
		var str = fs.readMultiByte(f.size, air.File.systemCharset);
		fs.close();
		return str;
	} else {
		return false;
	}
};