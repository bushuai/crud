var mongoose = require("./database");
var Schema = mongoose.Schema;

var postSchema = new Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String
    }
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
