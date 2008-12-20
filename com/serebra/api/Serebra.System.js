Serebra.System = {};

Serebra.System.InvokeSettings = function(AppArguments, CurrentDir, callback) {
	
	var fileStream = new air.FileStream();
	var settingsFile = air.File.applicationDirectory.resolvePath('settings.xml');

	jQuery.each(AppArguments, function(i, argument){
		switch (argument) {
			case "debug-mode":
				Serebra.DebugMode = true;
			break;
			case "force-update":
				Serebra.ForceUpdate = true;
			break;
			case "force-offline":
				Serebra.ForceOffline = true;
			break;
			default:
				// Do nothing
			break;
		}
	});
	
	jQuery.get(settingsFile.url, null, function(data, success){

		Serebra.ApplicationName = jQuery('appname', data).text();
		Serebra.ApplicationCode = jQuery('appcode', data).text();
		Serebra.DatabaseFileName = jQuery('database', data).text();
		 
		if (typeof callback === 'function') {
			return callback();
		} else {
			throw new Error('You must return a callback with this function');
		}
	},'xml');
};

Serebra.System.LoadDatabaseSettings = function ( callback ) {
	var dbValues = Serebra.Database.Query({
	  'queryString': 'SELECT * FROM serebra_options'
	});
	if (dbValues.result.data) {
		jQuery.each(dbValues.result.data, function(i, item){
	  	switch (item.key) {
	  		case "autologin":
	  			Serebra.AutoLogin = item.value;
	  		break;
				case "autostart":
					Serebra.AutoStart = item.value;
				break;
				case "checktime":
					Serebra.MessageCheckTime = parseInt(item.value, 10);
				break;
	  		case "password":
	  			Serebra.Password = item.value;
	  		break;
				case "rememberme":
	  			Serebra.RememberMe = item.value;
	  		break;
	  		case "username":
	  			Serebra.Username = item.value;
	  		break;
				default:
					//Do nothing
				break;
	  	}
		});
	}
	if (typeof callback === 'function') {
		return callback();
	} else {
		throw new Error('You must return a callback with this function');
	}
};
