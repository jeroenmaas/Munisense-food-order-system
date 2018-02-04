Meteor.startup(function () {
    // Redirect directly if user is not authenticated.

   WebApp.connectHandlers.use("/api/username", function( req, res, next ) {

  var body = "";
  req.on('data', Meteor.bindEnvironment(function (data) {
    body += data;
  }));

  req.on('end', Meteor.bindEnvironment(function () {
    res.writeHead(200);
    res.end(req.headers['x-forwarded-user']);
  }));
});

});

// The user logs in user DDP. For this it will have to authenticate a second time.
Accounts.registerLoginHandler(function(loginRequest) {
    //there are multiple login handlers in meteor.
    //a login request go through all these handlers to find it's login hander
    //so in our login handler, we only consider login requests which has muniToken field
    if(!loginRequest.username) {
        return undefined;
    }


    //we create a n user if it doesn't exist yet.
    var userId = null;
    var user = Meteor.users.findOne({username: loginRequest.username});
    if(!user) {
        userId = Meteor.users.insert({
            'username': loginRequest.username,
            'email': loginRequest.username + '@munisense.com'
        });
    } else {
        userId = user._id;
    }

    //send loggedin user's user id
    return {
        userId: userId
    }
});

function redirect(res) {
	var correctURL = 'https://login.munisense.net/login.php?url=http://food.office.munisense.net';
            res.writeHead(302, {
                'Content-Type': 'text/html; charset=UTF-8',
                'Location': correctURL
            });
            res.end("Moved to: " + correctURL);
	
}
