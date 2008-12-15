var Serebra;
if (!Serebra) Serebra = function(){};

/* Some Global Variables We Need */
var DebugMode = false, FirstRun = false; Errors = []; applicationCode = 'B000002'; authCode = null; ForceUpdate = false, ForceOffline = false; SerebraOnline = false, DatabaseFile = null;

/* We need to handle command line requests */
Serebra.Initialize = function(){
	air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra.InvokeApplication);
};

Serebra.CheckLogin = function( options ) {
	Serebra.Network.Initialize();
	Serebra.SOAP.Authenticate({
		'username': options.username,
		'password': options.password,
		'applicationCode': applicationCode
	}, function(soapDocument){		
		var errorCode = jQuery('errorFlag', soapDocument).text();
		
		if(errorCode == "false") {
			authCode = jQuery('authCode', soapDocument).text();	
		} else {
			var errorMessage = jQuery('errorString', soapDocument).text();
			Errors.push('Login Error: ' + errorMessage);
			Serebra.Window.LoginWindow(function(results){
				Serebra.CheckLogin(results);	
			});
		}
	});
}

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
			var username = null; password = null; autologin = false;
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
	  			}
	  		});
	  	}
			if (autologin == 'on') {
				Serebra.CheckLogin({'username': username, 'password': password});
			} else {
				Serebra.Window.LoginWindow(function(results){
					Serebra.CheckLogin(results);	
				});
			}
		}
	});
};
