
calendarApp.service("mainService", ["$http", function($http){
    
    let count = 0;
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let dt = new Date();
    let day = dt.getDate();
    let month = dt.getMonth();
    let year = dt.getFullYear();
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
                    reserved:         false,
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

    this.goToNextMonth = function(){
        count++;
        let temp = getNextMonth(this.calendarObject.month, this.calendarObject.year);
        console.log(temp);
        this.calendarObject.month = temp[0];
        this.calendarObject.year = temp[1];
        this.calendarObject.dateObject = getDateObject(this.calendarObject.year, this.calendarObject.month, 1);
        this.calendarObject.monthName = months[this.calendarObject.month];
    }

    this.goToPrevMonth = function(){
        count++;
        let temp = getPrevMonth(this.calendarObject.month, this.calendarObject.year);
        console.log(temp);
        this.calendarObject.month = temp[0];
        this.calendarObject.year = temp[1];
        this.calendarObject.dateObject = getDateObject(this.calendarObject.year, this.calendarObject.month, 1);
        this.calendarObject.monthName = months[this.calendarObject.month];
    }

        
    this.calendarObject = {
        weekdays,
        dateObject: getDateObject(year, month, day),
        month,
        monthName: months[month],
        year
    }

}]);
