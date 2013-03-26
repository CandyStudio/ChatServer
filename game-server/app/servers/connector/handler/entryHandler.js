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
/**
 * 离开
 * @param app
 * @param session
 */
var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    var onlineuser = app.get('onlineuser');
    app.set('onlineuser', --onlineuser);
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('roomid'), null);
    console.log('监听 用户离开');
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
        var timestamp = info.timestamp;
        if (userid == info.uid && !!timestamp) {
            var nowTimestamp = new Date().getTime();
            if (nowTimestamp > timestamp && (nowTimestamp - timestamp) <= consts.AUTH_TIME) {
                var sessionService = self.app.get('sessionService');
                //duplicate log in
                if ( !! sessionService.getByUid(userid)) {
                    next(null, {
                        code: consts.FAIL,
                        error:new error(consts.ErrorCode.ALREADY_LOGIN,'重复登陆')

                    });
                    return;
                }


                //TODO 进入大厅
                console.log('验证成功');
                //进入房间方法
                var rooms = [];
                self.app.rpc.chat.chatRemote.queryRooms(session, function (data) {
                    if (data.code != 200) {
                        console.log("查询房间列表失败");
                        next(null, {
                            code: consts.Fail
                        });
                        return;
                    } else {
                        session.on('closed', onUserLeave.bind(null, self.app));
                        var onlineuser = self.app.get('onlineuser');
                        self.app.set('onlineuser', ++onlineuser);
                        rooms = data.roomlist;
                        session.bind(userid);
                        next(null, {
                            code: consts.OK,
                            onlineuser: onlineuser,
                            roomlist: rooms
                        });
                    }
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

/**
 * 进入房间
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {void}
 */
handler.enterRoom = function (msg, session, next) {
    var self = this;
    session.set('roomid', msg.channelid);
    session.push('roomid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    console.log(msg.userid + "--" + msg.username + "---" + msg.channelid);
    self.app.rpc.chat.chatRemote.add(session, msg.userid, msg.username, self.app.get('serverId'), msg.channelid, true, function (data) {
        if (data.code != 200) {
            console.log("进入房间失败");
            next(null, {
                code: consts.FAIL
            });
            return;
        } else {
            next(null, {
                code: consts.OK,
                users: data.userList
            });
        }
    });
};

/**
 *退出房间
 *
 *@param {Object}msg   userid,username
 *@param {Object}session
 *@param {Function} 回调函数
 */
handler.quit = function (msg, session, cb) {
    this.app.rpc.chat.chatRemote.kick(session, session.uid, this.app.get('serverId'), session.get('roomid'), null);

    cb(null, {
        code: 200
    });
};

/**
 * 创建房间
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {oid}
 */
handler.createRoom = function (msg, session, next) {
    var self = this;
    self.app.rpc.chat.chatRemote.createRoom(session, msg.channel, msg.userid, function (err, data) {
        if (!!err) {
            next(new Error(msg.number, msg.msg), null);
        } else {
            next(null, {
                code: consts.OK,
                channelid: data.channelid

            });
        }
    })
};


/**
 *
 * @param msg
 * @param session
 * @param cb
 */
handler.refreshRoomList = function(msg,session,cb){
    self = this;
    var rooms = [];
    self.app.rpc.chat.chatRemote.queryRooms(session, function (data) {
        if (data.code != 200) {
            console.log("查询房间列表失败");
            cb(null, {
                code: consts.Fail
            });
            return;
        } else {
            var onlineuser = self.app.get('onlineuser');
            rooms = data.roomlist;
            cb(null, {
                code: consts.OK,
                onlineuser: onlineuser,
                roomlist: rooms
            });
        }
    });
};