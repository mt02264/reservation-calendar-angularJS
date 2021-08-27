
calendarApp.service("mainService", ["$http", function($http){
    
    // declares constants and variables for future use in functions
    const self = this;
    this.calendarObject = {};
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let locale = 'GMT';
    let dt = new Date();
    moment.tz.setDefault(locale);
    dt = moment.tz(dt,locale);
    let day = dt.date();
    let month = dt.month();
    let year = dt.year();
    let reservedTenantsList={};

    function getdaysBeforeFirstDay(year, month){
        // returns an index of first day [0-6] for the month-year 
        return new Date(year, month, 1).getDay();
    }

    function getDaysInCurrentMonth(year, month){
    /* 
        parameters : year and month
        returns    : the last day of the month given [28-31] 
    */
        return new Date(year, month+1, 0).getDate();
    }
        
    function getDateObject(year, month, day){
    /* 
        parameters : year, month and day
        returns    : returns a date object which has key/value pairs
                     key   : string value of date (hence unique for a month)
                     value : an object contains date/month/monthName/year
    */
        let daysBeforeCurrentDay = getdaysBeforeFirstDay(year, month);
        let daysInCurrentMonth = getDaysInCurrentMonth(year, month);
        let tempDateObject = {}
        for (let i = 1; i <= 35; i++){

            if (i <= daysBeforeCurrentDay){
                // empty days before the first day
                tempDateObject[String(i)] = {
                    isInCurrentMonth: false,
                    day:              "",
                    status:           true
                }
            } else if  (i <= daysBeforeCurrentDay+daysInCurrentMonth) {
                tempDateObject[String(i)] = {
                    isInCurrentMonth: true,
                    day:              i - daysBeforeCurrentDay,
                    month:            month,
                    monthName:        months[month],
                    year:             year,
                    status:           false
                }
            } else {
                // empty days after the last day
                tempDateObject[String(i)] = {
                    isInCurrentMonth: false,
                    day:              "",
                    status:           true
                }
            }
        }
        return tempDateObject;
    }

    function isValidMonth(month){
        // returns true if month is in [0-11] 
        return ((month > 11) || (month < 0)) ? false : true;
    }

    function getNextMonth(month, year){
        // returns next month, year
        return (isValidMonth(month) ? ((month >= 11) ? [0, year+1] : [month+1, year]) : "Month is not correct..");
    }

    function getPrevMonth(month, year){
        // returns previous month, year
        return (isValidMonth(month) ? ((month <= 0) ? [11, year-1] : [month-1, year]) : "Month is not correct..");
    }

    function setNextPrevMonthInCalendarObject(tempMonthYearList){
    /* 
        parameters : month, year 
        working    : 1. updates the service's calendarObject for the month, year
                        received in the parameter's list.
                     2. refreshes the tenants for the new month, year
        returns    : nothing
    */
        self.calendarObject.reservedTenantsList['data']={};
        self.calendarObject.month = tempMonthYearList[0];
        self.calendarObject.year = tempMonthYearList[1];
        getTenants({"year":tempMonthYearList[1],"month":tempMonthYearList[0],"day":1}, 
                   {"year":tempMonthYearList[1],"month":tempMonthYearList[0],"day":getDaysInCurrentMonth(tempMonthYearList[1], tempMonthYearList[0])});
        self.calendarObject.dateObject = getDateObject(self.calendarObject.year, self.calendarObject.month, 1);
        self.calendarObject.monthName = months[self.calendarObject.month];
    }

    this.goToNextMonth = function(){
    /* 
        working    : 1. gets the next month, year
                     2. passes the returned month, year to the 
                        setNextPrevMonthInCalendarObject function
                        which updates the calendarObject
    */
        setNextPrevMonthInCalendarObject(getNextMonth(this.calendarObject.month, this.calendarObject.year));
    }

    this.goToPrevMonth = function(){
    /* 
        working    : 1. gets the previous month, year
                     2. passes the returned month, year to the 
                        setNextPrevMonthInCalendarObject function
                        which updates the calendarObject
    */
        setNextPrevMonthInCalendarObject(getPrevMonth(this.calendarObject.month, this.calendarObject.year));
    }

    function getUnixFromDateTime(date){
    /* 
        parameters : date object
        returns    : unix converted timestamp if valid date given 
    */
        return isValidMonth(date.month) ? moment.tz(new Date(date.year, date.month, date.day,5), locale).startOf('day').unix() : "Month is not correct..";
    }

    function getDateFromUnix(unix){
    /* 
        parameters : unix timestamp
        returns    : date object converted from unix timestamp 
    */
        return moment.unix(unix).tz(locale).startOf('day').date();
    }

    function updateReservedTenantsList(reservedData){
    /* 
        parameters : tenant data returned by the server for the given time period
        working    : 1. creates an object of key/value pairs
                        key   : string converted reserved date
                        value : tenant information for the date used as "key"
                     2. updates the service's calendarObject with the updated tenantList object
        returns    : nothing
    */
        reservedTenantsList = {};
        for (let i=0; i<reservedData.length; i++){
            let reservedDate = getDateFromUnix(reservedData[i].time);
            reservedTenantsList[reservedDate] = reservedData[i];
        }

        self.calendarObject.reservedTenantsList['data'] = reservedTenantsList;
    }
    
    function httpFailure(reason){
        console.log(reason.data, reason.status + reason.statusText);
    }

    getTenants = async function(
                    from={"year":self.calendarObject.year,"month":self.calendarObject.month,"day":1},
                    to={"year":self.calendarObject.year,"month":self.calendarObject.month,"day":getDaysInCurrentMonth(self.calendarObject.year, self.calendarObject.month)},
                    url="http://localhost:3000"){
    /* 
        parameters : two objects for start/end date, url
        working    : 1. gets the tenant data for the given time period 
                        from the server using the url given
                     2. sends that date to the updateReservedTenantsList 
                        function to update calendarObject with the tenantList
                     3. alerts for errors if any
        returns    : Promise object is returned
    */
        let fromUnixTime = getUnixFromDateTime(from);
        let toUnixTime = getUnixFromDateTime(to);
        return $http.get(`${url}/reserve/${fromUnixTime}/${toUnixTime}`)
            .then(function(response){
                updateReservedTenantsList(response.data.reserved);
            },function(reason){
                httpFailure(reason);
            } );
    }

    this.addTenant = function(newTenantName, dateToReserve){
    /* 
        parameters : new tenant name and the new date to reserve
        working    : 1. creates url and json date to post to server
                     2. posts data to the server and updates the
                        tenant list for current month after this addition
                     3. alerts for errors if any
        returns    : Promise object is returned
    */
        let url = `http://localhost:3000/reserve/`;
        let tenantDataToPush = {
            "tennantName": newTenantName,
            "time": getUnixFromDateTime(dateToReserve),
            "reserved": true
        };
        return $http.post(url, tenantDataToPush).then(function (response){
                switch(response.status){
                    case 200:
                        getTenants();
                        break;
                }
            },function (reason){
                switch(reason.status){
                    case -1:
                        console.log("wrong url, please check it again");
                        break;
                    case 400:
                        console.log(reason.data);
                        break;
                }
            });
    }

    // alert("thisISAlert");

    this.removeTenant = function(tenantInfo){
    /* 
        parameters : json object contains tenant to remove 
        working    : 1. creates url and updates json object to post to server
                     2. posts data to the server and updates the
                        tenant list for current month after this removal
                     3. alerts for errors if any
        returns    : Promise object is returned
    */
        let url = `http://localhost:3000/reserve/`;
        tenantInfo["reserved"] = false;
        return $http.post(url, tenantInfo).then(function (response){
                switch(response.status){
                    case 200:
                        getTenants();
                        break;
                }
            },function (reason){
                switch(reason.status){
                    case -1:
                        console.log("wrong url, please check it again");
                        break;
                    case 400:
                        console.log(reason.data);
                        break;
                }
                console.log(reason)
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
