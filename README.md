# Module: NOK Electricity Forecast

The `NOKelectricityForecast` ("Norwegian Electricity Prices Forecast") module offers a comprehensive view of hourly electricity prices in Norway for the forthcoming 48 hours. Through line and bar charts this module delivers electricity pricing, aiding users in optimizing their energy utilization patterns.

Example of LineChart config
{
    module: "NOKElectricityForecast",
    position: "bottom_bar", // Adjust the position as needed
    config: {
        updateInterval: 20000, // Update every 10 minutes (adjust as needed)
        chartType: "line",
        historicalData: 10, //Amount of earlier hours to show (0 is current hour)
        height: 150, //Height of the module
        width: 15, //width of the module, scales automatically to amount of bars
        primaryColor: "white", //D3.js color
        secondaryColor: "red", //D3.js color
        dynamicYAxis: true,
        lineThickness: 3,
        currentHourLineThickness: 3,
        currentHourLineLenght: 1,
        yAxisExtention: 0.0
    },
    header: "Strømpriser"
},

Example of BarChart config
{
    module: "NOKElectricityForecast",
    position: "bottom_bar", // Adjust the position as needed
    config: {
        updateInterval: 20000, // Update every 10 minutes (adjust as needed)
        historicalData: 3, //Amount of earlier hours to show (0 is current hour)
        height: 200, //Height of the module
        width: 15, //width of the module, scales automatically to amount of bars
        chartType: "bar",
        primaryColor: "white",
        secondaryColor: "yellow",
        dynamicYAxis: false,
        barOffset: 10, //Need to adjust this based on barwidth to center the bar
        barwidth: 10, // Width of the bars
    },
    header: "Strømpriser"
},

For configuration options, please check the [MagicMirror² documentation]
