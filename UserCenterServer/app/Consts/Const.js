/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 下午1:04
 * To change this template use File | Settings | File Templates.
 */

module.exports = {
    OK: 200,
    FAIL: 500,
    ErrorCode: {
        SERVER_ERROR:-1,
        PASSWORD_ERROR: 0,
        NO_USERNAME: 1,
        ALREADY_HAS_USER: 2,
        ALREADY_LOGIN: 3,
        PARAM_ERROR: 4,
        GUEST_FORBIDDEN:5
    },
    UserRole: {
        DEFAULT: 0,
        REGISTER: 1,
        ADMIN: 3
    }
};