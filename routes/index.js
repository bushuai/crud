var User = require('../models/user'),
    Post = require('../models/post'),
    Comment = require('../models/comment'),
    markdown = require('markdown').markdown,
    multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads/')
    },
    filename: function(req, file, callback) {
        callback(null, Math.random() + Date.now() + file.originalname);
    }
})
var upload = multer({
    storage: storage
});

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index', {
            title: 'User Management',
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    /*
        GET LOGIN
     */
    app.get('/login', function(req, res) {
        res.render('user_login', {
            title: 'User Login',
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    /*
       POST LOGIN 
     */
    app.post('/login', function(req, res) {
        var name = req.body.name,
            password = req.body.password;

        User.find({
            name: name
        }, function(err, user) {
            if (!user[0]) {
                req.flash('error', 'user not exists');
                res.redirect('/login');
                return;
            }
            if (user[0] && user[0] && user[0].password != password) {
                req.flash('error', 'password is not macthed ');
                res.redirect('/login');
                return;
            }
            req.session.user = user[0];
            req.flash('success', 'Login Success');
            res.redirect('/');
        });

    });

    /*
        GET LOGOUT
     */
    app.get('/logout', check);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', 'logout success');
        res.redirect('/');
    });

    /*
        GET REG
     */
    app.get('/reg', function(req, res) {
        res.render('user_reg', {
            title: 'User Register',
            error: req.flash('error').toString(),
            success: req.flash('error').toString(),
            user: req.session.user
        });
    });
    /*
        POST REG
     */
    app.post('/reg', function(req, res) {
        var name = req.body.name,
            password = req.body.password;
        var user = new User({
            name: name,
            password: password
        });
        user.save(function(err, user) {
            if (err) {
                req.flash('error', err);
                res.redirect('/reg');
            } else {
                req.flash('success', 'reg success');
                res.redirect('/login');
            }
        });
    });

    /*
        GET USERS
     */
    app.get('/users', check);
    app.get('/users', function(req, res) {
        User.find({}).exec(function(err, users) {
            res.render('users', {
                title: 'User List',
                users: users,
                error: req.flash('error').toString(),
                success: req.flash('success').toString()
            });
        });
    });

    /*
        GET POSTS
     */
    app.get('/posts', check);
    app.get('/posts', function(req, res) {
        var page = req.query.p;
        page = parseInt(page) || 1;
        console.log('current page :' + page);
        var total = 0;
        Post.find({}, function(err, posts) {
            total = posts.length;
        });
        Post.find({})
            .limit(2)
            .skip((page - 1) * 2)
            .exec(function(err, posts) {
                if (posts.comments) {
                    posts.comments.forEach(function(comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                }

                res.render('posts', {
                    title: 'Post List',
                    posts: posts,
                    page: page,
                    first: (page - 1) == 0,
                    last: ((page - 1) * 2) + posts.length >= total,
                    error: req.flash('error').toString(),
                    success: req.flash('success').toString()
                });
            });
    });

    /*
        GET POST/DETAIL/:TITLE
     */
    app.get('/post/detail/:title', check);
    app.get('/post/detail/:title', function(req, res) {
        var title = req.params.title;

        Post.findOne({
            title: title
        }).exec(function(err, post) {
            if (post.comments) {
                post.comments.forEach(function(comment) {
                    comment.content = markdown.toHTML(comment.content);
                });
            }
            post.content = markdown.toHTML(post.content);

            res.render('post_detail', {
                title: 'Post Detail',
                post: post,
                user: req.session.user,
                error: req.flash('error').toString(),
                success: req.flash('success').toString()
            });
        });
    });

    /*
        Comment
     */
    app.post('/post/detail/:title', function(req, res) {
        var user = req.session.user,
            title = req.params.title,
            content = req.body.content,
            name = req.body.name,
            website = req.body.website,
            date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
            email = req.body.email,
            website = req.body.website;
        var comment = new Comment({
            title: title,
            time: time,
            name: name,
            content: content,
            website: website
        });

        comment.save(function(err, comment) {
            console.log(comment + ' has been saved.')
            var name = comment.name,
                title = comment.title,
                time = comment.time,
                content = comment.content,
                website = comment.website;
            Post.findOneAndUpdate({
                name: name,
                title: title
            }, {
                $push: {
                    'comments': comment
                }
            }).exec(function(err) {
                if (err) {
                    req.flash('error', err);
                }
                req.flash('success', 'comment success');
                res.redirect('back');
            });
        });
    });





    /*
        GET ADD/:TYPE
     */
    app.get('/add', check);
    app.get('/add/:type', function(req, res) {
        var type = req.params.type;
        switch (type) {
            case 'user':
                res.render('add_user', {
                    title: 'New User',
                    error: req.flash('error').toString(),
                    success: req.flash('success').toString()
                });
                break;
            case 'post':
                res.render('add_post', {
                    title: 'New Post',
                    error: req.flash('error').toString(),
                    success: req.flash('success').toString()
                });
                break;
        }
    });

    /*
        POST ADD/:TYPE
     */
    app.post('/add/:type', function(req, res) {
        var type = req.params.type;
        switch (type) {
            case 'user':
                var name = req.body.name,
                    password = req.body.password;
                var user = new User({
                    name: name,
                    password: password
                });
                user.save(function(err, user) {
                    if (err) {
                        req.flash('error', err);
                    }
                    req.flash('success', 'add user success');
                    res.redirect('/users');
                });
                break;
            case 'post':
                var title = req.body.title,
                    content = req.body.content,
                    name = req.session.user.name;

                var post = new Post({
                    title: title,
                    content: content,
                    name: name
                });

                post.save(function(err, user) {
                    if (err) {
                        req.flash('error', err);
                    }
                    req.flash('success', 'add post success');
                    res.redirect('/posts');
                });
                break;
        }
    });

    /*
        GET DELETE/:TYPE/:NAME
     */
    app.get('/delete/:type/:name', function(req, res) {
        var type = req.params.type;
        switch (type) {
            case 'user':
                var name = req.params.name;
                User.remove({
                    name: name
                }, function(err) {
                    if (err) {
                        req.flash('error', err);
                    }
                    req.flash('success', 'delete success');
                    res.redirect('/users');
                });
                break;
            case 'post':
                var title = req.params.name;
                Post.remove({
                    title: title
                }, function(err) {
                    if (err) {
                        req.flash('error', err);
                    }
                    req.flash('success', 'delete success');
                    res.redirect('/posts');
                });
                break;
        }
    });

    /*
        GET UPDATE/:TYPE/:NAME
     */
    app.get('/update/:type/:name', function(req, res) {
        var type = req.params.type;
        switch (type) {
            case 'user':
                var name = req.params.name;

                User.findOne({
                    name: name
                }, function(err, user) {
                    res.render('update_user', {
                        title: 'Update User Info',
                        user: user,
                        error: req.flash('error').toString(),
                        success: req.flash('success').toString()
                    });
                });
                break;
            case 'post':
                var title = req.params.name;

                Post.findOne({
                    title: title
                }, function(err, post) {
                    res.render('update_post', {
                        title: 'Update Post',
                        post: post,
                        error: req.flash('error').toString(),
                        success: req.flash('success').toString()
                    });
                });
                break;
        }

    });

    /*
        TODO: 改为获取Id进行更新
     */
    app.post('/update/:type/:name', function(req, res) {
        var name = req.params.name,
            password = req.body.password;

        User.update({
            name: name
        }, {
            password: password
        }, function(err, user) {
            res.redirect('/users');
        });
    });

    /*
    GET SEARCH
     */
    app.get('/search', check);
    app.get('/search', function(req, res) {
        res.render('search', {
            title: 'Search',
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    /*
    POST SEARCH
     */
    app.post('/search', check);
    app.post('/search', function(req, res) {
        var type = req.body.type;
        switch (type) {
            case 'user':
                var name = req.body.s;
                User.findOne({
                    name: name
                }, function(err, user) {
                    res.render('search_result', {
                        title: 'Search Result',
                        user: user,
                        post: null,
                        error: req.flash('error').toString(),
                        success: req.flash('success').toString()
                    });
                });
                break;
            case 'post':
                var name = req.body.s;
                Post.findOne({
                    title: name
                }, function(err, post) {
                    post.content = markdown.toHTML(post.content);
                    res.render('search_result', {
                        title: 'Search Result',
                        user: null,
                        post: post,
                        error: req.flash('error').toString(),
                        success: req.flash('success').toString()
                    })
                });
                break;
        }

    });
    /*
        Upload
     */
    app.get('/upload', function(req, res) {
        res.render('upload', {
            title: 'File upload',
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        })
    });

    app.post('/upload', upload.single('file'), function(req, res) {
        console.log(req.file.originalname);
        req.flash('success', 'upload success');
        res.redirect('/upload');
    });


    /*
    CHECK
     */
    function check(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'please log in ')
            res.redirect('/login');
        }
        next();
    }

}
