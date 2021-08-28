calendarApp.controller("modalController", ["$scope", "calendarService", "$http", function($scope, calendarService, $http){

    $scope.data = calendarService.data;
    $scope.newTenantName = "";
    $scope.isModalVisible=false;

    $scope.$on('objectBroadCastToModalController', function(event, data) {
    /*  
        listening to parent's broadcast, 
        triggers when $broadcast is called in mainController.
    */
        $scope.dateObj = data[0];
        $scope.tenantInfo = data[1];
        $scope.isModalVisible=true;
    });

    $scope.addTenant = function(newTenantName, dateToReserve){
    /* 
        closes the modal component and
        calls mainService addTenant function to reserve the room.
    */
        $scope.closeModal();
        calendarService.addTenant(newTenantName, dateToReserve);
    }

    $scope.removeTenant = function(tenantInfo){
    /* 
        closes the modal component and
        calls mainService removeTenant function to unreserve the room.
    */
        $scope.closeModal();
        calendarService.removeTenant(tenantInfo);
    }
    
    $scope.closeModal = function(){
        // closes the modal component 
        $scope.newTenantName = "";
        $scope.isModalVisible=false;
        $scope.dataObj=null;
    }
}])