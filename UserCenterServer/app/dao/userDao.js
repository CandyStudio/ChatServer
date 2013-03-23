/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 下午1:42
 * To change this template use File | Settings | File Templates.
 */




var mysql = require('./mysql/mysql');
var userDao = module.exports;

var Error = require('../model/error');
/**
 *获得用户信息
 *@param {String} 用户名
 *@param {Function} 回调函数
 *@return {Array}
 */
userDao.getUserInfo = function (username, cb) {
    var sql = 'select * from t_sys_user where user_name = ?';
    var args = [username];


    mysql.query(sql, args, function (err, res) {

        if (err !== null) {
            cb(new Error(err.number, err.message), null);
        } else {
            if (!!res && res.length === 1) {

                cb(null, res);

            } else {
                cb(null, []);
            }
        }
    });
};

/**
 *创建用户
 *@param {String} 用户名
 *@param {String} 密码
 *@param {int} 角色
 *@param {Function} 回调函数
 *@return {int} 用户id
 */
userDao.createUser = function (username, pwd, role, devicetoken, macaddress, cb) {
    var sql = 'insert into t_sys_user (user_name,user_pwd,user_role,devicetoken,macaddress) values(?,?,?,?,?)';
    var args = [username, pwd, role, devicetoken, macaddress];

    mysql.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(new Error(err.number, err.message), null);
        } else {

            cb(null, res.insertId);
        }
    });

};
/**
 * 更新devicetoken
 * @param {String} devicetoken
 * @param {Number} id 用户id
 * @param {Function} cb
 * @param {String} macaddress mac地址
 */
userDao.updateDevicetoken = function (devicetoken, macaddress, id, cb) {
    var sql = 'UPDATE t_sys_user SET devicetoken=? , macaddress=? where id =?';
    var args = [devicetoken, macaddress, id];

    mysql.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(new Error(err.number, err.message)
                , null);
        } else {

            cb(null, res.insertId);
        }
    });
};

/**
 * 获得用户信息
 * @param {String} macaddress Mac地址
 * @param {Number} role  用户角色
 * @param {Function} cb  回调函数
 */
userDao.getUserInfoByMac = function (macaddress, role, cb) {
    var sql = 'select * from t_sys_user where macaddress = ? and user_role = ?';
    var args = [macaddress, role];


    mysql.query(sql, args, function (err, res) {

        if (err !== null) {
            cb(new Error(err.number, err.message), null);
        } else {
            if (!!res && res.length === 1) {

                cb(null, res);

            } else {
                cb(null, []);
            }
        }
    });
};
