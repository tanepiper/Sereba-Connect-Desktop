Serebra.Menu.SystrayClickHandler = function(event) {
    if (Serebra.NetworkOnline) {
        Serebra.Chrome.AlertCenter();
    } else {
        Serebra.Chrome.LoginWindow(function() {
            Serebra.Network.CheckLogin();
        });
    }
};
