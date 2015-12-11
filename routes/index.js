var User = require('../models/user');

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
        res.render('login', {
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
            console.log('user is' + user[0]);
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
        res.render('reg', {
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

    app.get('/user', check);
    app.get('/user', function(req, res) {
        User.find({}).exec(function(err, users) {
            console.log(users);
            res.render('user', {
                title: 'User List',
                users: users,
                error: req.flash('error').toString(),
                success: req.flash('success').toString()
            });
        });
    });

    app.get('/add', check);
    app.get('/add', function(req, res) {
        res.render('add', {
            title: 'Add User',
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    app.post('/add', function(req, res) {
        var name = req.body.name,
            password = req.body.password;
        var user = new User({
            name: name,
            password: password
        });
        user.save(function(err, user) {
            if (err) console.log(err);
            res.redirect('/user');
        });
    });

    app.get('/delete/:name', function(req, res) {
        var name = req.params.name;
        User.remove({
            name: name
        }, function(err) {
            if (err) throw err;
            res.redirect('/user');
        });
    });

    app.get('/update/:name', function(req, res) {
        var name = req.params.name;

        User.find({
            name: name
        }, function(err, user) {
            console.log(user);

            res.render('update', {
                title: 'Update User Info',
                user: user,
                error: req.flash('error').toString(),
                success: req.flash('success').toString()
            });
        });
    });

    app.post('/update/:name', function(req, res) {
        var name = req.params.name,
            password = req.body.password;

        User.update({
            name: name
        }, {
            password: password
        }, function(err, user) {
            res.redirect('/user');
        });
    });

    app.get('/search', check);
    app.get('/search', function(req, res) {
        res.render('search', {
            title: 'User Search',
            error: req.flash('error').toString(),
            success: req.flash('success').toString()
        });
    });

    app.post('/search', check);
    app.post('/search', function(req, res) {
        var name = req.body.s;
        User.find({
            name: name
        }, function(err, user) {
            console.log(user);
            res.render('result', {
                title: 'Search Result',
                user: user,
                error: req.flash('error').toString(),
                success: req.flash('success').toString()
            })
        });
    });

    function check(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'please log in ')
            res.redirect('/login');
        }
        next();
    }

}
