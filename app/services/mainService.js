
calendarApp.service("mainService", ["$http", function($http){
    const self = this;
    this.calendarObject = {};
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let dt = new Date();
    let day = dt.getDate();
    let month = dt.getMonth();
    let year = dt.getFullYear();
    let offSet = dt.getTimezoneOffset()*60;
    let reservedTenantsList={};
    // this.data = null;
   

    function getdaysBeforeFirstDay(year, month){
        return new Date(year, month, 1).getDay();
    }

    function getDaysInCurrentMonth(year, month){
        return new Date(year, month+1, 0).getDate();
    }
        
    function getDateObject(year, month, day){
        let daysBeforeCurrentDay = getdaysBeforeFirstDay(year, month);
        let daysInCurrentMonth = getDaysInCurrentMonth(year, month);
        //console.log('as', reservedTenantsList);
        let temp = {}
        for (let i = 1; i <= 35; i++){
            if (i <= daysBeforeCurrentDay){
                temp[String(i)] = {
                    isInCurrentMonth: false,
                    day:              "",
                    status:           true
                }
            } else if  (i <= daysBeforeCurrentDay+daysInCurrentMonth) {
                temp[String(i)] = {
                    isInCurrentMonth: true,
                    day:              i - daysBeforeCurrentDay,
                    month:            month,
                    monthName:        months[month],
                    year:             year,
                    status:           false
                }
            } else {
                temp[String(i)] = {
                    isInCurrentMonth: false,
                    day:              "",
                    status:           true
                }
            }
        }
        return temp;
    }

    function isValidMonth(month){
        return ((month > 11) | (month < 0)) ? false : true;
    }

    function getNextMonth(month, year){
        return (isValidMonth(month) ? ((month >= 11) ? [0, year+1] : [month+1, year]) : "Month is not correct..");
    }
    function getPrevMonth(month, year){
        return (month <= 0) ? [11, year-1] : [month-1, year];
    }

    function setNextPrevMonthInCalendarObject(temp){
        self.calendarObject.month = temp[0];
        self.calendarObject.year = temp[1];
        getTenants({"year":temp[1],"month":temp[0],"day":1}, to={"year":temp[1],"month":temp[0],"day":getDaysInCurrentMonth(temp[1], temp[0])});
        self.calendarObject.dateObject = getDateObject(self.calendarObject.year, self.calendarObject.month, 1);
        self.calendarObject.monthName = months[self.calendarObject.month];
    }

    this.goToNextMonth = function(){
        setNextPrevMonthInCalendarObject(getNextMonth(this.calendarObject.month, this.calendarObject.year));
    }

    this.goToPrevMonth = function(){
        setNextPrevMonthInCalendarObject(getPrevMonth(this.calendarObject.month, this.calendarObject.year));
    }

    function getUnixFromDateTime(date){
        return isValidMonth(date.month) ? new Date(date.year, date.month, date.day, 1).getTime()/1000 : "Month is not correct..";
    }

    function getDateFromUnix(unix){
        //console.log(unix,new Date(unix*1000).getDate())
        return new Date(unix*1000).getUTCDate();
    }

    function saveTenants(tenantResponse){
        this.data = tenantResponse.reserved[0];
        //console.log(this.data)
    }

    function updateReservedTenantsList(reservedData){
        reservedTenantsList = {};
        for (let i=0; i<reservedData.length; i++){
            let reservedDate = getDateFromUnix(reservedData[i].time);
            //console.log(reservedDate,reservedData[i],i);
            reservedTenantsList[reservedDate] = reservedData[i];
        }

        self.calendarObject.reservedTenantsList['data'] = reservedTenantsList;
    }
    
    getTenants = async function(from={"year":year,"month":month,"day":1}, to={"year":year,"month":month,"day":getDaysInCurrentMonth(year, month)}, url="http://localhost:3000"){
        let fromUnixTime = getUnixFromDateTime(from);
        let toUnixTime = getUnixFromDateTime(to);
        //console.log(fromUnixTime, toUnixTime)
        return this.data = $http.get(`${url}/reserve/${fromUnixTime}/${toUnixTime}`)
            .then( function (response){
                updateReservedTenantsList(response.data.reserved);
            }, function(reason){
                this.error = reason.data;
            });
    }
    
    getTenants();

    this.calendarObject = {
        weekdays,
        dateObject: getDateObject(year, month, day),
        month,
        monthName: months[month],
        year,
        reservedTenantsList
    }

}]);
