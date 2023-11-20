const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-NOKElectricityForecast helper started...");
    currentDayData = [];
    nextDayData = [];
  },

  socketNotificationReceived: function (notification, payload) {
    console.log("Helper received notification:", notification);
    if (notification === "GET_JSON_DATA") {
        this.getData("https://www.hvakosterstrommen.no/api/v1/prices/" + getFormattedDate() + "_NO1.json"); // Fetch data for the current day
    }
  },
  
  getData: function (url) {
    console.log("Fetching data from:", url);
    axios
      .get(url)
      .then((response) => {
        var currentHour = new Date().getHours();
        console.log("Data fetched successfully:", response.data);
        if (currentHour < 14) {
          this.currentDayData = response.data;
          this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData);
          return;
        }
        if(this.isCurrentDay(response.data)){
          this.currentDayData = response.data;
          this.getData("https://www.hvakosterstrommen.no/api/v1/prices/" + getFormattedDate(1) + "_NO1.json");
          return;
        }
        if(this.isNextDayData(response.data)){
          this.nextDayData = response.data;
        }
      console.log("Data fetched successfully:", response.data);
      this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData.concat(this.nextDayData));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  },
  isCurrentDay: function (data) {
		// Compare the dates (ignoring time) to determine if it's for the next day
	  return new Date(data[1].time_start).getDate() === new Date().getDate();
	  },
  isNextDayData: function (data) {
    // Compare the dates (ignoring time) to determine if it's for the next day
    return new Date(data[1].time_start).getDate() === new Date().getDate() + 1;
    },
});
 // Add this function to your MMM-JSONDisplay.js file
 function getFormattedDate(daysToAdd = 0) {
  const today = new Date();
  today.setDate(today.getDate() + daysToAdd);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}/${month}-${day}`;
}