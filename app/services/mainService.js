
calendarApp.service("mainService", ["$http", function($http){
    const self = this;
    this.calendarObject = {};
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let locale = 'Asia/Dubai';
    let dt = new Date();
    dt = moment.tz(dt,locale);
    let day = dt.date();
    let month = dt.month();
    let year = dt.year();
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
        getTenants({"year":temp[1],"month":temp[0],"day":1}, {"year":temp[1],"month":temp[0],"day":getDaysInCurrentMonth(temp[1], temp[0])});
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
        console.log(date.year,date.month,date.day)
        return isValidMonth(date.month) ? moment.tz(new Date(date.year, date.month, date.day, 1), locale).startOf('day').unix() : "Month is not correct..";
    }

    function getDateFromUnix(unix){
        //console.log(unix,new Date(unix*1000).getDate())
        return moment.unix(unix).tz(locale).startOf('day').date();
    }

    function saveTenants(tenantResponse){
        this.data = tenantResponse.reserved[0];
        //console.log(this.data)
    }

    function updateReservedTenantsList(reservedData){
        reservedTenantsList = {};
        for (let i=0; i<reservedData.length; i++){
            let reservedDate = getDateFromUnix(reservedData[i].time);
            console.log(reservedDate,reservedData[i],i);
            reservedTenantsList[reservedDate] = reservedData[i];
        }

        self.calendarObject.reservedTenantsList['data'] = reservedTenantsList;
    }
    
    getTenants = async function(
                    from={"year":self.calendarObject.year,"month":self.calendarObject.month,"day":1},
                    to={"year":self.calendarObject.year,"month":self.calendarObject.month,"day":getDaysInCurrentMonth(self.calendarObject.year, self.calendarObject.month)},
                    url="http://localhost:3000"){
        console.log(from,to)
        let fromUnixTime = getUnixFromDateTime(from);
        let toUnixTime = getUnixFromDateTime(to);
        console.log(fromUnixTime, toUnixTime,'fromTo')
        return this.data = $http.get(`${url}/reserve/${fromUnixTime}/${toUnixTime}`)
            .then( function (response){
                updateReservedTenantsList(response.data.reserved);
            }, function(reason){
                this.error = reason.data;
            });
    }

    this.addTenant = function(newTenantName, dateToReserve){
        console.log(newTenantName,dateToReserve,'service');
        let url = `http://localhost:3000/reserve/`;
        let tenantDataToPush = {
            "tennantName": newTenantName,
            "time": getUnixFromDateTime(dateToReserve),
            "reserved": true
        };
        $http.post(url, tenantDataToPush).success(function (data, status, headers, config) {
                getTenants();
            })
            .error(function (data, status, header, config) {
                responseDetails = "Data: " + data +
                    "<hr />status: " + status +
                    "<hr />headers: " + header +
                    "<hr />config: " + config;
            });
    }

    this.removeTenant = function(tenantInfo){
        console.log(tenantInfo,'service');
        let url = `http://localhost:3000/reserve/`;
        tenantInfo["reserved"] = false;
        $http.post(url, tenantInfo).success(function (data, status, headers, config) {
                getTenants();
            })
            .error(function (data, status, header, config) {
                responseDetails = "Data: " + data +
                    "<hr />status: " + status +
                    "<hr />headers: " + header +
                    "<hr />config: " + config;
            });
    }
    
    

    this.calendarObject = {
        weekdays,
        dateObject: getDateObject(year, month, day),
        month,
        monthName: months[month],
        year,
        reservedTenantsList
    }

    getTenants();

}]);
