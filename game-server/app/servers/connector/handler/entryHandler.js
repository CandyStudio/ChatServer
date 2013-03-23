module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};
var handler = Handler.prototype;

var consts = require('../../../consts/consts');
var error = require('../../../model/error');
/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {void}
 */
//    Handler.prototype.entry = function(msg, session, next) {
//    next(null, {code: 200, msg: 'game server is ok.'});
//    };

handler.enter = function (msg, session, next) {
    var self = this;
    var rid = 0;
    var uid = "test" + '*' + rid;
    var sessionService = self.app.get('sessionService');
    //duplicate log in
    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);
    session.set('rid', rid);
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));
    next(null, {
        res: "success"
    });
    //put user into channel
//    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
//        next(null, {
//            users:users
//        });
//    });
};


var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
//    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

/**
 * 连接前段服务器
 * @param {Object} msg   userid,token
 * @param {Object} session
 * @param {Function} callback
 */
handler.entry = function (msg, session, next) {
    var self = this;
    var userid = msg.userid;
    var token = msg.token;
    if (!userid && !token) {
        cb(null, {
            code: consts.FAIL,
            error: new error(consts.ErrorCode.PARAM_ERROR, '参数错误')
        });
        return;
    } else {
        var auth = require('../../../../../shared/token');
        var key = require('../../../../../shared/config/keys');
        var info = auth.parse(token, key.secret);
        console.log("info--->>"+info);
        var timestamp = info.timestamp;
        console.log("timestamp--->>"+timestamp);
        if (userid === info.uid && !!timestamp) {
            var nowTimestamp = new Date().getTime();
            console.log('dang qian:' + nowTimestamp +'fa guolai de:' + timestamp);
            if (nowTimestamp > timestamp && (nowTimestamp - timestamp) <= consts.AUTH_TIME) {
                //TODO 进入大厅
                console.log('验证成功');
                //进入房间方法
//                var rooms ;
//                self.app.rpc.chat.chatRemote.queryRooms(function(data){
//                    if(data.code!=200){
//                        console.log("查询房间列表失败");
//                        return;
//                    }else{
//                        var rooms = data.rooms;
//                        console.log(rooms[0].room_id);
//                    }
//                });
                next(null, {
                    code: consts.OK
                    //进入房间

                });
            } else {
                next(null, {
                    code: consts.FAIL,
                    error: new error(consts.ErrorCode.AUTH_TIMEOUT, '验证超时')
                });
            }
        } else {
            next(null, {
                code: consts.FAIL,
                error: new error(consts.ErrorCode.AUTH_FILED, '验证失败')
            });
        }


    }
};