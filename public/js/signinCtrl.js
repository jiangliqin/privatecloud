var app = angular.module('SigninApp', []);

app.controller('SignInController', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
        $scope.submit = function() {
            $scope.user.password = $('.user-pwd').val();
            $scope.user.email = $('.user-email').val();
            $http({
                method: 'POST',
                url: '/user/login',
                data: $scope.user
            }).success(function(data) {
                if (data.status === 0) {
                    $scope.message = data.message;
                } else if (data.status === 1) {
                    $window.location.href = 'sites.html';
                }
            }).error(function(data) {
                $scope.message = data;
            });
        }

    }
]);