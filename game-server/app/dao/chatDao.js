/**
 * @author: Linan
 * @data: 13-3-22  上午10:37
 * @desc: chatServer 中操作数据库方法
 *
 */
var consts = require('../consts/consts');
var utils = require('../util/utils');
var chatDao = module.exports;
var pomelo = require('pomelo');

/**
 * 向数据库 插入一条 聊天记录
 *
 * @param  {object} chat
 * @param  {Function} cb    next stemp callback
 * @return {void}
 */
chatDao.insert = function(chat, cb) {

    var sql = 'insert into t_sys_chatlog (from_user_id,from_user_name,to_user_id,to_user_name,type,context,room_id) values(?,?,?,?,?,?,?)';
    vars = [chat.fromuserid, chat.fromusername, chat.touserid, chat.tousername, chat.type, chat.cocntext, chat.room_id];
    pomelo.app.get('dbclient').query(sql, vars, function(err, res) {

        if (err !== null) {
            utils.invokeCallback(cb, err, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

/**
 * 从数据库中 读取聊天记录 最多200条
 *
 * @param  {int} userid
 * @param  {int} roomid
 * @param  {Function} cb    next stemp callback
 */
chatDao.query = function(userid, roomid, cb) {
    var sql = 'select * from t_sys_chatlog where (type=0 or from_user_id=? or to_user_id=?) and room_id = ? order by id desc limit 200';

    vars = [ userid,userid,roomid];

    pomelo.app.get('dbclient').query(sql, vars, function(err, res) {
        if (err !== null) {
            utils.invokeCallback(cb, {
                code: err.number,
                msg: err.message
            }, null);
        } else {

            utils.invokeCallback(cb, null, res);
        }
    })

};

/**
 * 通过ID 查询 聊天记录
 *
 * @param  {int} chatid
 * @param  {Function} cb    next stemp callback
 */
chatDao.queryByid = function(chatid, cb) {
    console.log('chatid :'+chatid);
    var sql = 'select * from t_sys_chatlog where id=? ';

    vars = [chatid];

    pomelo.app.get('dbclient').query(sql, vars, function(err, res) {
        if (err !== null) {
            utils.invokeCallback(cb, {
                code: err.number,
                msg: err.message
            }, null);
        } else {
            console.log('res:'+res);
            utils.invokeCallback(cb, null, res);
        }
    }) ;

};