const NodeHelper = require("node_helper");
const axios = require("axios");

const BASE_URL = "https://www.hvakosterstrommen.no/api/v1/prices/";

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-NOKElectricityForecast helper started...");
    this.currentDayData = [];
    this.nextDayData = [];
    this.priceArea = "NO1";
  },

  socketNotificationReceived: function (notification, payload) {
    console.log("Helper received notification:", notification);
    if (notification === "GET_JSON_DATA") {
      this.priceArea = payload.priceArea || this.priceArea;
      this.getData(this.buildUrl(0)); // Fetch data for the current day, in the configured price area
    }
  },

  buildUrl: function (daysToAdd) {
    return BASE_URL + getFormattedDate(daysToAdd) + "_" + this.priceArea + ".json";
  },

  getData: function (url, isNextDay = false) {
    console.log("Fetching data from:", url);
    axios
      .get(url)
      .then((response) => {
        var currentHour = new Date().getHours();
        //console.log("Data fetched successfully:", response.data);
        if (currentHour < 14 && !isNextDay) {
          this.currentDayData = response.data;
          this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData);
          return;
        }
        if (this.isCurrentDay(response.data) && !isNextDay) {
          this.currentDayData = response.data;
          this.getData(this.buildUrl(1), true);
          return;
        }
        if (this.isNextDayData(response.data) && isNextDay) {
          this.nextDayData = response.data;
        }
        //console.log("Data fetched successfully:", response.data);
        this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData.concat(this.nextDayData));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // If the error is for the next day's data, just send the current day's data
        if (isNextDay) {
          this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData);
        }
      });
  },
  isCurrentDay: function (data) {
    // Compare the dates (ignoring time) to determine if it's for the current day
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