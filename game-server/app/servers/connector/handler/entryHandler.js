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
        var timestamp = info.timestamp;
        if (userid === info.uid && !!timestamp) {
            var nowTimestamp = new Date().getTime();
            console.log('dang qian:' + nowTimestamp +'fa guolai de:' + timestamp);
            if (nowTimestamp > timestamp && (nowTimestamp - timestamp) <= consts.AUTH_TIME) {
                //TODO 进入大厅
                console.log('验证成功');
                //进入房间方法
                var rooms = [] ;
                self.app.rpc.chat.chatRemote.queryRooms(session,function(data){
                    if(data.code!=200){
                        console.log("查询房间列表失败");
                        return;
                    }else{
                        rooms = data.roomlist;
                        next(null, {
                            code: consts.OK,
                            onLineUser : 0 ,
                            roomList: rooms
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
handler.enterRoom = function(msg, session, next) {
    var self = this;
    // put user into channel
    session.set('rid', msg.channel);
    session.push('rid', function(err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    console.log(msg.userid+"--"+msg.username+"---"+msg.channel);
    self.app.rpc.chat.chatRemote.add(session,msg.userid, msg.username,self.app.get('serverId'), msg.channel, true,function(data){
         if(data.code!=200){
             console.log("进入房间失败");
             return;
         }else{
             next(null,{
                roomid:msg.channel,
                userList:data.userList
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
handler.quit = function(msg, session, cb) {
    var self = this;
    var username = msg.username;
    var userid = msg.userid;
    var uid = userid + '*' + username;
    var sid = this.app.get('serverId')
    console.log(username + '离开');
    self.app.rpc.chat.chatRemote.kick(session, uid, session.get('user'), sid, session.get('rid'), null);
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
 * @return {Void}
 */
handler.createRoom = function(msg, session, next) {
    var self =this;
    self.app.rpc.chat.chatRemote.createRoom(session,msg.channel,msg.userid,function(data){
        if(data.code!=200){
            console.log("创建房间失败");
            return;
        }else{
            next(null,{
                roomid:data.roomid,
                count:data.count
            });
        }
    })
};