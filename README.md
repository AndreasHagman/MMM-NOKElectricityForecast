# Module: NOK Electricity Forecast

The `NOKelectricityForecast` ("Norwegian Electricity Prices Forecast") module offers a comprehensive view of hourly electricity prices in Norway for the forthcoming 48 hours. Through line and bar charts this module delivers electricity pricing, aiding users in optimizing their energy utilization patterns.

Add the departure board to your configuration file, for instance:

```js
//Line Chart Example:
{
    module: "NOKElectricityForecast",
    position: "bottom_bar", // Adjust the position as needed
    header: "Electricity Prices",
    config: {
        updateInterval: 30000, // Update every 10 minutes (adjust as needed)
        chartType: "line",
        historicalData: 3, //Amount of earlier hours to show (0 is current hour)
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
},

//Bar Chart Example:
{
    module: "NOKElectricityForecast",
    position: "bottom_bar", // Adjust the position as needed
    header: "Electricity Prices",
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
},
```

## Configuration

Configuration options are as follows:


| Option | Description | Default value |
|-------------|--------------------------------------------------|---------------|
| chartType | String. Can choose between bar and Line | "line" |
| historicalData | Integer. Amount of previous hours to show | 2 |
| height | Integer. Height of the module. | 5 |
| width | Integer.  Witdh of the module. Total width is calculated based on current amount of hours showing, so this is not the final width | 15 |
| primaryColor | String. D3.js color. Color of the line or the bars | "white" |
| secondaryColor | String. D3.js color. Color of the current hour marker | "yellow" |
| dynamicYAxis | Boolean. If you want the values on the Y-axis to be calculated dynamically based on the contents of the chart, if set to false minimum value will be 0, and maximum value will be calculated based on content | "true" |
| yAxisExtention | Decimal. Values between 0.0 and 0.9. Will increase y-axis values by chosen amount | 0.0
| barOffset | Integer.  Seconds between board refresh | 10 |
| barwidth | Integer. Show the transport mode as an icon. | 10 |
| lineThickness | Integer | 3 |
| currentHourLineThickness | Integer | 3 |
| currentHourLineLenght | Integer | 0 |

