/**
 * @author: Linan
 * @data: 13-3-22  上午10:37
 * @desc: chatServer 对外请求类
 *
 */
var chatDao = require('../../../dao/chatDao');
module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * 查询聊天记录 API
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {void}
 */
handler.query = function (msg, session, next) {

    chatDao.query(msg.userid, msg.channelid, function (err, res) {
        if (!!err) {
            next(null, {
                code: 500,
                err: err
            });
        } else {

            next(null, {
                code: 200,
                chatlog: res
            });
        }
    });
};

/**
 * 用户发送聊天消息 API
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 */
handler.send = function (msg, session, next) {
    var roomid = session.get('roomid');
    console.log('roomid:' + roomid);
    var channelService = this.app.get('channelService');
    console.log('channelService:' + channelService);
    var channel = channelService.getChannel(roomid, false);
    console.log('channel:' + channel);
    var userid = session.uid;
    console.log('userid:' + userid);

    //test
    for (var id in channel.users) {
        console.log('userid:' + id);
        console.log('username:' + channel.users[id]);
    }

    var chat = {
        fromuserid: userid,
        fromusername: channel.users[userid],
        room_id: roomid,
        tousername: msg.target,
        cocntext: msg.content
    };
    //判断 发送对象
    //the target is all users
    if (msg.target === '*') {

        chat.type = 0;
        chat.touserid = 0;
    }
    //the target is specific user
    else {
        chat.type = 1;
        chat.touserid = msg.userid;

    }

    chatDao.insert(chat, function (err, res) {
        console.log(err);
        if (!!err) {
            next(null, {
                code: 500,
                err: err
            });
        } else {
            var id = res.insertId;
            chatDao.queryByid(res.insertId, function (err, res) {
                if (!!err) {
                    next(null, {
                        code: 500,
                        err: err
                    });
                } else {
                    var chat = res[0];
                    var theChat = {route: 'onChat',
                        from_user_name: chat['from_user_name'],
                        from_user_id: chat['from_user_id'],
                        to_user_id: chat['to_user_id'],
                        to_user_name: chat['to_user_name'],
                        type: chat['type'],
                        context: chat['context'],
                        createtime: chat['createtime'],
                        room_id: chat['room_id'],
                        tid: id
                    };

                    if (msg.target === '*') {
                        channel.pushMessage(theChat);

                    }
                    else {
                        var tuid = msg.userid;
                        var member = channel.getMember(tuid);
                        var tsid = member['sid'];
                        channelService.pushMessageByUids(theChat, [
                            {
                                uid: tuid,
                                sid: tsid
                            }
                        ]);
                    }
                    next(null, {
                        code: 200,
                        chat: res[0],
                        route: "onChat"
                    });
                }
            });
        }
    });
};


/**
 *退出房间 API
 *
 *@param {Object}msg   userid,username
 *@param {Object}session
 *@param {Function} cb
 */
handler.quitRoom = function (msg, session, cb) {
    var channel = this.app.get('channelService').getChannel(session.get('roomid'), false);
    var username = msg.username;
    var userid = msg.userid;
    var sid = this.app.get('serverId');
    console.log(username + '离开');
    if (!!channel) {
        channel.leave(userid, sid);
    }
    else {
        console.log('离开没有找到channel');
    }

    var param = {
        route: 'onLeave',
        username: username,
        userid: userid
    };
    channel.pushMessage(param);


    cb(null, {
        code: 200
    });
};