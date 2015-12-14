var mongoose = require('./database'),
    Schema = mongoose.Schema;

var commentSchema = mongoose.Schema({
    title: String,
    name: String,
    content: String,
    time: {
        type: Date,
        default: Date.now
    },
    website:String
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

// var c1 = new Comment({
//     title: 'haha',
//     name: 'bushuai',
//     content: 'hello world'
// });

// c1.save();
