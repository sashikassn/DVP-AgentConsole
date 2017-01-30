/** * Created by Damith on 1/9/2017. */agentApp.controller('agentSettingCtrl', function ($scope, $http, FileUploader, fileService,                                                  jwtHelper, userProfileApiAccess, authService, agentSettingFact,                                                  loginService, ticketService) {    //basica data    $scope.tenant = 0;    $scope.company = 0;    $scope.isLoadingRequ = false;    $scope.pwdBox = false;    var loginName = authService.GetResourceIss();    $scope.getCompanyTenant = function () {        var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());        console.info(decodeData);        $scope.company = decodeData.company;        $scope.tenant = decodeData.tenant;    };    $scope.getCompanyTenant();    $scope.closeSettingPage = function () {        agentSettingFact.changeSettingPageStatus(false);    };    $scope.safeApply = function (fn) {        var phase = this.$root.$$phase;        if (phase == '$apply' || phase == '$digest') {            if (fn && (typeof(fn) === 'function')) {                fn();            }        } else {            this.$apply(fn);        }    };    $scope.scrollEnabled = false;    $scope.viewScroll = function () {        $scope.safeApply(function () {            $scope.scrollEnabled = true;        });    };    $scope.hideScroll = function () {        $scope.safeApply(function () {            $scope.scrollEnabled = false;        });    };    $scope.scrollOtherEnabled = false;    $scope.viewOtherScroll = function () {        $scope.safeApply(function () {            $scope.scrollOtherEnabled = true;        });    };    $scope.hideOtherScroll = function () {        $scope.safeApply(function () {            $scope.scrollOtherEnabled = false;        });    };    $scope.showPasswordHints = function () {        $scope.pwdBox = !$scope.pwdBox;    }    /* 01. view point functions (set dynamically height)     02.get current profile data     02. get settings page menu function     03. personal information     04. image crop and upload     05. ticket config     * */    //    //01. view point functions (set dynamically height)    document.getElementById('settingWrapper').style.height = jsUpdateSize();    var onLoadSetHeight = function () {        $scope.windowHeight = jsUpdateSize() + "px";        document.getElementById('settingWrapper').style.height = $scope.windowHeight;    };    window.onload = onLoadSetHeight();    window.onresize = function () {        $scope.windowHeight = jsUpdateSize() + "px";        document.getElementById('settingWrapper').style.height = $scope.windowHeight;    };    //02.get current profile data    $scope.CurrentProfile = {};    var loadCurrentProfile = function (username) {        userProfileApiAccess.getMyProfile().then(function (data) {            if (data.IsSuccess) {                $scope.CurrentProfile = data.Result;                if (data.Result) {                    if (data.Result.address) {                        $scope.displayAddress = data.Result.address.city + ' , ' + data.Result.address.province + ' , ' + data.Result.address.country;                    }                    if (data.Result.veeryaccount && data.Result.veeryaccount.contact) {                        $scope.displayVeeryContact = data.Result.veeryaccount.display + ' | ' + data.Result.veeryaccount.contact;                    }                    else {                        $scope.displayVeeryContact = 'Veery contact not configured yet';                    }                    if (data.Result.email) {                        $scope.displayEmail = data.Result.email.contact;                        $scope.displayEmailVerify = data.Result.email.verified;                    }                    // if (data.Result.phoneNumber) {                    //     $scope.displayPhoneNumber = data.Result.phoneNumber.contact;                    // }                    // if (data.Result.firstname) {                    //     $scope.displayName = data.Result.firstname;                    // }                    // if (data.Result.lastname) {                    //     $scope.displayName = $scope.displayName + ' ' + data.Result.lastname;                    // }                    if (data.Result.birthday) {                        var momentUtc = moment(data.Result.birthday).utc();                        data.Result.dob = {};                        data.Result.dob.day = momentUtc.date().toString();                        data.Result.dob.month = (momentUtc.month() + 1).toString();                        data.Result.dob.year = momentUtc.year();                    }                    else {                        data.Result.dob = {};                        data.Result.dob.day = moment().date().toString();                        data.Result.dob.month = (moment().month() + 1).toString();                        data.Result.dob.year = moment().year();                    }                    pickMyRatings(data.Result._id);                }            }            else {                console.log(data);            }        }, function (err) {            console.log(err);        });    };    var pickMyRatings = function (owner) {        userProfileApiAccess.getMyRatings(owner).then(function (resPapers) {            if (resPapers.Result) {                $scope.sectionArray = {};                $scope.myRemarks = [];                angular.forEach(resPapers.Result, function (submissions) {                    if (submissions.answers) {                        angular.forEach(submissions.answers, function (answer) {                            if (answer.section && answer.question && answer.question.weight > 0 && answer.question.type != 'remark') {                                if ($scope.sectionArray[answer.section._id]) {                                    var ansValue = $scope.sectionArray[answer.section._id].value;                                    var val = (answer.points * answer.question.weight) / 10;                                    $scope.sectionArray[answer.section._id].value = ansValue + val;                                    $scope.sectionArray[answer.section._id].itemCount += 1;                                    //  console.log(answer.section.name+" :  "+sectionArray[answer.section._id].value);                                    //console.log(answer.section.name+" Items :  "+sectionArray[answer.section._id].itemCount);                                }                                else {                                    //sectionArray[answer.section._id]=(answer.points * answer.question.weight)/10;                                    $scope.sectionArray[answer.section._id] =                                    {                                        value: (answer.points * answer.question.weight) / 10,                                        itemCount: 1,                                        name: answer.section.name,                                        id: answer.section._id                                    }                                    //console.log(answer.section.name+" :  "+sectionArray[answer.section._id].value);                                    // console.log(answer.section.name+" Items :  "+sectionArray[answer.section._id].itemCount);                                }                            }                            if (answer.section && answer.question && answer.question.type == 'remark') {                                var remarkObj =                                {                                    evaluator: submissions.evaluator.name,                                    section: answer.section.name,                                    remark: answer.remarks                                }                                $scope.myRemarks.push(remarkObj);                            }                        });                    }                });                //console.log($scope.sectionArray);            }            else {                console.log("Error");            }        }).catch(function (errPapers) {        })    };    $scope.inti = function () {        if (loginName) {            loadCurrentProfile(loginName);        }    };    //update profile image    var updateProfile = function () {        $scope.isLoadingRequ = true;        $('#proPersInfo').removeClass('display-none');        userProfileApiAccess.updateMyProfile($scope.CurrentProfile).then(function (data) {            $('#proPersInfo').addClass('display-none');            $('#updtBtn').removeClass('disabled-btn');            if (data.IsSuccess) {                $scope.showAlert('Success', 'success', 'User profile updated successfully');                $scope.isLoadingRequ = false;            }            else {                $scope.showAlert('Error', 'error', errMsg);                $scope.isLoadingRequ = false;            }        }, function (err) {            $scope.isLoadingRequ = false;            $('#proPersInfo').addClass('display-none');            loginService.isCheckResponse(err);            var errMsg = "Error occurred while saving profile";            if (err.statusText) {                errMsg = err.statusText;            }            $scope.showAlert('Error', 'error', errMsg);        });    };    /*settings page menu */    $scope.menusObj = {        menu: [],        selectedMenu: []    };    //Get setting menu    //Get all country list    var getSettingPageMenu = function () {        getJSONData($http, "settingMenu", function (res) {            $scope.menusObj.menu = res;            if (res && res.length != 0) {                $scope.menusObj.selectedMenu = res[0];                $scope.menusObj.selectedMenu.selected = true;            }        });    };    var getAllCountry = function () {        getJSONData($http, "countryList", function (res) {            $scope.countryList = res;        });    };    //Get all languages    var getAllLanguages = function () {        getJSONData($http, "languages", function (res) {            $scope.languages = res;        });    };    var onLoad = function () {        getSettingPageMenu();        getAllLanguages();        getAllCountry();    };    onLoad();    var getTicketConfig = function () {        ticketService.GetMyTicketConfig(function (status, res) {            if (status) {                $scope.ticket = res.Result;            } else {                $scope.showAlert('Error', 'error', 'Get Ticker Config Data Error.');            }        });    };    $scope.clickMenu = function (menu) {        if (menu) {            if ($scope.menusObj.selectedMenu.length != 0) {                $scope.menusObj.selectedMenu.selected = false;                $scope.menusObj.selectedMenu = [];                $scope.menusObj.selectedMenu = menu;                $scope.menusObj.selectedMenu.selected = true;                if ($scope.menusObj.selectedMenu.id == 'sm04') {                    getTicketConfig();                }            }        } else {            //upload image wrapper dispaly            $scope.menusObj.selectedMenu.selected = false;            $scope.menusObj.selectedMenu = [];            $scope.menusObj.selectedMenu = $scope.menusObj.menu[4];        }    };    //personal information    $scope.gender = ['Male', 'Female'];    var genDayList = function () {        var max = 31;        var dayArr = [];        for (min = 1; min <= max; min++) {            dayArr.push(min);        }        return dayArr;    };    $scope.dayList = genDayList();    $scope.monthList = [        {index: 1, name: "January"},        {index: 2, name: "February"},        {index: 3, name: "March"},        {index: 4, name: "April"},        {index: 5, name: "May"},        {index: 6, name: "June"},        {index: 7, name: "July"},        {index: 8, name: "August"},        {index: 9, name: "September"},        {index: 10, name: "October"},        {index: 11, name: "November"},        {index: 12, name: "December"}    ];    $scope.yearList = [];    var getYears = function () {        var currentYear = new Date().getFullYear();        for (var i = 0; i < 100 + 1; i++) {            $scope.yearList.push(currentYear - i);        }    };    getYears();    /*image crop and upload */    $scope.isUploadImg = false;    $scope.myCroppedImage = '';    //    $scope.file = {};    $scope.file.Category = "PROFILE_PICTURES";    var uploader = $scope.uploader = new FileUploader({        url: fileService.UploadUrl,        headers: fileService.Headers    });    var clearQueue = function () {        uploader.clearQueue();        $scope.isUploadDisable = true;    };    //filter upload image    uploader.filters.push({        name: 'imageFilter',        fn: function (item /*{File|FileLikeObject}*/, options) {            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;        }    });    // uploader callback function    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {        console.info('onWhenAddingFileFailed', item, filter, options);    };    uploader.onAfterAddingFile = function (item) {        console.info('onAfterAddingFile', item);        if (item.file.type.split("/")[0] == "image") {            //fileItem.upload();            item.croppedImage = '';            var reader = new FileReader();            reader.onload = function (event) {                $scope.$apply(function () {                    $scope.isUploadImg = true;                    item.image = event.target.result;                });            };            reader.readAsDataURL(item._file);            $scope.isUploadDisable = false;        }        else {            new PNotify({                title: 'Profile picture upload',                text: 'Invalid File type. Retry',                type: 'error',                styling: 'bootstrap3'            });        }    };    uploader.onAfterAddingAll = function (addedFileItems) {        if (!$scope.file.Category) {            uploader.clearQueue();            new PNotify({                title: 'File Upload!',                text: 'Invalid File Category.',                type: 'error',                styling: 'bootstrap3'            });            return;        }        console.info('onAfterAddingAll', addedFileItems);    };    uploader.onBeforeUploadItem = function (item) {        $scope.isLoadingRequ = true;        $('#proPersInfo').removeClass('display-none');        var blob = dataURItoBlob(item.croppedImage);        item._file = blob;        item.formData.push({'fileCategory': 'PROFILE_PICTURES'});    };    var dataURItoBlob = function (dataURI) {        var binary = atob(dataURI.split(',')[1]);        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];        var array = [];        for (var i = 0; i < binary.length; i++) {            array.push(binary.charCodeAt(i));        }        return new Blob([new Uint8Array(array)], {type: mimeString});    };    uploader.onProgressItem = function (fileItem, progress) {        console.info('onProgressItem', fileItem, progress);    };    uploader.onProgressAll = function (progress) {        console.info('onProgressAll', progress);    };    uploader.onSuccessItem = function (fileItem, response, status, headers) {        console.info('onSuccessItem', fileItem, response, status, headers);    };    uploader.onErrorItem = function (fileItem, response, status, headers) {        console.info('onErrorItem', fileItem, response, status, headers);        $scope.isLoadingRequ = false;        $('#proPersInfo').addClass('display-none');    };    uploader.onCancelItem = function (fileItem, response, status, headers) {        console.info('onCancelItem', fileItem, response, status, headers);    };    uploader.onCompleteItem = function (fileItem, response, status, headers) {        console.info('onCompleteItem', fileItem, response, status, headers);        console.log("result ", response.Result);        new PNotify({            title: 'File Upload!',            text: "Picture uploaded successfully",            type: 'success',            styling: 'bootstrap3'        });        if (response.Result) {            $scope.CurrentProfile.avatar = baseUrls.fileService + "InternalFileService/File/Download/" + $scope.tenant + "/" + $scope.company + "/" + response.Result + "/ProPic";            updateProfile();        }    };    uploader.onCompleteAll = function () {        console.info('onCompleteAll');        $scope.isLoadingRequ = false;        $('#proPersInfo').addClass('display-none');        $scope.cancelUpload();    };    $scope.cancelUpload = function () {        $scope.isUploadImg = false;        $scope.uploader.queue[0].image = "";        clearQueue();    };    //change agent password    $scope.oldPassword = null;    $scope.newPassword = null;    $scope.updateMyPassword = function (oldPwd, newPwd) {        //verify password        var param = {            oldpassword: '',            newpassword: ''        };        param.oldpassword = oldPwd;        param.newpassword = newPwd;        $scope.isLoadingRequ = true;        $('#proPersInfo').removeClass('display-none');        loginService.UpdateMyPwd(param, function (status, res) {            $scope.isLoadingRequ = false;            $('#proPersInfo').addClass('display-none');            if (res.IsSuccess) {                $scope.showAlert('Success', 'success', "Password updated successfully");            } else {                $scope.showAlert('Error', 'error', 'Current password is invalid..');            }        });    };    $scope.updateMyPersonalData = function () {        updateProfile();    };    //ticket config    $scope.ticket = {};    $scope.ticket = {        subject: '',        priority: 'normal',        description: ''    };    $scope.setPriority = function (priority) {        $scope.ticket.priority = priority;    };    $scope.updateTicketConfig = function () {        $scope.isLoadingRequ = true;        $('#proPersInfo').removeClass('display-none');        ticketService.SaveMyTicketConfig($scope.ticket, function (status, res) {            $('#proPersInfo').addClass('display-none');            $scope.isLoadingRequ = false;            if (status) {                $scope.showAlert('Success', 'success', 'Ticket Config Saved Successfully');            } else {                $scope.showAlert('Error', 'error', 'Ticker Config Save Error');            }        });    };    console.log('load agent setting ctrl...');});//Password verificationagentApp.directive('passwordVerify', function () {    return {        restrict: 'A', // only activate on element attribute        require: 'ngModel', // get a hold of NgModelController        link: function (scope, elem, attrs, ngModel) {            if (!ngModel) return; // do nothing if no ng-model            // watch own value and re-validate on change            scope.$watch(attrs.ngModel, function () {                validate();            });            // observe the other value and re-validate on change            attrs.$observe('passwordVerify', function (val) {                validate();            });            var validate = function () {                // values                var val1 = ngModel.$viewValue;                var val2 = attrs.passwordVerify;                // set validity                var status = !val1 || !val2 || val1 === val2;                ngModel.$setValidity('passwordVerify', status);                // return val1            };        }    }});agentApp.directive('starRating', function () {    return {        restrict: 'EA',        template: '<ul class="star-rating" ng-class="{readonly: readonly}">' +        '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +        '    <i class="fa fa-star"></i>' + // or &#9733        '  </li>' +        '</ul>',        scope: {            ratingValue: '=ngModel',            max: '=?', // optional (default is 5)            onRatingSelect: '&?',            readonly: '=?'        },        link: function (scope, element, attributes) {            if (scope.max == undefined) {                scope.max = 5;            }            function updateStars() {                scope.stars = [];                for (var i = 0; i < scope.max; i++) {                    scope.stars.push({                        filled: i < scope.ratingValue                    });                }            };            scope.toggle = function (index) {                if (scope.readonly == undefined || scope.readonly === false) {                    scope.ratingValue = index + 1;                    scope.onRatingSelect({                        rating: index + 1                    });                }            };            scope.$watch('ratingValue', function (oldValue, newValue) {                if (newValue) {                    updateStars();                }            });        }    };});agentApp.directive('passwordStrengthBox', [    function () {        return {            require: 'ngModel',            restrict: 'E',            scope: {                password: '=ngModel',                confirm: '=',                box: '='            },            link: function (scope, elem, attrs, ctrl) {                //password validation                scope.isShowBox = false;                scope.isPwdValidation = {                    minLength: false,                    specialChr: false,                    digit: false,                    capitalLetter: false                };                scope.$watch('password', function (newVal) {                    scope.strength = isSatisfied(newVal && newVal.length >= 8) +                        isSatisfied(newVal && /[A-z]/.test(newVal)) +                        isSatisfied(newVal && /(?=.*[A-Z])/.test(newVal)) +                        isSatisfied(newVal && /(?=.*\W)/.test(newVal)) +                        isSatisfied(newVal && /\d/.test(newVal));                    if (!ctrl || !newVal || scope.strength != 5) {                        ctrl.$setValidity('newPassword', false);                    } else {                        ctrl.$setValidity('newPassword', true);                    }                    //length                    if (newVal && newVal.length >= 8) {                        scope.isPwdValidation.minLength = true;                    } else {                        scope.isPwdValidation.minLength = false;                    }                    // Special Character                    if (newVal && /(?=.*\W)/.test(newVal)) {                        scope.isPwdValidation.specialChr = true;                    } else {                        scope.isPwdValidation.specialChr = false;                    }                    //digit                    if (newVal && /\d/.test(newVal)) {                        scope.isPwdValidation.digit = true;                    } else {                        scope.isPwdValidation.digit = false;                    }                    //capital Letter                    if (newVal && /(?=.*[A-Z])/.test(newVal)) {                        scope.isPwdValidation.capitalLetter = true;                    } else {                        scope.isPwdValidation.capitalLetter = false;                    }                    //check password confirm validation                    // if (scope.confirm) {                    //     var origin = scope.confirm;                    //     if (origin !== newVal) {                    //         ctrl.$setValidity("unique", false);                    //     } else {                    //         ctrl.$setValidity("unique", true);                    //     }                    // };                    function isSatisfied(criteria) {                        return criteria ? 1 : 0;                    }                }, true);            },            template: '<div ng-if="strength != ' + 5 + ' "' +            'ng-show=strength' +            ' class="password-leg-wrapper animated fadeIn ">' +            '<ul>' +            '<li>' +            '<i ng-show="isPwdValidation.minLength" class="ti-check color-green"></i>' +            '<i ng-show="!isPwdValidation.minLength" class="ti-close color-red"></i>' +            ' Min length 8' +            '</li>' +            '<li><i ng-show="isPwdValidation.specialChr" class="ti-check color-green "></i>' +            '<i ng-show="!isPwdValidation.specialChr" class="ti-close color-red"></i>' +            ' Special Character' +            '</li>' +            '<li><i ng-show="isPwdValidation.digit" class="ti-check color-green"></i>' +            '<i ng-show="!isPwdValidation.digit" class="ti-close color-red"></i>' +            ' Digit' +            '</li>' +            '<li><i ng-show="isPwdValidation.capitalLetter" class="ti-check color-green"></i>' +            '<i ng-show="!isPwdValidation.capitalLetter" class="ti-close color-red"></i>' +            ' Capital Letter' +            ' </li>' +            '</ul>' +            '</div>'        }    }]);