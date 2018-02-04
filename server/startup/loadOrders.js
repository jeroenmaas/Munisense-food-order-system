Meteor.startup(function () {
    // Redirect directly if user is not authenticated.
    WebApp.connectHandlers.use(function(req, res, next) {
        var cookie = req.headers.cookie;
		if(cookie == null || cookie.length < 3) {
			redirect(res);
            return;
		}
        var muniToken = decodeURIComponent(getCookie(cookie, 'MuniToken'));
		var verifyResult = verifyToken(muniToken);

        if(!verifyResult.verified) {
            redirect(res);
            return;
        }

        next();
    });

   WebApp.connectHandlers.use("/api/token", function( req, res, next ) {

  var body = "";
  req.on('data', Meteor.bindEnvironment(function (data) {
    body += data;
  }));

  req.on('end', Meteor.bindEnvironment(function () {
    res.writeHead(200);
    var cookie = req.headers.cookie;
    var muniToken = decodeURIComponent(getCookie(cookie, 'MuniToken'));

    res.end(muniToken);
  }));
});

    function getCookie(cookie, cname) {
        var name = cname + "=";
        var ca = cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }
});

// The user logs in user DDP. For this it will have to authenticate a second time.
Accounts.registerLoginHandler(function(loginRequest) {
    //there are multiple login handlers in meteor.
    //a login request go through all these handlers to find it's login hander
    //so in our login handler, we only consider login requests which has muniToken field
    if(!loginRequest.muniToken) {
        return undefined;
    }

    //our authentication logic :)
    var verifyResult = verifyToken(loginRequest.muniToken);
    if(!verifyResult.verified)
        throw new Meteor.Error(403, "Invalid token");

    //we create a n user if it doesn't exist yet.
    var userId = null;
    var user = Meteor.users.findOne({username: verifyResult.username});
    if(!user) {
        userId = Meteor.users.insert({
            'username': verifyResult.username,
            'email': verifyResult.username + '@munisense.com'
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

function verifyToken(cookie) {
    if(cookie == null)
        return {username: null, verified: false};

    var pos = cookie.indexOf(';sig=');
    var cookieBody = cookie.substr(0, pos);
    var sig = cookie.substr(pos + 5);

    var keyValues = cookieBody.split(";");
    var username = '';
    for(var i in keyValues) {
        var item = keyValues[i];
        var key = item.split('=')[0];
        var value = item.split('=')[1];

        if(key == 'uid')
            username = value;
    }

    if(username == null || username.length == 0) {
        return {username: null, verified: false};
    }

    var publicKey = Assets.getText("munisense_login_public_key.pem");


    const crypto = Meteor.npmRequire('crypto');
    var verifier = crypto.createVerify('RSA-SHA1');
    verifier.update(cookieBody);
    var isCorrect = verifier.verify(publicKey, sig, 'base64');
    return {username: username, verified: isCorrect};
}
