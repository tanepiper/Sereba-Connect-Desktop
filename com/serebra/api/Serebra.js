if (!Serebra) Serebra = {};

/* We need to handle command line requests */
Serebra.Initialize = function(){
	
	Serebra.ApplicationName = '';
	Serebra.ApplicationCode = '';
	Serebra.AuthCode = null;
	Serebra.AutoLogin = false;
	Serebra.AutoStart = false;
	Serebra.DatabaseFileName = '';
	Serebra.DebugMode = false;
	Serebra.Errors = [];
	Serebra.FirstRun = false;
	Serebra.ForceUpdate = false;
	Serebra.ForceOffline = false;
	Serebra.LoggedIn = false;
	Serebra.MessageCheckTime = 300000;
	Serebra.NetworkOnline = false;
	Serebra.Password = '';
	Serebra.RememberMe = false;
	Serebra.UnreadMessages = false;
	Serebra.Username = '';
	
	//Cleanup from any update
	try {
  	air.File.applicationStorageDirectory.resolvePath('update').deleteDirectory(true);
  } catch (err) {
		// Do nothing
	}
	air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra._InvokeApplication);
};

Serebra._InvokeApplication = function ( event ) {
	Serebra.System.InvokeSettings(event.arguments, event.currentDirectory, function() {
				
		Serebra.Database.ConnectToFile({
			'databaseFile': Serebra.DatabaseFileName,
			'createFile': true
		});
		
		Serebra.System.LoadDatabaseSettings(function(){
			Serebra.Menu.Initialize();
			if (Serebra.FirstRun) {
				Serebra.Database.SetupFirstRun(function(){
					Serebra.Chrome.LoginWindow(function(){
						Serebra.Network.CheckLogin();
					});
				});
			} else {
				if (Serebra.AutoLogin) {
		  		Serebra.Network.CheckLogin();
		  	} else {
					Serebra.Chrome.LoginWindow(function(){
						Serebra.Network.CheckLogin();
					});
				}
			}
		});
	});	
};

