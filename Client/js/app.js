var app = angular.module('myApp', ['ui.router', 'ngBootbox', 'ngStorage', 'restangular', 'satellizer', 'toastr']);

app.config(function($stateProvider, $urlRouterProvider, $authProvider) {

        $stateProvider
            .state('login', {
                url: '/',
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    //skipIfLoggedIn: skipIfLoggedIn
                }

            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'partials/signup.html',
                controller: 'SignupCtrl',
                resolve: {
                    //skipIfLoggedIn: skipIfLoggedIn
                }

            })
            .state('home', {
                url: '/dashboard',
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl',
                resolve: {
                    //loginRequired: loginRequired
                }

            })
            .state('home.project', {
                url: '/:id',
                templateUrl: 'partials/project.html',
                controller: 'projectCtrl',
                resolve: {
                    // loginRequired: loginRequired
                }

            })
            .state('logout', {
                url: '/logout',
                template: null

            })
        $authProvider.loginUrl = '/auth/login';
        $authProvider.signupUrl = '/auth/signup';

        $urlRouterProvider.otherwise('/');
    })
    .controller('LoginCtrl', function($scope, $state, $location, $auth, toastr, $localStorage) {

        $scope.login = function() {
            $auth.login($scope.user)
                .then(function(response) {
                    if (response.data.token) {
                        $localStorage.user = response.data.user;
                        $auth.setToken(response.data.token);
                        $state.go('home');
                    }
                })
                .catch(function(error) {
                    alert(error);
                });
        };

    })
    .controller('SignupCtrl', function($scope, $state, $location, $auth, toastr, $localStorage) {
        $scope.signup = function() {
            $auth.signup($scope.user)
                .then(function(response) {
                    $localStorage.user = response.data.user;

                    $auth.setToken(response);
                    $state.go('home', {
                        user: response.data.user
                    });
                    //        toastr.info('You have successfully created a new account and have been signed-in');
                })
                .catch(function(response) {
                    alert(response.data.message);
                    //toastr.error(response.data.message);
                });
        };
    })
    .controller('HomeCtrl',
        function($scope, $state, $localStorage, $location, $auth, toastr, $http, $rootScope) {
            $(document).on('click', '.clickable', function(e) {
                var $this = $(this);
                if (!$this.hasClass('panel-collapsed')) {
                    $this.parents('.rp').find('.rb').slideUp();
                    $this.addClass('panel-collapsed');
                    $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                } else {
                    $this.parents('.rp').find('.rb').slideDown();
                    $this.removeClass('panel-collapsed');
                    $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
                }
                
            })
            $(document).on('click', '.clickable1', function(e) {
                var $this = $(this);
                if (!$this.hasClass('pan-collapsed')) {
                    $this.parents('.pan').find('.pb').slideUp();
                    $this.addClass('pan-collapsed');
                    $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
                } else {
                    $this.parents('.pan').find('.pb').slideDown();
                    $this.removeClass('pan-collapsed');
                    $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
                }
                
            })
            /************/
            $scope.onBlur = function(pass) {
                $http({
                    method: 'post',
                    url: "/auth/password",
                    data: { password: pass, email: $localStorage.user.email }
                }).success(function(data) {
                    if (data.message == true) {
                        $scope.wrong = false;
                    } else {
                        $scope.wrong = true;
                    }
                }).error(function(data) {
                   $scope.wrong = true;
                });
            }
            $scope.match = function(p1, p2) {
                if(p1==p2){
                    $scope.correct=false;
                    if($scope.wrong==false){
                        $scope.save=true;
                    }
                }
                else{
                    $scope.correct=true;
                }
                
            }
            $scope.changePass=function(pass){
                  $http({
                    method: 'post',
                    url: "/auth/changePassword",
                    data: { password: pass, email: $localStorage.user.email }
                }).success(function(data) {
                    if(data.status==1){
                    $('#password').modal('hide');
                }
                else{
                    $scope.no=true;
                }
                }).error(function(data) {
                   
                });
            }
            /************/
            $http({
                method: 'get',
                url: "/auth/me"
            }).success(function(data) {
                $scope.user = data;
                $localStorage.user = data;
            }).error(function(data) {
                console.log(data.message);
            });

            $http({
                method: 'get',
                url: "/plugins"
            }).success(function(data) {
                $scope.plugins = data;
            }).error(function(data) {
                console.log(data.message);
            });
            $rootScope.plugs = [];
            $scope.project = {};
            $scope.addplugin = function(pl) {
                if (pl.bool) {
                    $rootScope.plugs.push(pl._id);
                } else {
                    var index = $rootScope.plugs.indexOf(pl._id);
                    $rootScope.plugs.splice(index, 1);
                }
            }
            $scope.rmRole = function(r, p) {
                $http({
                    method: 'POST',
                    url: "/" + $localStorage.user.url + "/" + p.title + "/delRole",
                    data: {
                        role: r
                    }
                }).success(function(data) {
                    projects();
                }).error(function(data) {
                    console.log(data.message);
                });
            }
            $scope.addRole = function(role, p) {
                $http({
                    method: 'POST',
                    url: "/" + $localStorage.user.url + "/" + p.title + "/role",
                    data: {
                        role: role
                    }
                }).success(function(data) {
                    projects();
                }).error(function(data) {
                    console.log(data.message);
                });
            }
            $scope.proles = function(p) {
                return Object.keys(p.roles)
            }
            $scope.dev = function(p, v, m) {
                $http({
                    method: 'POST',
                    url: "/" + $localStorage.user.url + "/" + p.title + "/" + v + "/edit",
                    data: {
                        role: m
                    }
                }).success(function(data) {
                    console.log(data)
                    //projects();
                })
            }
            $scope.fire = function() {
                if ($scope.project.db == 'firebase') {
                    bootbox.dialog({
                        message: '<div class="row">  ' +
                            '<div class="col-md-12"> ' +
                            '<form class="form-horizontal"> ' +
                            '<div class="form-group"> ' +
                            '<label class="col-md-4 control-label" >Provide Your Firebase Config Object here!!</label> ' +
                            '<div class="col-md-4"> ' +
                            '<textarea class="form-control" id="query" rows="10" cols="50" ng-model="query"></textarea>' +
                            '</div></div> ' +
                            '</div> ' +
                            '</form></div></div>',
                        buttons: {
                            success: {
                                label: "Save",
                                className: "btn-default",
                                callback: function() {
                                    var config = $('#query').val();
                                    $scope.project.config = firebaseConfigObj(config);

                                }
                            }
                        }
                    });
                }

            }
            $scope.createProject = function(project) {
                //console.log(project.config);
                $http({
                    method: 'POST',
                    url: "/" + $localStorage.user.url + "/project",
                    data: project
                }).success(function(data) {
                    projects();
                }).error(function(data) {
                    alert("error in project creation");
                });
            }
            $scope.prmpt = function(p, r, m) {
                /*********/
                bootbox.dialog({
                    message: '<div class="row">  ' +
                        '<div class="col-md-12"> ' +
                        '<form class="form-horizontal"> ' +
                        '<div class="form-group"> ' +
                        '<label class="col-md-4 control-label" >Type your JSON!!</label> ' +
                        '<div class="col-md-4"> ' +
                        '<textarea class="form-control" id="query" rows="10" cols="50" ng-model="query"></textarea>' +
                        '</div></div> ' +
                        '</div> ' +
                        '</form></div></div>',
                    buttons: {
                        success: {
                            label: "Query",
                            className: "btn-default",
                            callback: function() {
                                var query = $('#query').val();
                                $rql.read(JSON.parse(query))
                                    .then(function(res) {
                                        $scope.data = JSON.stringify(res);
                                        console.log($scope.data);

                                    });
                            }
                        },
                        warning: {
                            label: "Mutation",
                            className: "btn-default",
                            callback: function() {
                                var query = $('#query').val();
                                $rql.create(query)
                                    .then(function(res) {
                                        $scope.data = JSON.stringify(res);
                                        console.log($scope.data);

                                    });
                            }
                        },
                        main: {
                            label: "Update",
                            className: "btn-default",
                            callback: function() {
                                var query = $('#query').val();
                                $rql.update(query)
                                    .then(function(res) {
                                        $scope.data = JSON.stringify(res);
                                        console.log($scope.data);

                                    });
                            }
                        },
                        danger: {
                            label: "Delete",
                            className: "btn-default",
                            callback: function() {
                                var query = $('#query').val();
                                $rql.delete(query)
                                    .then(function(res) {
                                        $scope.data = JSON.stringify(res);
                                        console.log($scope.data);

                                    });
                            }
                        }
                    }
                });

            }
            $scope.sdk = function(p) {
                var opts = "";
                $http.get('../sdk/app.js')
                    .then(function(content) {
                        var data = content.data;
                        data = data.replace("user here", $localStorage.user.url);
                        data = data.replace("project here", p.title);
                        $http.get('../plugins/crud.txt')
                            .then(function(options) {
                                opts = options.data;

                                if ($rootScope.plugs && $rootScope.plugs.length > 0) {
                                    for (var i in $rootScope.plugs) {
                                        (function(i) {
                                            $http({
                                                method: 'get',
                                                url: "/plugin/" + $rootScope.plugs[i],
                                            }).success(function(r) {
                                                opts = opts + r.code;
                                                data = data.replace('OPT:"OPTS"', opts);

                                                if (i == $rootScope.plugs.length - 1) {
                                                    $http({
                                                        method: 'post',
                                                        url: "/plugin/template",
                                                        data: {
                                                            data: data
                                                        }
                                                    }).success(function(r) {
                                                        $http.get('../sdk/dist/rql.bundle.js')
                                                            .then(function(d) {

                                                                var blob = new Blob([d.data], {
                                                                    type: "application/json;charset=utf-8;"
                                                                });
                                                                var downloadLink = document.createElement('a');
                                                                downloadLink.setAttribute('download', 'rql.min.js');
                                                                downloadLink.setAttribute('href', window.URL.createObjectURL(blob));
                                                                downloadLink.click();
                                                            });
                                                    })

                                                }
                                            });
                                        }(i));
                                    }
                                } else {

                                    data = data.replace('OPT:"OPTS"', opts);
                                    $http({
                                        method: 'post',
                                        url: "/plugin/template",
                                        data: {
                                            data: data
                                        }
                                    }).success(function(r) {
                                        $http.get('../sdk/dist/rql.bundle.js')
                                            .then(function(d) {

                                                var blob = new Blob([d.data], {
                                                    type: "application/json;charset=utf-8;"
                                                });
                                                var downloadLink = document.createElement('a');
                                                downloadLink.setAttribute('download', 'rql.min.js');
                                                downloadLink.setAttribute('href', window.URL.createObjectURL(blob));
                                                downloadLink.click();
                                            });
                                    })

                                }

                                /*----------------------*/

                            })

                    }, function(error) {

                        alert('error');
                    });

            }

            function projects() {
                $http({
                    url: "/" + $localStorage.user.url + "/projects",
                    method: 'GET'
                }).success(function(response) {
                    $scope.projectList = response;
                }).error(function(data) {
                    console.log("projects not found");
                });
            }
            projects();
        })
    .directive('pwCheck', [function() {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                elem.add(firstPassword).on('keyup', function() {
                    scope.$apply(function() {
                        // console.info(elem.val() === $(firstPassword).val());
                        ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                    });
                });
            }
        }
    }]);

function firebaseConfigObj(i) {
    for (var r = i.split("\n"), t = {}, l = 4; 10 > l; l++) {
        var s = r[l].split(":");
        if (2 == s.length) {
            var e = s[1].split('"');
            t[s[0].trim()] = e[1]
        } else {
            var n = s[1].split('"'),
                a = s[2].split('"');
            t[s[0].trim()] = n[1] + ":" + a[0]
        }
    }
    return t
}
