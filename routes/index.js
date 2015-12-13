var User = require('../models/user'),
    Post = require('../models/post'),
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
        Post.find({}).exec(function(err, posts) {
            res.render('posts', {
                title: 'Post List',
                posts: posts,
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
            post.content = markdown.toHTML(post.content);
            res.render('post_detail', {
                title: 'Post Detail',
                post: post,
                error: req.flash('error').toString(),
                success: req.flash('success').toString()
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
