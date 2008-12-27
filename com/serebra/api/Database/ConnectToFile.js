
Serebra.Database.DatabaseFile = null;

/**
 * Connects to a local SQLite database
 * @param {Object} options
 */
Serebra.Database.ConnectToFile = function(options){

	/**
	 * Default options for connecting to a SQLite database
	 * @param {String} airDir The type of directory in AIR to connect to
	 * @param {String} The name of the database file
	 * @param {Boolean} If the file does not exist, it will be created by default, this allows you to overide that
	 */
	function defaults(){
		return {
			'airDir': 'applicationStorageDirectory',
			'databaseFile': '',
			'createFile': true
		};
	}
	options = jQuery.extend(defaults(), options);
	
	var databaseFile = air.File[options.airDir];
	databaseFile = databaseFile.resolvePath(options.databaseFile);
	
	if (!databaseFile.exists) {
		if (options.createFile) {
			Serebra.Database.CreateDB(databaseFile);
		} else {
			databaseFile = null;
		}
	}
  Serebra.Database.DatabaseFile = databaseFile;
};
