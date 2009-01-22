Serebra.Database.SetupFirstRun = function(callback) {
    Serebra.Database.Query({
        'queryString': 'CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("displaypopups", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("popupsound", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_bids", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_messages", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_questions", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_answers", "true");'
    });
    Serebra.Database.Query({
        'queryString': 'INSERT INTO serebra_options VALUES("show_awards", "true");'
    });

    if (typeof callback === 'function') return callback();
};
