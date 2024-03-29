var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function (session, msg, app, cb) {
    var chatServers = app.getServersByType('chat');

    if (!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    //TODO '111' 是不对的
    var res = dispatcher.dispatch('111', chatServers);
    cb(null, res.id);
};