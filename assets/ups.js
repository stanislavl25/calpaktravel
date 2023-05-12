window.ups = window.ups || {};

ups.transitTime = { 

  getUPSTransit: function(ele, callback){

    
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December", "January"
                       ];

    //const upsCodes = ['GRD','3DS','2DA','2DM','1DP','1DA','1DM']

    const CutoffTime = 13 
    
	const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    const yyyy = today.getFullYear();
    if(dd<10) {
      dd = '0'+dd
    } 
    if(mm<10) {
      mm = '0'+mm
    } 
    
    //console.log(yyyy.toString() + mm.toString() + dd.toString());
    const currentDate = yyyy.toString() + mm.toString() + dd.toString();
    
    // var values={ 
    //     shop:'saadbinnaeemch', //Leave this vairable 
    //     shipperStateProvinceCode:'CA', 
    //     shipperCountryCode:'US', 
    //     shipperPostalCode:'90220',

    //     recieverPostalCode:ele.zip, 
    //     recieverCountryCode: ele.country = 'United States' ? 'US' : ele.country, 
    //     recieverStateProvinceCode: ele.prov,

    //     //pickupDate:'20181224', 
    //     pickupDate: currentDate,
    //     shipmentWeight:'10' 
    // }; 
    const code = 'GND';

    // const formData = new FormData();
    // formData.append("shop", "saadbinnaeemch");
    // formData.append("shipperStateProvinceCode", "CA");
    // formData.append("shipperCountryCode", "US");
    // formData.append("shipperPostalCode", "90220");
    // formData.append("recieverPostalCode", ele.zip);
    // formData.append("recieverCountryCode", ele.country = 'United States' ? 'US' : ele.country);
    // formData.append("recieverStateProvinceCode", ele.prov);
    // formData.append("pickupDate", currentDate);
    // formData.append("shipmentWeight", "10");

    fetch('https://ups-eta.herokuapp.com/getEta', {
        method: 'POST',
        crossorigin: true,
        mode: 'cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `shop=saadbinnaeemch&shipmentWeight=10&pickupDate=${currentDate}&recieverStateProvinceCode=${ele.prov}&recieverPostalCode=${ele.zip}&shipperPostalCode=90220&recieverCountryCode=${(ele.country = 'United States' ? 'US' : ele.country)}&shipperCountryCode=US&shipperStateProvinceCode=CA`
        // body: `shop=saadbinnaeemch&shipmentWeight=10&pickupDate=${currentDate}&recieverStateProvinceCode=${ele.prov}&recieverCountryCode=${(ele.country = 'United States' ? 'US' : ele.country)}&recieverPostalCode=${ele.zip}&shipperPostalCode=90220&shipperCountryCode=US&shipperStateProvinceCode=CA`
    })
    .then(response => response.json())
    .then(dataJSON => {
        var completeAddress = dataJSON.TimeInTransitResponse ? true : false;

        if(completeAddress && dataJSON.TimeInTransitResponse.TransitResponse){
            var serviceItems = dataJSON.TimeInTransitResponse.TransitResponse.ServiceSummary;

            serviceItems.forEach(item => {
                var timeInTransit = item.EstimatedArrival.BusinessDaysInTransit ;
                var upsService = item.Service.Description; 
                var upsCode =  item.Service.Code; 
                if(upsCode == code){ 
                    calcTime(timeInTransit,upsService) 
                }
            });
        } else {
            var errorMessage = '';
            if(dataJSON.Fault) var errorCode = dataJSON.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Code;
            else var errorCode = 0;

            if(errorCode == 270005) {
                errorMessage = 'Zipcode invalid, please re-enter.';
            } else {
                errorMessage = 'Please re-enter a valid zipcode.';
            }
            
            setTimeout(function(){
                document.querySelector(ele.element).innerHTML = `<span class="result result--error">${errorMessage}</span>`;

                callback();
            }, 300);
        }
    }).then(callback); 

    function daysInMonth (month, year) { 
      var days = new Date(year, month, 0).getDate();
      return days
    }

    function dayOfWeek(month , year, day) {  
      var days = new Date(year, month - 1,day).getDay();
      return days
    }
     
    function month(month , year, day) {   
      return new Date(year,month -1,day)
    }

    function calcTime(upsDays, service) { 

      var upsDays =  parseInt(upsDays); 
      
      //Convert to GTM + 5 Timezone
      var d = new Date();  
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000); 
      var nd = new Date(utc + (3600000*-4)); 

      // Vars for setting min and max days and months
      var currentMonth =  d.getMonth() + 1
      var currentYear = d.getFullYear()
      var currentHour = nd.getHours()
      var getDaysInMonth = daysInMonth(currentMonth,currentYear); // 31 
      var currentDay = nd.getDay() 
      var currentDate = d.getDate()
  
      var minProcTime = 5;
      var maxProcTime = 8;
      
      var ca_time = new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
      ca_time = new Date(ca_time);
      if(ca_time.getHours() >= 12) {
        minProcTime++;
        maxProcTime++;
      }
  
      function getTransit(fullFillmentDays){ 
        
      // get total time needed for delviery and fullfilment 
      // and return the estimated delievery date
        
        var shipsOutOnDay = currentDay + fullFillmentDays  
        var shipDate = currentDate + fullFillmentDays  
        
        //See if fullfillment days fall on a weekend 
        //If so, push it to the first availble monday
        if( (shipsOutOnDay - 5) > 0){  
          shipsOutOnDay = shipsOutOnDay + 2
          shipDate = shipDate + 2
        }

//         console.log('UPS ETA - ('+fullFillmentDays+' days FF) processes on:',month(currentMonth, currentYear,shipDate) ) 
        
        //Adjust new day of week
        shipsOutOnDay = dayOfWeek(currentMonth , currentYear, shipDate)
 
        //Check to see if we are shipping over the weekend. 
		//If so, add two days
        if( (shipsOutOnDay + upsDays) -5 > 0){  
          shipDate =  upsDays + 2 + shipDate 
		  console.log('first: ',shipDate)
        }else {   
          shipDate = upsDays + shipDate 
		  console.log('first ',shipDate)
        }  
		
		//Check to see if the date is over the month divide
		//If so, update the day to the new month
		if(shipDate > getDaysInMonth ){ 
		  console.log(shipDate," : ",getDaysInMonth)
          shipDate = shipDate - getDaysInMonth
		  console.log('second adjusted ',shipDate)
        }
        else { 
          console.log('not adjusted ',shipDate)
        } 
		return shipDate
      }  

      function getMonth(estDays){		  
        if (estDays < currentDate) {
		  return monthNames[currentMonth]
		}
		else if(estDays > getDaysInMonth ){ 
          estDays = estDays - getDaysInMonth  
          return monthNames[currentMonth]
        }
        else { 
          return monthNames[currentMonth -1 ]
        } 
      } 

      //Store the min and max deilvery dates
      var estimatedDayMin = getTransit(minProcTime)
      if(minProcTime != maxProcTime)
      var estimatedDayMax = getTransit(maxProcTime)
      else var estimatedDayMax = false;
      var minMonth = getMonth(estimatedDayMin)
      if(estimatedDayMax)
      var maxMonth = getMonth(estimatedDayMax)

      var minDayOfWeek = dayOfWeek(monthNames.indexOf(minMonth) , currentYear, estimatedDayMin);
      var maxDayOfWeek = dayOfWeek(maxMonth , currentYear, estimatedDayMax);

//       if(minDayOfWeek == 6){
//         estimatedDayMin = estimatedDayMin + 2
//       }

//       if(minDayOfWeek == 0){
//         estimatedDayMin = estimatedDayMin + 1
//       }

//       if(estimatedDayMax && maxDayOfWeek == 6){
//         estimatedDayMax = estimatedDayMax + 2
//       }

//       if(estimatedDayMax && maxDayOfWeek == 0){
//         estimatedDayMax = estimatedDayMax + 1
//       }
      var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//       console.log('UPS ETA - '+minMonth + ' '+ estimatedDayMin +' - '+ maxMonth + ' '+estimatedDayMax + ', Service: ' + service + ' ' + upsDays +' days')

      var wday = new Date(currentYear, monthNames.indexOf(minMonth), estimatedDayMin).getDay();
      
      var addMonogram = '';

      if(estimatedDayMax !== false)
      var message = 'Get it by <strong>'+minMonth + ' '+ estimatedDayMin +' - '+ maxMonth + ' '+estimatedDayMax+'</strong> with Ground Shipping!<div class="disclaimer">'+addMonogram+'<strong>Please note:</strong> Delivery date is approximate.</div>';
      else var message = 'Get it by <strong>'+daysOfWeek[wday]+', '+minMonth + ' '+ estimatedDayMin +'</strong> with Ground Shipping!<div class="disclaimer">'+addMonogram+'<strong>Please note:</strong> Delivery date is approximate.</div>';
        
      setTimeout(function(){

          document.querySelector(ele.element).innerHTML = `<span class="result">${message}</span>`;
        
        callback();
      }, 300);
      
    }
  }

};