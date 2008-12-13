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
		
		var data = {
			'applicationCode': 'B000002',
			'username': 'jayc',
			'password': 'password'
		};
		
		function processResponse( result ) {
			air.Introspector.Console.log(result);
		}
		
		var soapBody = new SOAPObject("authenticateRequest");
		soapBody.ns = "http://DefaultNamespace";
		soapBody.appendChild(new SOAPObject("username")).val('jayc');
		soapBody.appendChild(new SOAPObject("password")).val('password');
		soapBody.appendChild(new SOAPObject("applicationCode")).val('B000002');
		var sr = new SOAPRequest("http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl", soapBody);
		air.trace(sr);
		SOAPClient.SOAPServer = "http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl";
		SOAPClient.SendRequest(sr, processResponse);
		
		/*
		if (DatabaseFile) {
			air.trace(FirstRun);
			if (FirstRun) {
				Serebra.Database.SetupFirstRun(DatabaseFile, function(){
					Serebra.Messages.CreateMessage();
				});
			} else {
				Serebra.Messages.CreateMessage();
			}
		}*/
		
	});
}
