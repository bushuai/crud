1. res.render(viewname,{}) 中传递的参数，如果为对象，默认放在一个数组中，如果要想在ejs等模板引擎中获取，必须通过forEach进行遍历
2. connect-flash -- Flash message middleware for Connect.