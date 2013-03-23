var dispatcher = require('../../../util/dispatcher');
var consts = require('../../../consts/consts');
var error = require('../../../model/error');
module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function (msg, session, next) {
    var uid = 1;
    if (!uid) {
        next(null, {
            code: 500
        });
        return;
    }
    // get all connectors
    var connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length === 0) {
        next(null, {
            code: 500
        });
        return;
    }
    // select connector
    var res = dispatcher.dispatch(uid, connectors);
    next(null, {
        code: 200,
        host: res.host,
        port: res.clientPort
    });
};

/**
 *  进入服务器请求
 * @param {Object} msg   参数 userid,token
 * @param session
 * @param cb
 */
handler.entry = function (msg, session, cb) {
    var userid = msg.userid;
    var token = msg.token;
    if (!userid && !token) {
        cb(null, {
            code: consts.FAIL,
            error: new error(consts.ErrorCode.PARAM_ERROR, '参数错误')
        });
        return;
    } else {
        var res = dispatcher.dispatch(uid, connectors);
        next(null, {
            code: 200,
            host: res.host,
            port: res.clientPort
        });
    }
};


