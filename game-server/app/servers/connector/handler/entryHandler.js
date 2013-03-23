module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};
var handler = Handler.prototype;

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

handler.enter = function(msg, session, next) {
    var self = this;
    var rid = 0;
    var uid = "test" + '*' + rid ;
    var sessionService = self.app.get('sessionService');
    //duplicate log in
    if( !! sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);
    session.set('rid', rid);
    session.push('rid', function(err) {
        if(err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));
    next(null,{
        res:"success"
    });
    //put user into channel
//    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
//        next(null, {
//            users:users
//        });
//    });
};


var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
//    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};
