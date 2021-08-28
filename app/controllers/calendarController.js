calendarApp.controller("calendarController", ["$scope", "calendarService", function($scope, calendarService){
   
   $scope.name = "Calendar App";
   // links mainService calendar object to the controller's $scope
   $scope.calendar = calendarService.calendarObject;
    
   $scope.showDateDetails = function (dateObj,tenantInfo){
   // Broadcasts the date object and tenant name (if any) to its child controller 
       $scope.$broadcast('objectBroadCastToModalController', [dateObj,tenantInfo]);
   }

   $scope.goToNextMonth = function(){
   // calls mainService functions to go to next month 
       calendarService.goToNextMonth();
   }
   $scope.goToPrevMonth = function(){
   // calls mainService functions to go to previous month 
       calendarService.goToPrevMonth();
   }
   
}]);