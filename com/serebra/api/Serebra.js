var Serebra;
if (!Serebra) Serebra = function(){};

/* We need to handle command line requests */
Serebra.Initialize = function(){
	air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra.InvokeApplication);
};

Serebra.InvokeApplication = function ( event ) {
	var AppArguments = event.arguments; 
	var CurrentDir = event.currentDirectory;
	// First, we need to parse the arguments
	Serebra.CLI.ParseCLI(AppArguments, function(){
		
		// Lets create the menu first
		Serebra.Menu.Initialize();
		
		// Now lets do the database connection
		Serebra.Database.ConnectToFile({
			'databaseFile': 'SeberaConnectTest1.sqlite'
		});
				
		if (FirstRun) {
			// We need to set up the database with the schema
			Serebra.Database.SetupFirstRun(function(){
				Serebra.Window.LoginWindow(function(results){
					Serebra.CheckLogin(results);	
				});
			});
		} else {
			var username = null; password = null; autologin = false; messageCheckTime = 300000;
			var dbValues = Serebra.Database.Query({
  			'queryString': 'SELECT * FROM serebra_options'
  		});
			if (dbValues.result.data) {
	  		jQuery.each(dbValues.result.data, function(i, item){
	  			switch (item.key) {
	  				case "autologin":
	  					autologin = item.value;
	  				break;
	  				case "username":
	  					username = item.value;
	  				break;
	  				case "password":
	  					password = item.value;
	  				break;
					case "checktime":
						messageCheckTime = parseInt(item.value, 10);
					break;
					default:
						//Do nothing
					break;
	  			}
	  		});
	  	}
			if (autologin == 'true') {
				Serebra.CheckLogin({'username': username, 'password': password, 'messageCheckTime': messageCheckTime});
			} else {
				Serebra.Window.LoginWindow(function(results){
					Serebra.CheckLogin(results);	
				});
			}
		}
	});
};

Serebra.CheckLogin = function( options ) {
	Serebra.SOAP.Authenticate({
		'username': options.username,
		'password': options.password,
		'applicationCode': applicationCode
	}, function(soapDocument) {
		var errorCode = jQuery('errorFlag', soapDocument).text();
		if(errorCode == "false") {
			loggedIn = true;
			authCode = jQuery('authCode', soapDocument).text();
			Serebra.Menu.CreateSystrayMenu();
			Serebra.Network.Initialize(options.messageCheckTime);
		} else {
			var errorMessage = jQuery('errorString', soapDocument).text();
			if (errorMessage === '') {
				errorMessage = 'Unknown Error';
			}
			Errors.push('Login Error: ' + errorMessage);
			Serebra.Window.LoginWindow(function(results){
				Serebra.CheckLogin(results);	
			});
		}
	});
};