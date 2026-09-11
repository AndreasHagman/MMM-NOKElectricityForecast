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
			this.refreshData();
		}
	},

	buildUrl: function (daysToAdd) {
		return BASE_URL + getFormattedDate(daysToAdd) + "_" + this.priceArea + ".json";
	},

	// Spot prices for a given day are published once and don't change afterwards, so there's no
	// need to hit the API again every time the frontend asks for an update - only fetch what we
	// don't already have cached. This is what keeps polling cheap regardless of updateInterval.
	refreshData: function () {
		var haveCurrentDay = this.currentDayData.length > 0 && this.isCurrentDay(this.currentDayData);
		if (!haveCurrentDay) {
			this.getData(this.buildUrl(0));
			return;
		}

		var currentHour = new Date().getHours();
		var haveNextDay = this.nextDayData.length > 0 && this.isNextDayData(this.nextDayData);
		if (currentHour >= 14 && !haveNextDay) {
			this.getData(this.buildUrl(1), true);
			return;
		}

		// Nothing new needs fetching - resend what we have so the frontend can still refresh
		// (e.g. move the "current hour" marker) without triggering another HTTP request.
		this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData.concat(this.nextDayData));
	},

	getData: function (url, isNextDay = false) {
		console.log("Fetching data from:", url);
		axios
			.get(url)
			.then((response) => {
				if (!isNextDay) {
					this.currentDayData = response.data;
					this.nextDayData = []; // the day rolled over, forget any stale "tomorrow" cache
					this.sendSocketNotification("JSON_DATA_RESULT", this.currentDayData);
					// Tomorrow's prices are usually published in the early afternoon; try for them too.
					if (new Date().getHours() >= 14) {
						this.refreshData();
					}
					return;
				}
				if (this.isNextDayData(response.data)) {
					this.nextDayData = response.data;
				}
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
	}
});

// Add this function to your MMM-JSONDisplay.js file
function getFormattedDate(daysToAdd = 0) {
	const today = new Date();
	today.setDate(today.getDate() + daysToAdd);

	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}/${month}-${day}`;
}
