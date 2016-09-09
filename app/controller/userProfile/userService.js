/**
 * Created by Rajinda on 9/9/2016.
 */


agentApp.factory("userService", function ($http, baseUrls,authService) {


    var getExternalUserProfileByContact = function (category,contact) {
        return $http({
            method: 'GET',
            url: baseUrls.userServiceBaseUrl+"ExternalUser/ByContact/"+category+"/"+contact,
            headers: {
                'authorization': authService.GetToken()
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var loadUser = function () {

        return $http.get('assets/json/assigneeUsers.json', {cache: true}).then(function (response) {
            var countries = response.data;
            console.log(countries);
            return countries.filter(function (country) {
                return country.profileName.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        });
    };


    return {
        GetExternalUserProfileByContact:getExternalUserProfileByContact,
        LoadUser:loadUser
    }
});

