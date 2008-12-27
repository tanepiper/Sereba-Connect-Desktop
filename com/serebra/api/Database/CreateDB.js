
/**
 * Creates the database from the passed file location
 * @param {Object} databaseFile The location of the database file
 */
Serebra.Database.CreateDB = function(){
	Serebra.FirstRun = true;
	var connection = new air.SQLConnection();
	connection.addEventListener(air.SQLErrorEvent.ERROR, Serebra.Database.ErrorHandler);
	connection.open(Serebra.Database.DatabaseFile, air.SQLMode.CREATE);
	connection.close();
	return true;
};
