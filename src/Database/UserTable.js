Serebra.Database.UserTable = function(callback) {
    Serebra.UserTable = Serebra.UserTable + Serebra.Username.toLowerCase();

    var existing = Serebra.Database.Query({
        'queryString': 'SELECT * FROM ' + Serebra.UserTable
    });
    if (!existing.result.data) {
        Serebra.Database.Query({
            'queryString': 'CREATE TABLE IF NOT EXISTS ' + Serebra.UserTable + ' (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);'
        });
    }
    return callback();
}
