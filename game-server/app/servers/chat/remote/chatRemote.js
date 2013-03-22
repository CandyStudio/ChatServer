/**
 * @author: Linan
 * @data: 13-3-22  上午10:37
 * @desc: chatServer 对内请求类
 *
 */
module.exports = function(app) {
    return new ChatRemote(app);
};

var ChatRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

