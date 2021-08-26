calendarApp.controller("mainController", ["$scope", "mainService", function($scope, mainService){
   $scope.name = "Calendar App";

   $scope.calendar = mainService.calendarObject;
    
   $scope.showDateDetails = function (dateObj){
       console.log(dateObj);
       $scope.$broadcast('objectBroadCastToModalController', dateObj);
       // mainService.updateTenant(dateObj);
   }

   $scope.goToNextMonth = function(){
       mainService.goToNextMonth();
   }
   $scope.goToPrevMonth = function(){
       mainService.goToPrevMonth();
   }
   
}]);