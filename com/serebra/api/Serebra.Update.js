var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.Update = {};
Serebra.Update.ShowFail = false;
Serebra.Update.InvokeApplicationUpdate = function ( options ) {
	function defaults() {
		return {
			'updateXML':''
		};
	}
	options = jQuery.extend(defaults(), options);
	var request = new air.URLRequest(options.updateXML); 
	var loader = new air.URLLoader(); 
	Serebra.Update.ShowFail = options.displayFail;
	loader.addEventListener(air.Event.COMPLETE, Serebra.Update.AppVersionCheck);
	loader.load(request);
};

Serebra.Update.AppVersionCheck = function ( event ) {
	var remoteVersionString = jQuery(event.target.data).find('version').text();
	var remoteVersion = remoteVersionString.split('.');
	var remoteAir = jQuery(event.target.data).find('url').text();
	
	var xmlString = air.NativeApplication.nativeApplication.applicationDescriptor;
	var appXml = new DOMParser();
	var xmlObject = appXml.parseFromString(xmlString, "text/xml");
	var root = xmlObject.getElementsByTagName('application')[0];
	var thisVersion = root.getElementsByTagName("version")[0].firstChild.data;
  thisVersion = thisVersion.split('.');

	var update = false;

	jQuery.each(remoteVersion, function(i, item){
		if (item > thisVersion[i])
			update = true;
	});
		
	if (update) {
		var confirmUpdate = confirm('We have found an update for Serebra Connect Desktop.  Would you like to download now?');
		
		if (confirmUpdate) {
  		var stream = new air.URLStream();
  		stream.addEventListener(air.ProgressEvent.PROGRESS, updatingStatus);
  		stream.addEventListener(air.Event.COMPLETE, updateApplication);
  		stream.load(new air.URLRequest(remoteAir));
  	}
	} else {
		if (Serebra.Update.ShowFail) {
			alert('No updates have been found at this time.');
			Serebra.Update.ShowFail = false;
		}
	}
	
	// Handlers
	function updatingStatus( event ) {
		var percentage = Math.round((event.bytesLoaded / event.bytesTotal) * 100);
	}
	
	function updateApplication ( event ) {
		var filename = "SRDesktop-" + remoteVersionString + ".air";
		var ba = new air.ByteArray();
		stream.readBytes(ba, 0, stream.bytesAvailable);
		updateFile = air.File.applicationStorageDirectory.resolvePath(filename);
		fileStream = new air.FileStream();
		fileStream.addEventListener( air.Event.CLOSE, installUpdate );
		fileStream.openAsync(updateFile, air.FileMode.WRITE);
		fileStream.writeBytes(ba, 0, ba.length);
 		fileStream.close();
		
		function installUpdate ( event ) {
			var updater = new air.Updater();
			// Notice that the version name has to be present as a second parameter
			updater.update(updateFile, remoteVersionString);
		}
	}
};