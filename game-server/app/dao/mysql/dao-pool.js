//数据库连接池
var _poolModule = require('generic-pool');


/*
* Create mysql connection pool.
*/
var createMysqlPool = function  (app) {
	
	var mysqlConfig = app.get('mysql');
	return _poolModule.Pool({
		name:'mysql',
		create:function  (callback) {
			var mysql = require('mysql');
			var client = mysql.createConnection({
				host: mysqlConfig.host,
				user: mysqlConfig.user,
				password: mysqlConfig.password,
				database: mysqlConfig.database
			});
			callback(null,client);
		},
		destroy:function  (client) {
			client.end();
		},
		max: 10,
		idleTimeoutMillis: 30000,
		log: false
	});
};

exports.createMysqlPool = createMysqlPool;