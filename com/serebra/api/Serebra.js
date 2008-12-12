var Serebra;
if (!Serebra) Serebra = function(){};

/* Some Global Variables We Need */
var DebugMode = false, FirstRun = false; ForceUpdate = false, ForceOffline = false; SerebraOnline = false, DatabaseFile = null;

/* We need to handle command line requests */
Serebra.Initialize = function(){
	air.trace('Serebra Connect Desktop Initializing');
	air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra.InvokeApplication);
};

Serebra.InvokeApplication = function ( event ) {
	var AppArguments = event.arguments; 
	var CurrentDir = event.currentDirectory;
	
	Serebra.CLI.ParseCLI(AppArguments, function(){
		Serebra.Menu.Initialize();
		Serebra.Network.Initialize();
		
		DatabaseFile = Serebra.Database.ConnectToFile({
			'databaseFile': 'SeberaConnectTest1.sqlite'
		});
		
		if (DatabaseFile) {
			air.trace(FirstRun);
			if (FirstRun) {
				Serebra.Database.SetupFirstRun(DatabaseFile, function(){
					Serebra.Messages.CreateMessage();
				});
			} else {
				Serebra.Messages.CreateMessage();
			}
		}
		
	});
}
