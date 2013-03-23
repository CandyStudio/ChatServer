module.exports = function(app) {
    return new ChatRemote(app);
};

var ChatRemote = function(app) {
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
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, username,sid, name, flag, cb) {
    console.log('uid:'+uid);
    console.log('username:'+username);
    console.log('channel:'+ name);
    var channel = this.channelService.getChannel(name, flag);
    console.log('channel:'+channel);
    var param = {
        route: 'onAdd',
        userid:uid,
        username: username
    };

    channel.pushMessage(param);

    if( !! channel) {
        console.log('add sid:'+sid);
        channel.add(uid+'*'+username, sid);
        console.log(channel.usercount);
        channel.usercount++;
        console.log(channel.usercount);
    }
    cb({
        code:200,
        userList : this.get(name, flag)
    });
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag) {
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if( !! channel) {
        users = channel.getMembers();
    }
    for(var i = 0; i < users.length; i++) {
        console.log('users:'+users[i]);
        var userId = users[i].split('*')[0];
        var username = users[i].split('*')[1];
        users[i] = {
            userid:userId,
            username:username
        }
    }
    return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, user,sid, name) {
    console.log('离开uid',uid);
    console.log('离开sid',sid);
    console.log('离开name',name);
    var channel = this.channelService.getChannel(name, false);
    // leave channel
    var username = user.user_name;
    console.log('离开username',username);
    console.log(username+'离开');
    if( !! channel) {
        var id = uid;
        channel.leave(id, sid);
        console.log(channel.usercount);
        channel.usercount--;
        console.log(channel.usercount);
    }
    else
    {
        console.log('离开没有找到channel');
    }
    var param = {
        route: 'onLeave',
        username: username,
        userid:user.id
    };
    channel.pushMessage(param);
};

/**
 *
 * @param cb
 */
ChatRemote.prototype.queryRooms = function(cb){
    //why???
    var c1 = this.channelService.getChannel('1', true);
    var c2 = this.channelService.getChannel('2', true);
    c1.channelname = 'name1';
    c2.channelname = 'name2';


    var channels = this.channelService.getChannels();
    var rooms = [];
    for(var c in channels){
        var ch = channels[c];
        console.log(ch.getMembers());
        console.log(ch.getMembers().length);
        console.log(ch.usercount);
        if(!!ch.usercount)
        {
            ch.usercount = ch.getMembers().length;
        }
        else{
            ch.usercount = 0;
        }
        rooms.push({
            id: c,
            name: ch.channelname,
            count:ch.usercount
        });
    }

    cb({
        code:200,
        roomlist:rooms
    });
};

ChatRemote.prototype.createRoom = function(channel,userid,cb){
    roomDao.createRoom(channel,userid,function(err, roomid){
        if ( !! err) {
            cb(null, {
                code: 500,
                err: err
            });
        }else {
            console.log("-------");
            //TODO creatChannle is undefined
            var channel = this.channelService.createChannel(roomid);
            console.log('创建房间:channel:' + channel);
            channel.channelname = channel;
            cb(null, {
                code: 200,
                roomid: roomid,
                count:0
            });
        }
    });
} ;