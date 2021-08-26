calendarApp.controller("modalController", ["$scope", "mainService", "$http", function($scope, mainService, $http){
    $scope.$on('objectBroadCastToModalController', function(event, data) {
        $scope.dateObj = data[0];
        $scope.tenantInfo = data[1];
        console.log($scope.dateObj,$scope.tenantInfo);
        // mainService.updateTenant($scope.dateObj);
        $scope.isModalVisible=true;
    });
    $scope.data = mainService.data;
    $scope.newTenantName = "";
    $scope.isModalVisible=false;

    $scope.addTenant = function(newTenantName, dateToReserve){
        $scope.closeModal();
        console.log(newTenantName, dateToReserve);
        mainService.addTenant(newTenantName, dateToReserve);
    }

    $scope.removeTenant = function(tenantInfo){
        $scope.closeModal();
        console.log(tenantInfo);
        mainService.removeTenant(tenantInfo);
    }
    
    $scope.closeModal = function(){
        $scope.isModalVisible=false;
        $scope.dataObj=null;
    }
}])