/**
 * Created with JetBrains WebStorm.
 * User: xiaochuan
 * Date: 13-3-22
 * Time: 上午10:48
 * To change this template use File | Settings | File Templates.
 */



module.exports = function (app) {
    app.get('/', function (req, res) {
        console.log('get');
    });

    app.post('/', function (req, res) {
        console.log('post');
    });

};