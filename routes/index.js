var User = require('../models/user'),
    Post = require('../models/post');

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('index', {
            title: 'User Management',
            user: req.session.user,
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    app.get('/login', function(req, res) {
        res.render('user_login', {
            title: 'User Login',
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

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

    app.get('/logout', check);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', 'logout success');
        res.redirect('/');
    });

    app.get('/reg', function(req, res) {
        res.render('user_reg', {
            title: 'User Register',
            error: req.flash('error').toString(),
            success: req.flash('error').toString(),
            user: req.session.user
        });
    });
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

    app.get('/update/:type/:name', function(req, res) {
        var type = req.params.type;
        switch (type) {
            case 'user':
                var name = req.params.name;

                User.find({
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

                Post.find({
                    title: title
                }, function(err, user) {
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

    app.get('/search', check);
    app.get('/search', function(req, res) {
        res.render('search', {
            title: 'Search',
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    app.post('/search', check);
    app.post('/search', function(req, res) {
        var type = req.body.type;
        switch (type) {
            case 'user':
                var name = req.body.s;
                User.find({
                    name: name
                }, function(err, user) {
                    res.render('search_result', {
                        title: 'Search Result',
                        user: user,
                        post: null,
                        error: req.flash('error').toString(),
                        success: req.flash('success').toString()
                    })
                });
                break;
            case 'post':
                var name = req.body.s;
                Post.find({
                    title: name
                }, function(err, post) {
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

    function check(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'please log in ')
            res.redirect('/login');
        }
        next();
    }

}
