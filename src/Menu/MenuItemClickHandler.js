/**
 * Handles the click events from the systray menu and assigns functions
 * @param {Object} event The passed event
 */
Serebra.Menu.MenuItemClickHandler = function(event) {
    switch (event.target.label) {
    case "Open Serebra Connect":
        air.navigateToURL(new air.URLRequest('http://www.serebraconnect.com/'));
        break;
    case "Open Alerts Center":
        Serebra.Chrome.AlertCenter();
        break;
    case "Settings":
        Serebra.Chrome.Settings();
        break;
    case "Create Fake Alert":
        Serebra.SOAP.CreateFakeAlert(null,
        function() {});
        break;
    case "Check For Updates":
        Serebra.Update.InvokeApplicationUpdate({
            'updateXML':
            'http://dev.ifies.org/descriptor/update.xml',
            'displayFail': true
        });
        break;
    case "Login":
        Serebra.Chrome.LoginWindow(function() {
            Serebra.Network.CheckLogin();
        });
        break;
    case "Logout":
        Serebra.Network.Logout();
        break;
    case "Exit":
        air.NativeApplication.nativeApplication.exit();
        break;
    default:
        break;
    }
    return;
};
