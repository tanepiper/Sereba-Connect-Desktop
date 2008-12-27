
Serebra.Menu.SystrayClickHandler = function(event){
	if (Serebra.NetworkOnline) {
		Serebra.Chrome.MessageCenter();
	} else {
		Serebra.Chrome.LoginWindow(function(){
			Serebra.Network.CheckLogin();	
		});
	}
};
