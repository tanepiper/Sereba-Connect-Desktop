var Serebra;
if (!Serebra) Serebra = function(){};

Serebra.Database = {};

Serebra.Database.DatabaseFile = null;
Serebra.Database.GetConnection = function(){
	return Serebra.Database.DatabaseFile;
}

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
		}
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

/**
 * Creates the database from the passed file location
 * @param {Object} databaseFile The location of the database file
 */
Serebra.Database.CreateDB = function(){
	FirstRun = true;
	var databaseFile = Serebra.Database.GetConnection();
	var connection = new air.SQLConnection();
	connection.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
	connection.open(databaseFile, air.SQLMode.CREATE);
	connection.close();
	return true;
};

Serebra.Database.SetupFirstRun = function(callback) {
	var databaseFile = Serebra.Database.GetConnection();
	Serebra.Database.Query({
		'queryString': 'CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);'
	});
	Serebra.Database.Query({
		'queryString': 'CREATE TABLE IF NOT EXISTS serebra_user_alerts (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT, messageRead INTEGER);'
	});
	
	if (typeof callback === 'function') return callback();
}

/**
 * Allows you to pass a query to the passed database file
 * @param {Object} databaseFile The location of the database file
 * @param {Object} options The object that contains the options
 */
Serebra.Database.Query = function(options){
	
	/**
	 * Default options for a query
	 * @param {String} queryString The query string to be passed to the database
	 */
	function defaults(){
		return {
			'queryString': ''
		}
	}
	options = jQuery.extend(defaults(), options);
  var databaseFile = Serebra.Database.GetConnection();
  var transactionSuccessful = false;
  var result = false;
  
	try {
		var connection = new air.SQLConnection();
		connection.open(databaseFile, air.SQLMode.CREATE);
		
		 var query = new air.SQLStatement();
		 query.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
		 query.sqlConnection = connection;
  	query.text = options.queryString;
		query.execute();
  	var success = query.getResult();
  	if (success) {
  		transactionSuccessful = true;
  	  result = success;
		} else {
		}
  	connection.close();
	} catch ( error ) {
		transactionSuccessful = false;
		result = error;
	}
  return {
		'success': transactionSuccessful,
		'result': result
	};
};

Serebra.Database.SaveOrCreateOption = function(options) {
	/**
	 * Default options for a query
	 * @param {String} queryString The query string to be passed to the database
	 */
	function defaults(){
		return {
			'key': '',
			'value': '',
			'overwrite': true
		}
	}
	options = jQuery.extend(defaults(), options);
  var databaseFile = Serebra.Database.GetConnection();
  var exists = false;
	var result;
	
	//First we do a search for the item
	var checkExists = Serebra.Database.Query({
		'queryString': 'SELECT * FROM serebra_options WHERE key = "'+options.key+'"'
	});
	
	if (checkExists.result.data) {
		result = null;
		if (options.overwrite) {
			result = Serebra.Database.Query({
				'queryString': 'UPDATE serebra_options SET value = "'+options.value+'" WHERE key = "'+options.key+ '"'
			});
		}
		exists = true;
	} else {
		exists = false;
		result = Serebra.Database.Query({
			'queryString': 'INSERT INTO serebra_options (key, value) VALUES("' + options.key + '", "' + options.value + '")'
		});
	}
	return {'exists':exists, 'result':result};
}

/**
 * The database error handler
 * @param {Object} event The event callback
 */
Serebra.Database.ErrorHandler = function(event){
	air.trace(event.target);
};
