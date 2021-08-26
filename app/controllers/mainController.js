calendarApp.controller("mainController", ["$scope", "mainService", function($scope, mainService){
   $scope.name = "Calendar App";

   $scope.calendar = mainService.calendarObject;
    
   $scope.showDateDetails = function (dateObj,tenantInfo){
       console.log(dateObj,tenantInfo);
       $scope.$broadcast('objectBroadCastToModalController', [dateObj,tenantInfo]);
       // mainService.updateTenant(dateObj);
   }

   $scope.goToNextMonth = function(){
       mainService.goToNextMonth();
   }
   $scope.goToPrevMonth = function(){
       mainService.goToPrevMonth();
   }
   
}]);