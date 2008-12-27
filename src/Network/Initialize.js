Serebra.Network.Monitor = null;
Serebra.Network.MessageCheckTimer = null;

/**
 * The main network initialization function
 */
Serebra.Network.Initialize = function(messageCheckTime) {
    air.NativeApplication.nativeApplication.addEventListener(air.Event.NETWORK_CHANGE, Serebra.Network.CheckConnectivity);

    var serviceCheck = new air.URLRequest('http://qa.serebracampus.com:8888/apiWebService.cfc?wsdl');
    Serebra.Network.Monitor = new air.URLMonitor(serviceCheck);
    Serebra.Network.Monitor.addEventListener(air.StatusEvent.STATUS, Serebra.Network.CheckURL);
    Serebra.Network.Monitor.start();
};
