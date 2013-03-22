/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 下午1:13
 * To change this template use File | Settings | File Templates.
 */


/**
 *
 * @param code   错误代码
 * @param msg 错误描述
 * @constructor
 */
var ErrorCode = function(code,msg){
    this.errorcode = code;
    this.desc = msg;
};

moduld.exports = ErrorCode;
