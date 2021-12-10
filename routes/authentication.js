function authentication (req, res, next) {
    console.log('got authenticated');
    res.locals.user = {
        role: 'administrator',
        firms: [ '61ad4b7446da4d47e0747dcc', '61ad4b7446da4d47e0747dcc']
    };
    next()
}

module.exports = authentication;