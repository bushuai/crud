var mongoose = require('./database');

var Schema = mongoose.Schema;
// 定义一个集合 Collection
var userSchema = new Schema({
    name: String,
    password: String
});

// 定义实例方法 可以通过进行实例化schema对象进行调用  user.info()
userSchema.methods.info = function() {
    console.log('username:' + this.name + '\npassword:' + this.password);
}

// 定义静态方法 直接通过类调用 User.findByName()
userSchema.statics.findByName = function(name, callback) {
    return this.model('User').find({
        name: name
    }, callback);
};

userSchema.statics.valid = function(name, password, callback) {
    return this.model('User').find({
        name: name,
        password: password
    }, callback);
}

//将集合映射到 Model
var User = mongoose.model('User', userSchema);

// // 实例化一个Model
// var bushuai = new User({
//     name: 'bushuai',
//     password: 'bushuai'
// });


// bushuai.save(function(err, bushuai) {
//     if (err) console.log(err);
//     console.log(bushuai.name + ' is saved.');
// });

// User.find({
//     name: 'bushuai',
//     password:'bushuai'
// }, function(err, user) {
//     console.log('hello');
//     console.log(user);
// });

// bushuai.info();

// User.findByName('bushuai', function(err, user) {
//     console.log(user);
// });

module.exports = User;
