var app = angular.module('SitesApp', []);



//获取登录名
app.controller('HeaderController', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
        $http({
            method: 'get',
            url: '/user/getuser'
        }).success(function(data) {
            if (data.status == 0) {
                $window.location.href = 'signin.html';
            }
            else {
                $scope.email = data.user;
            }
        }).error(function(data) {

        });
    }
]);

//项目列表
app.controller('SitesListController', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
        $scope.getList = function() {
            $http({
                method: 'get',
                url: '/u/getsites'
            }).success(function(data) {
                $scope.sites = data;
            }).error(function(data) {
            });
        }

        //获取当前时间
        $scope.getNowDate = function (){
            var myDate = new Date();
            var year= myDate.getFullYear();
            var month= myDate.getMonth()+1;
            var day=myDate.getDate();
            var hh=myDate.getHours();
            var mm=myDate.getMinutes();
            var clock = year + "-";
            if(month < 10){
                clock += "0";
            }
            clock += month + "-";
            if(day < 10){
                clock += "0";
            }
            clock += day + " ";
            if(hh < 10){
                clock += "0";
            }
            clock += hh + ":";
            if (mm < 10) clock += '0';
            clock += mm;
            return(clock);
        };

        $scope.getList();

        //同步
        $scope.Synchro = function(siteid, target) {
            $('.synchstate').css('display', 'none');
            $http({
                method: 'get',
                url: '/download?siteid='+siteid
            }).success(function (data) {
                $scope.message= data.msg.substring(0,4);
                if(data.status==0){
                    target.synchShow=false;
                    angular.element(target).next().css('display','block');
                }
                else{
                    $('.synchstate').css('display', 'none');
                    angular.element(target).next().css('display','block');
                    var time= $scope.getNowDate();
                    angular.element(target).prev().find('span').text(time);
                }
            }).error(function (data) {});
        };

        //适配状态
        $scope.available = function(siteid, target, noconvert) {
            if(noconvert==0){
                $scope.noconvert=1;
            }
            else if(noconvert==1){
                $scope.noconvert=0;
            }
            $('.stateError').css('display', 'none');
            $http({
                method: 'post',
                url: '/u/sites/noconvert',
                data: {
                    id: siteid,
                    convalue: $scope.noconvert
                }
            }).success(function(data) {
                if (data.status == 0) {
                    angular.element(target).next().css('display', 'block');
                    $scope.errormsg = data.message;
                }
                else if (data.status == 1) {
                    $scope.getList();
                    if (noconvert == 0) {
                        angular.element(target).text('启用');
                        angular.element(target).prev().text('适配停用');
                    }
                    else if (noconvert == 1) {
                        angular.element(target).text('禁用');
                        angular.element(target).prev().text('适配正常');
                    }
                }
            }).error(function(data) {
            });
        }
    }
]);

//创建一个适配站
app.controller('CreateProController', ['$scope', '$http', '$window',
    function($scope, $http, $window) {
        $scope.submit = function() {
            $scope.id = $('input[type="text"]').val();
            $http({
                method: 'POST',
                url: '/u/sites/createdSite',
                data: {
                    id: $scope.id
                }
            }).success(function(data) {
                if (data.name) {
                    $('.am-close').trigger('click');
                    $window.location.reload();
                } else if (status == 0) {
                    $scope.error = data.message;
                }
            }).error(function(data) {
            });
        }
    }
]);


//获取同步信息
app.controller('LogController', ['$scope', '$http',
    function($scope, $http) {
        //获取同步日志
        $http({
            method: 'get',
            url: '/u/sites/getlogs?page=1'
        }).success(function(data) {
            $scope.logs = data.page;
        }).error(function(data) {
        });
    }
]);


//获取系统信息
app.controller('SysInfoController', ['$scope', '$http',
    function($scope, $http) {
        //获取系统信息
        $http({
            method: 'get',
            url: '/testhost'
        }).success(function(data) {
            $scope.state = data;
        }).error(function(data) {
        });
    }
])


//分页
app.controller('LogController', ['$scope', '$rootScope', '$http',
    function($scope, $rootScope, $http) {
        $scope.currentPage = 1;
        $scope.totalPage = 1;
        $scope.pages = [];
        $scope.endPage = 1;
        $scope.load = function() {
            $http({
                method: 'get',
                url: '/u/sites/getlogs',
                params: {
                    page: $scope.currentPage
                }
            }).success(function(data) {
                $scope.logs = data.page;
                $scope.totalPage = data.maxpage;
                $scope.endPage = data.maxpage;
                $scope.total=data.total;
                if($scope.total <= 15){
                    $scope.pageShow=true;
                }
                else{
                    $scope.pageShow=false;
                }
                if ($scope.currentPage > 1 && $scope.currentPage < $scope.totalPage) {
                    $scope.pages = [
                        $scope.currentPage - 1,
                        $scope.currentPage,
                        $scope.currentPage + 1
                    ];
                } else if ($scope.currentPage == 1 && $scope.totalPage > 1) {
                    $scope.pages = [
                        $scope.currentPage,
                        $scope.currentPage + 1
                    ];
                } else if ($scope.currentPage == $scope.totalPage && $scope.totalPage > 1) {
                    $scope.pages = [
                        $scope.currentPage - 1,
                        $scope.currentPage
                    ];
                }

            });
        };
        $scope.next = function() {
            if ($scope.currentPage < $scope.totalPage) {
                $scope.currentPage++;
                $scope.load();
            }
        };

        $scope.prev = function() {
            if ($scope.currentPage > 1) {
                $scope.currentPage--;
                $scope.load();
            }
        };

        $scope.loadPage = function(page) {
            $scope.currentPage = page;
            $scope.load();
        };

        $scope.load();
    }
]);



var Restaurant = function($q, $rootScope){
    var currentOrder;
    this.takeOrder = function(orderedItems){
        currentOrder = {
            deffered:$q.defer(),
            items: orderedItems
        };
        return currentOrder.deffered.promise;
    };
    this.deliverOrder = function(){
        currentOrder.deffered.resolve(currentOrder.items);
        $rootScope.$digest();
    };
    this.problemWithOrder = function(reason){
        currentOrder.deffered.reject(reason);
        $rootScope.$digest();
    }
}