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
	
	$http.get('/api/username').then(function(success) {
	    var username = success.data;
	    $rootScope.username = username;
            if($rootScope.username == '')
                window.location = 'https://login.munisense.net/logout.php';
            $rootScope.logout = function() {
                window.location = 'https://login.munisense.net/logout.php';
            };

            if(Meteor.user() && Meteor.user().username != username) {
                Meteor.logout();
                // Wait a second for logging in. We have to logout first.
                $timeout(function() {
                    loginIfNeeded(username);
                }, 1000); // A second. Chosen randomly. It will probably have finished by then.
                return;
            }

            loginIfNeeded(username); 
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


function loginIfNeeded(username) {
    if(Meteor.userId() == null) {
        Accounts.callLoginMethod({
            methodArguments: [{
                username: username
            }],
            userCallback: function (error, result) {
                console.log(error);
                console.log(result);
            }
        });
    }
}


