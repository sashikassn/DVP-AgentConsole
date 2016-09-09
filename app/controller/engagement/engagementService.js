/**
 * Created by Rajinda on 9/5/2016.
 */

agentApp.factory("engagementService", function ($http, baseUrls,authService) {


    var getEngagementIdsByProfile = function (id) {
        return $http({
            method: 'get',
            url: baseUrls.engagementUrl+"EngagementByProfile/"+id,
            headers: {
                'authorization': authService.GetToken(),
                'companyinfo':'1:103'
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementSession = function (id) {
        return $http({
            method: 'get',
            url: baseUrls.engagementUrl+"Engagement/"+id,
            headers: {
                'authorization':authService.GetToken(),'companyinfo':'1:103'
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementSessions = function (engagementId, ids) {
        var q='?';
        angular.forEach(ids,function(item){
         q = q + 'session='+item+'&';
        });

        return $http({
            method: 'get',
           // params: ids,
            url: baseUrls.engagementUrl+"Engagement/"+engagementId+"/EngagementSessions"+q,
            headers: {
                'authorization':authService.GetToken(),'companyinfo':'1:103'
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var getEngagementSessionNote = function (engagementId) {

        return $http({
            method: 'get',
           // params: ids,
            url: baseUrls.engagementUrl+"EngagementSession/"+engagementId+"/Note",
            headers: {
                'authorization':authService.GetToken(),'companyinfo':'1:103'
            }
        }).then(function (response) {
            if (response.data && response.data.IsSuccess) {
                return response.data.Result;
            } else {
                return undefined;
            }
        });
    };

    var appendNoteToEngagementSession = function (engagementId,note) {

        return $http({
            method: 'post',
            data: note,
            url: baseUrls.engagementUrl+"EngagementSession/"+engagementId+"/Note",
            headers: {
                'authorization':authService.GetToken(),'companyinfo':'1:103'
            }
        }).then(function (response) {
            if (response.data) {
                return response.data.IsSuccess;
            } else {
                return false;
            }
        });
    };

    return {
        GetEngagementIdsByProfile: getEngagementIdsByProfile,
        GetEngagementSession:getEngagementSession,
        GetEngagementSessions:getEngagementSessions,
        GetEngagementSessionNote:getEngagementSessionNote,
        AppendNoteToEngagementSession:appendNoteToEngagementSession
    }
});

