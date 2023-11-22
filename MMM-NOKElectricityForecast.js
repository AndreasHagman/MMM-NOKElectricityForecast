/* MagicMirror²
 * Module: MMM-NOKElectricityForecast
 *
 * By Andreas Hagman
 */
Module.register("MMM-NOKElectricityForecast", {
	defaults: {
	  updateInterval: 60000,
	  url: "https://www.hvakosterstrommen.no/api/v1/prices/" + this.getFormattedDate() + "_NO1.json",
	  historicalData: 2,
	  chartType: "line",
	  height: 150,
	  width : 15,
	  primaryColor: "white",
	  secondaryColor: "yellow",
	  dynamicYAxis: true,
	  barOffset: 10,
	  barwidth: 10,
	  lineThickness: 3,
	  currentHourLineThickness: 3,
	  currentHourLineLenght: 0,
	  yAxisExtention: 0.0
	},
  
	start: function () {
	  Log.info("Starting module: " + this.name);
	  this.getData();
	  //this.scheduleUpdate();
	},
	getData: function (url = this.config.url) {
		//Log.info("Getting data from: " + url);
		this.sendSocketNotification("GET_JSON_DATA", { url: url });
	  },

	// Define required scripts.
	getStyles: function () {
		return ["NOKElectricityForecast.css"];
	},

	// Define required scripts.
	getScripts: function () {
		return ["d3.min.js"];
	},
  
	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
		  var currentHour = new Date().getHours();
		  if (currentHour < 14) {
			self.getData(self.config.url); // Fetch data for the current day
		  } else {
			// Fetch data for the current day
			self.getData(self.config.url);
	  
			// Fetch data for the next day
			var tomorrowDate = new Date();
			tomorrowDate.setDate(tomorrowDate.getDate() + 1);
			var formattedNextDate = getFormattedDate(1);
			var nextDayUrl = "https://www.hvakosterstrommen.no/api/v1/prices/" + formattedNextDate + "_NO1.json";
			self.getData(nextDayUrl);
		  }
		}, this.config.updateInterval);
	  },
  
	socketNotificationReceived: function (notification, payload) {
	//console.log("Received notification:", notification);
	//console.log("Data is: " + payload.length);
	  if (notification === "JSON_DATA_RESULT") {
		//Log.info("Received JSON data:", payload.length);
		this.processData(payload);
	  }
	},
	isNextDayData: function (data) {
		// Compare the dates (ignoring time) to determine if it's for the next day
	  return new Date(data[1].time_start).getDate() === new Date().getDate() + 1;
	  },
  
	processData: function (data) {
	  //Log.info("Processing data:", data);
	  this.jsonData = data;
	  this.updateDom();
	},
  
	getDom: function () {
		var wrapper = document.createElement("div");
	  
		if (this.jsonData && this.jsonData.length > 0) {
		  // Create an SVG element for the chart
		  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		  svg.setAttribute("class", "chart-svg");
		  wrapper.appendChild(svg);
	  
		  // Create a chart using D3.js
		  if(this.config.chartType == "bar"){
			this.createBarChartD3(svg);
		  }
		  if(this.config.chartType == "line"){
			this.createLineChartD3(svg);
		  }
		} else {
		  //console.log("JSONDATA " + this.jsonData);
		  wrapper.innerHTML = "Loading ...";
		}
	  
		return wrapper;
	  },
	  createBarChartD3: function (svg) {
		// Sample data
		var data = this.jsonData.map((entry) => ({
		  datetime: new Date(entry.time_start), // Store both date and time in datetime field
		  price: entry.NOK_per_kWh*=1.25
		}));

		// Filter data for entries. 2 hours  historical is default
		var filterHours = new Date();
		filterHours.setHours(filterHours.getHours() - this.config.historicalData-1);
		data = data.filter((entry) => entry.datetime > filterHours);


		// Assuming 'data' is the array you are working with for the bar chart
		var lastEntry = data[data.length - 1]; // Get the last entry from the data array
	
		var tomorrow = new Date(lastEntry.datetime); // Get the time from the last entry
		tomorrow.setDate(tomorrow.getDate() + 1); // Get the date for the next day
		tomorrow.setHours(0, 0, 0, 0); // Set the time to 00:00 for the next day

	  
		console.log("Creating barchart with data: " + data.length);
		// Set up chart dimensions
		// Calculate the width based on the number of data entries
		var margin = { top: 20, right: 20, bottom: 30, left: 40 };
		var width = data.length * this.config.width
		var height = this.config.height - margin.top - margin.bottom;
	  
		// Create SVG element
		var d3Svg = d3.select(svg)
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	  
		// Set up x and y scales
		var x = d3.scaleBand()
		  .domain(data.map(d => d.datetime)) // Use datetime as x-axis domain
		  .range([0, width]);

		  // Extend the x-axis domain to include the new datetime value
			var xDomain = x.domain();
			xDomain.push(tomorrow);

			// Update the x-axis scale with the extended domain
			x.domain(xDomain);
	  
		var y = d3.scaleLinear()
		  .domain([this.config.dynamicYAxis ? d3.min(data, (d) => d.price) - this.config.yAxisExtention : 0, d3.max(data, (d) => d.price) + this.config.yAxisExtention]) //Sets the height (top value) of the y-axis
		  .nice() // This adjusts the y-axis to "nice" values, ensuring clarity in the chart
		  .range([height, 0]);
	  
		// Draw bars
		d3Svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", (d) => x(d.datetime) + this.config.barOffset)
		.attr("y", (d) => y(d.price)) // Set y-coordinate of bars
		.attr("width", this.config.barwidth)
		.attr("height", (d) => height - y(d.price))
		.attr("fill", (d) => {
		const currentDate = new Date();
		const currentHour = currentDate.getHours();
		return (d.datetime.getDate() === currentDate.getDate() && d.datetime.getHours() === currentHour) ? this.config.secondaryColor : this.config.primaryColor;
		});
	  
		// Add x-axis
		d3Svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H")))// Format ticks to show only hours
	
		// Add y-axis
		d3Svg.append("g")
		  .call(d3.axisLeft(y));
	  },
	  createLineChartD3: function(svg) {
		// Sample data (assuming data has 'time_start' and 'NOK_per_kWh' fields)
		var data = this.jsonData.map((entry) => ({
		  datetime: new Date(entry.time_start), // Store time_start as datetime field
		  price: entry.NOK_per_kWh*=1.25 // Use NOK_per_kWh as the y-value
		}));

		// Filter data for entries. 2 hours  historical is default
		var filterHours = new Date();
		filterHours.setHours(filterHours.getHours() - this.config.historicalData-1);
		data = data.filter((entry) => entry.datetime > filterHours);

		// Assuming 'data' is the array you are working with for the line chart
		var lastEntry = data[data.length - 1]; // Get the last entry from the data array

		if (lastEntry) {
			var tomorrow = new Date(lastEntry.datetime); // Get the time from the last entry
			tomorrow.setDate(tomorrow.getDate() + 1); // Get the date for the next day
			tomorrow.setHours(0, 0, 0, 0); // Set the time to 00:00 for the next day

		// Create a new entry object
		var newEntry = {
			datetime: tomorrow,
			price: lastEntry.price, // Set the price to be the same as the last entry
		};

		// Add the new entry to the data array
		data.push(newEntry);
		}

	  
		var margin = { top: 20, right: 20, bottom: 30, left: 40 };
		var width = data.length * this.config.width;
		var height = this.config.height;
	  
		// Create x and y scales
		var x = d3.scaleTime()
		  .domain(d3.extent(data, (d) => d.datetime)) // Use time range for x-axis
		  .range([0, width]);
	  
		var y = d3.scaleLinear()
		  .domain([this.config.dynamicYAxis ? d3.min(data, (d) => d.price) - this.config.yAxisExtention : 0, d3.max(data, (d) => d.price) + this.config.yAxisExtention]) // Use NOK_per_kWh range for y-axis
		  .nice()
		  .range([height, 0]);
	  
		// Create a line function using D3's line generator
		var line = d3.line()
		  .x((d) => x(d.datetime)) // x-coordinate of the line
		  .y((d) => y(d.price)) // y-coordinate of the line
		  .curve(d3.curveStepAfter);
	  
		// Create SVG element
		var d3Svg = d3.select(svg)
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Append a path element to the SVG for the line
		d3Svg.append("path")
		  .datum(data)
		  .attr("fill", "none")
		  .attr("stroke", this.config.primaryColor)
		  .attr("stroke-width", this.config.lineThickness)
		  .attr("d", line);

		// Find data point for the current hour
		var currentDate = new Date();
		var currentHourData = data.find(d => d.datetime.getHours() === currentDate.getHours());

		// Draw a line for the current hour
		// Draw a line for the current hour
		var xCurrentHour = x(currentHourData.datetime);
		var yCurrentHour = y(currentHourData.price);
		d3Svg.append("line")
			.attr("x1", xCurrentHour - this.config.currentHourLineLenght) // x-coordinate of the start point (slightly left of the data point)
			.attr("y1", yCurrentHour) // y-coordinate of the start point (same as data point)
			.attr("x2", xCurrentHour + this.config.width + this.config.currentHourLineLenght) // x-coordinate of the end point (slightly right of the data point)
			.attr("y2", yCurrentHour) // y-coordinate of the end point (same as data point)
			.attr("stroke", this.config.secondaryColor) // Color of the line
			.attr("stroke-width", this.config.currentHourLineThickness); // Width of the line

	  
		// Add x-axis
		d3Svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .ticks(data.length)
            .tickFormat(d3.timeFormat("%H"))); // Format ticks to show only hours

		// Add y-axis
		d3Svg.append("g")
		  .call(d3.axisLeft(y));
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

