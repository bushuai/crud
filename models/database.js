var mongoose = require('mongoose');
var settings = require('../settings');

//连接数据库
mongoose.connect('mongodb://' + settings.host + '/' + settings.db);
var db = mongoose.connection;
//连接错误时
db.on('error', console.error.bind(console, 'connection.error'));

module.exports = mongoose;
