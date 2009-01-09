/**
 * Initialisation of Serebra Connect Alerts
 */
var Serebra;
if (!Serebra) Serebra = function(){};
Serebra.Chrome = function(){};
Serebra.Database = function(){};
Serebra.Menu = function(){};
Serebra.Messages = function(){};
Serebra.Network = function(){};
Serebra.SOAP = function(){};
Serebra.System = function(){};
Serebra.Update = function(){};

/* We need to handle command line requests */
Serebra.Initialize = function() {

    Serebra.ApplicationName = '';
    Serebra.ApplicationCode = '';
    Serebra.AuthCode = null;
    Serebra.AutoLogin = false;
    Serebra.AutoStart = false;
    Serebra.DatabaseFileName = '';
    Serebra.DebugMode = false;
    Serebra.DisplayPopups = true;
	Serebra.DisplayPopupsAnswers = true;
	Serebra.DisplayPopupsAwards = true;
	Serebra.DisplayPopupsBids = true;
	Serebra.DisplayPopupsMessages = true;
	Serebra.DisplayPopupsQuestions = true;
    Serebra.Errors = [];
    Serebra.FirstRun = false;
    Serebra.ForceUpdate = false;
    Serebra.ForceOffline = false;
	Serebra.IgnoreArray = [];
	Serebra.JustLoaded = true;
    Serebra.LoggedIn = false;
    Serebra.MessageCheckTime = 300000;
    Serebra.NetworkOnline = false;
    Serebra.Password = '';
    Serebra.PlayPopupSound = true;
    Serebra.RememberMe = false;
    Serebra.UnreadMessages = false;
    Serebra.Username = '';
	Serebra.UserTable = 'serebra_user_';

    //Cleanup from any update
    try {
      air.File.applicationStorageDirectory.resolvePath('update').deleteDirectory(true);
    } catch(err) {
      // Do nothing
    }
    air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, Serebra._InvokeApplication);
};

Serebra._InvokeApplication = function(event) {
    Serebra.System.InvokeSettings(event.arguments, event.currentDirectory,
    function() {

        Serebra.Database.ConnectToFile({
            'databaseFile': Serebra.DatabaseFileName,
            'createFile': true
        });

        Serebra.System.LoadDatabaseSettings(function() {
            Serebra.Menu.Initialize();
            if (Serebra.FirstRun) {
                Serebra.Database.SetupFirstRun(function() {
                    Serebra.Chrome.LoginWindow(function() {
                        Serebra.Network.CheckLogin();
                    });
                });
            } else {
				if (Serebra.AutoLogin) {
					Serebra.Network.CheckLogin();
				} else {
					Serebra.Chrome.LoginWindow(function() {
						Serebra.Network.CheckLogin();
					});	
				}
				
            }
        });
    });
};
