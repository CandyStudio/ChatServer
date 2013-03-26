module.exports = function (app) {
    return new ChatRemote(app);
};

var ChatRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

//roomDao
var roomDao = require('../../../dao/roomDao');
var consts = require('../../../consts/consts');
/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} channelid channel channelid
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function (uid, username, sid, channelid, flag, cb) {
    var channel = this.channelService.getChannel(channelid, flag);
    var param = {
        route: 'onAdd',
        userid: uid,
        username: username
    };


    channel.pushMessage(param);
    if (!!channel) {
        var u = channel.getMember(uid);
        if (!!u) {
            cb({
                code: consts.FAIL

            });
            return;
        }
        console.log('进入：userid:'+uid,' serverid:'+sid);
        channel.add(uid, sid);
        var users = channel.users;
        if (!users) {
            users = {};
            channel.users = users;
        }
        users[uid] = username;
    }
    cb({
        code: consts.OK,
        userList: this.get(channelid, flag)
    });
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} channelid channel id
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function (channelid, flag) {
    var lists = [];
    var channel = this.channelService.getChannel(channelid, flag);
    if (!!channel) {
        var users = channel.users;
        for (var userid in users) {
            lists.push({
                userid: userid,
                username: users[userid]
            });
        }
    }

    return lists;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} roomid channel id
 *
 */
ChatRemote.prototype.kick = function (uid, sid, roomid) {
    if(!roomid){
        return;
    }
    self = this;
    var channel = self.channelService.getChannel(roomid, false);
    // leave channel
    var username = channel.users[uid];

    channel.leave(uid, sid);
    console.log('离开房间：' + uid);
    delete channel.users[uid];
    var param = {
        route: 'onLeave',
        username: username,
        userid: uid
    };
    channel.pushMessage(param);
};

/**
 *
 * @param cb
 */
ChatRemote.prototype.queryRooms = function (cb) {

    var channels = this.channelService.channels;
    var rooms = [];
    for (var c in channels) {
        var ch = channels[c];
        rooms.push({
            channelid: c,
            name: ch.channelname,
            count: ch.getMembers().length
        });
    }

    cb({
        code: 200,
        roomlist: rooms
    });
};

ChatRemote.prototype.createRoom = function (channelname, userid, cb) {
    self = this;
    roomDao.createRoom(channelname, userid, function (err, roomid) {
        if (!!err) {
            cb(err, null);
        } else {
            console.log("-------");
            var channel = self.channelService.createChannel(roomid);
            console.log('创建房间:channel:' + channelname);
            channel.channelname = channelname;
            cb(null, {
                channelid: roomid

            });
        }
    });
};