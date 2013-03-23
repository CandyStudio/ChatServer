/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 上午10:48
 * To change this template use File | Settings | File Templates.
 */

var Error = require('./modle/error');
var Const = require('./Consts/const');
module.exports = function (app) {

    var userDao = require('./dao/userDao');
    /**
     * 登陆
     */
    app.post('/login', function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        var devicetoken = req.param('devicetoken') || '';
        var macaddress = req.param('macaddress') || '';
        if (!username || !password) {
            res.send(new Error(Const.ErrorCode.PARAM_ERROR, '参数错误'), Const.FAIL);
            return;
        }


        userDao.getUserInfo(username, function (err, users) {
            if (!!err) {
                res.send(err, Const.FAIL);
                return;
            } else {
                if (users.length === 0) {
                    res.send(new Error(Const.ErrorCode.NO_USERNAME, '没有此用户'), Const.FAIL);
                    return;
                }
                else {
                    var user = users[0];
                    if (user.user_pwd !== password) {
                        res.send(new Error(Const.ErrorCode.PASSWORD_ERROR, '密码错误'), Const.FAIL);
                        return;
                    }
                    else {
                        if (user.user_type === Const.UserRole.REGISTER) {
                            res.send(new Error(Const.ErrorCode.GUEST_FORBIDDEN, '游客不让登录'), Const.FAIL);
                            return;
                        }
                        var secret = require('../../shared/config/keys');
                        var token = require('../../shared/token').create(user.id, Date.now(), secret.secret);

                        if (user.devicetoke !== devicetoken || user.macaddress !== macaddress) {
                            userDao.updateDevicetoken(devicetoken, macaddress, function (err, res) {
                                if (!!err) {
                                    res.send(err, Const.FAIL);
                                } else {
                                    res.send({
                                        route: 'login',
                                        userid: user.id,
                                        token: token
                                    }, Const.OK);
                                }
                            });
                        }
                        else {
                            res.send({
                                route: 'login',
                                userid: user.id,
                                token: token
                            }, Const.OK);
                        }


                    }
                }
            }
        });


    });


    app.post('/register', function (req, res) {
        var username = req.param('username');
        var password = req.param('password');
        var devicetoken = req.param('devicetoken') || '';
        var macaddress = req.param('macaddress') || '';
        var isguest = req.param('isguest');
        var role = Const.UserRole.REGISTER;
        if (!username || !password || !isguest) {
            res.send(new Error(Const.ErrorCode.PARAM_ERROR, '参数错误'), Const.FAIL);
            return;
        } else if (isguest === 1 && macaddress === '') {
            res.send(new Error(Const.ErrorCode.PARAM_ERROR, '参数错误'), Const.FAIL);
            return;
        }


        userDao.getUserInfo(username, function (err, users) {
            if (!!err) {
                res.send(err, Const.FAIL);
                return;
            } else {
                if (users.length === 0) {
                    if (isguest === 0) {
                        userDao.createUser(username, password, role, devicetoken, macaddress, function (err, userid) {
                            if (!!err) {
                                res.send(err, Const.FAIL);
                                return;
                            } else {

                                var secret = require('../../shared/config/keys');
                                var token = require('../../shared/token').create(userid, Date.now(), secret.secret);
                                res.send({
                                    route: 'register',
                                    userid: userid,
                                    token: token
                                }, Const.OK);
                            }
                        });
                    }
                    else {
                        //TODO 游客注册
                        res.send(new Error(Const.ErrorCode.SERVER_ERROR, '目前不支持游客注册'), Const.FAIL);
                    }

                }
                else {
                    res.send(new Error(Const.ErrorCode.ALREADY_HAS_USER, '已经注册过'), Const.FAIL);
                    return;
                }
            }

        });


    });

    /**
     * 游客登陆
     */
    app.post('/guest', function (req, res) {
        var devicetoken = req.param('devicetoken') || '';
        var macaddress = req.param('macaddress');
        if (!macaddress) {
            res.send(new Error(Const.ErrorCode.PARAM_ERROR, '参数错误'), Const.FAIL);
            return;
        }
        userDao.getUserInfoByMac(macaddress, Const.UserRole.DEFAULT, function (err, users) {
            if (!!err) {
                res.send(err, Const.FAIL);
                return;
            }
            else {
                if (users.length === 0) {
                    var timestr = new Date().getTime();
                    var username = '游客' + new String(timestr).substr(-6);
                    var password = '123456';
                    var role = Const.UserRole.DEFAULT;
                    userDao.createUser(username, password, role, devicetoken, macaddress, function (err, userid) {
                        if (!!err) {
                            res.send(err, Const.FAIL);
                            return;
                        }
                        else {
                            var secret = require('../../shared/config/keys');
                            var token = require('../../shared/token').create(userid, Date.now(), secret.secret);
                            res.send({
                                route: 'guest',
                                userid: userid,
                                token: token
                            });
                        }
                    });
                } else {
                    var user = users[0];
                    var secret = require('../../shared/config/keys');
                    var token = require('../../shared/token').create(user.id, Date.now(), secret.secret);
                    res.send({
                        route: 'guest',
                        userid: user.id,
                        username: user.user_name,
                        token: token
                    });
                }
            }
        });


    });
};