Serebra.Database = {};

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
		if (DebugMode) air.trace('Database does not exist.');
		if (options.createFile) {
			Serebra.Database.CreateDB(databaseFile);
		} else {
			databaseFile = null;
		}
	}
  return databaseFile || false;
};

/**
 * Creates the database from the passed file location
 * @param {Object} databaseFile The location of the database file
 */
Serebra.Database.CreateDB = function(databaseFile){
	FirstRun = true;
	var connection = new air.SQLConnection();
	connection.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
	connection.open(databaseFile, air.SQLMode.CREATE);
	connection.close();
	if (DebugMode) air.trace('Database created.');
	return true;
};

Serebra.Database.SetupFirstRun = function(databaseFile, callback) {
	Serebra.Database.Query(databaseFile, {
		'queryString': 'CREATE TABLE IF NOT EXISTS serebra_options (key TEXT, value TEXT);'
	});
	Serebra.Database.Query(databaseFile, {
		'queryString': 'CREATE TABLE IF NOT EXISTS serebra_user_alerts (AlertID INTEGER PRIMARY KEY, Type TEXT, alertText TEXT, userLink TEXT, objectLink TEXT);'
	});
	
	if (typeof callback === 'function') return callback();
}

/**
 * Allows you to pass a query to the passed database file
 * @param {Object} databaseFile The location of the database file
 * @param {Object} options The object that contains the options
 */
Serebra.Database.Query = function(databaseFile, options){

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
    
  var transactionSuccessful = false;
  var result = false;
  var connection = new air.SQLConnection();
  var query = new air.SQLStatement();
    
  connection.open(databaseFile, air.SQLMode.CREATE);
  query.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
    
  query.sqlConnection = connection;
  query.text = options.queryString;
  if (DebugMode) air.trace('Executing Query.');
	query.execute();
  var success = query.getResult();
  if (success) {
		if (DebugMode) air.trace('Transaction Successful.');
  	transactionSuccessful = true;
    result = success;
	} else {
		if (DebugMode) air.trace('Transaction Failed.');
	}
  connection.close();
  return {
		'success': transactionSuccessful,
		'result': result
	};
};

/**
 * The database error handler
 * @param {Object} event The event callback
 */
Serebra.Database.ErrorHandler = function(event){
	air.trace(event.target);
};
