module.exports = {
    OK: 200,
    FAIL: 500,
    ErrorCode: {
        SERVER_ERROR: -1,
        PASSWORD_ERROR: 0,
        NO_USERNAME: 1,
        ALREADY_HAS_USER: 2,
        ALREADY_LOGIN: 3,
        PARAM_ERROR: 4,
        GUEST_FORBIDDEN: 5,
        AUTH_FILED: 6,
        AUTH_TIMEOUT: 7
    },
    UserRole: {
        DEFAULT: 0,
        REGISTER: 1,
        ADMIN: 3
    },
    GUESTPASSWORD: '123456',
    AUTH_TIME: 5000

};