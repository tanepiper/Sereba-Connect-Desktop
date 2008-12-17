var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.CLI = {};

Serebra.CLI.ParseCLI = function ( AppArguments, callback) {
	
	jQuery.each(AppArguments, function(i, argument){
		switch (argument) {
			case "debug-mode":
				DebugMode = true;
			break;
			case "force-update":
				ForceUpdate = true;
			break;
			case "force-offline":
				ForceOffline = true;
			break;
		}
	});
	
	if (typeof callback === 'function') {
		return callback();
	} else {
		throw new Error('You must return a callback with this function');
	}
	
}
