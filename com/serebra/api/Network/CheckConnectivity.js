
Serebra.Network.CheckConnectivity = function ( event ) {
	air.trace('Network gone offline');
}

/**
 * The main network loop handler
 * @param {Object} event The callback event
 */
Serebra.Network.CheckURL = function( event ){
	if (Serebra.Network.Monitor.available) {
		Serebra.Network.Online();
	} else {
		Serebra.Network.Logout();
	}
};
