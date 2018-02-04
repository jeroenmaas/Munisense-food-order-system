angular.module('socially')
  .config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('orders', {
        url: '/',
        template: '<order-list></order-list>'
      })
      .state('locations', {
        url: '/locations',
        template: '<location-list></location-list>'
      })
      .state('orderAbleList', {
        url: '/location/:locationId',
        template: '<order-able-list></order-able-list>'
      });

    $urlRouterProvider.otherwise("/");
  })
  .run(function ($rootScope, $state, $meteor, $timeout, $http) {
    // Timeout so Meteor.user() is loaded. Required for checking if user is still correct.
    // TODO: The client is invalidating the session. This is an insecure practice.
    $timeout(function() {
	
	$http.get('/api/token').then(function(success) {
	    var token = success.data;
	    $rootScope.username = getUsername(token);
            if($rootScope.username == '')
                window.location = 'https://login.munisense.net/logout.php';
            $rootScope.logout = function() {
                window.location = 'https://login.munisense.net/logout.php';
            };

            if(Meteor.user() && Meteor.user().username != getUsername(token)) {
                Meteor.logout();
                // Wait a second for logging in. We have to logout first.
                $timeout(function() {
                    loginIfNeeded(token);
                }, 1000); // A second. Chosen randomly. It will probably have finished by then.
                return;
            }

            loginIfNeeded(token); 
	    }, function(error) {
	        window.location = 'https://login.munisense.net/logout.php';
	    });  
    }, 1000);

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED') {
        $state.go('orders');
      }
    });
  });

function getUsername(token) {
    var keyValues = token.split(";");
    var username = '';
    for(var i in keyValues) {
        var item = keyValues[i];
        var key = item.split('=')[0];
        var value = item.split('=')[1];

        if(key == 'uid')
            username = value;
    }
    return username;
}

function loginIfNeeded(token) {
    if(Meteor.userId() == null) {
        Accounts.callLoginMethod({
            methodArguments: [{
                muniToken: token
            }],
            userCallback: function (error, result) {
                console.log(error);
                console.log(result);
            }
        });
    }
}

function getCookie(cname) {
    if(!document.cookie)
        return "";

    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

