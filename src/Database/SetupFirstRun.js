Serebra.Database.SetupFirstRun = function(callback) {
    Serebra.Database.Query({
        'queryString': 'CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);'
    });
    Serebra.Database.Query({
        'queryString': 'CREATE TABLE IF NOT EXISTS serebra_user_alerts (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("displaypopups", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("popupsound", "true");'
    });

    if (typeof callback === 'function') return callback();
};
