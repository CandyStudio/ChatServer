/**
 * @author: Linan
 * @data: 13-3-22  上午10:37
 * @desc: chatServer 进入/创建/离开 房间 所需接口
 *
 */
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

var chatRemote = require('../remote/chatRemote');
var roomDao = require('../../../dao/chatDao');

/**
 *  进入房间
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

    chatRemote.add(session, msg.userid, msg.username, self.app.get('serverId'), msg.channel, true, function(users) {
        next(null, {
            code: 200,
            users: users
        });
    });
};

/**
 * 创建房间
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {void}
 */
handler.createRoom = function(msg, session, next) {

    var app = this.app;
    roomDao.createRoom(msg.channel, msg.userid, function(err, roomid) {

        if ( !! err) {
            next(null, {
                code: 500,
                err: err
            });
        } else {
            var channelService = app.get('channelService');
            console.log('创建房间:channelService:' + channelService);
            var channel = channelService.createChannel(roomid);
            console.log('创建房间:channel:' + channel);
            channel.channelname = msg.channel;
            next(null, {
                code: 200,
                roomid: roomid,
                count:0
            });
        }
    });
};

/**
 *退出房间
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} cb    next stemp callback
 * @return {void}
 */
handler.quit = function(msg, session, cb) {

    var username = msg.username;
    var userid = msg.userid;
    var uid = userid + '*' + username;
    var sid = this.app.get('serverId');
    console.log(username + '离开');
    chatRemote.kick(session, uid, session.get('user'), sid, session.get('rid'), null);
    cb(null, {
        code: 200
    });
};
