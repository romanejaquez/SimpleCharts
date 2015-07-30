// Author: Roman Jaquez
// Copyright 2015 - drcoderz.com
// Simple Charts: a collection of simple charts using HTML5, Javascript and CSS

// main namespace
var SimpleCharts = SimpleCharts || {};

// Donut Chart
SimpleCharts.DonutChart = function() {

	var self = this;
	var chartSettings;
	
	// defaults
	var DEFAULT_RADIUS = 70;
	var DEFAULT_SIZE = 200;
	var DEFAULT_NUM_SIZE = 30;
	var DEFAULT_LABEL_SIZE = 15;
	var DEFAULT_VALUE = 0;
	var DEFAULT_MAX_VALUE = 100;
	var DEFAULT_SPEED_TIMEOUT = 10; // milliseconds
	var DEFAULT_LINE_WIDTH = 30;
	var DEFAULT_FOREGROUND_COLOR = "#69b751";
	var DEFAULT_BACKGROUND_COLOR = "#e7e7e7";
	
	// variables global to this javascript control
	var context;
	var canvas;
	var centerX;
	var centerY;
	var radius;
	var chartValueLabel;
	var chartBottomLabel;
	var animatedValue;
    var chartcontent;
	
	// initializes the donut chart with provided settings
	self.createSingleValueDonutChart = function(settings) {
	
		chartSettings = settings;
		chartcontent = document.getElementById(settings.id);
		
		setupDefaults(settings);
		
		chartcontent.innerHTML = '<canvas class="inner-Canvas" width="' + settings.size + '" height="' + settings.size + '"></canvas><div class="canvasContent" style="margin: 0px auto; width: 70px; height: 80px; position: absolute; top: 50%; left: 50%; margin-top: -40px; margin-left: -35px;"><div class="chart-num" style="text-align: center; color: gray; margin-top: 15px;"><span class="chart-num-label"></span><span class="chart-pct">%</span></div><div class="chart-label" style="text-align: center; color: gray;"></div></div>';
		
		chartcontent.style.position = "relative";
		chartcontent.style.width = settings.size + "px";
		chartcontent.style.height = settings.size + "px";
		
		var lineColor = settings.lineForegroundColor;
		
		var chartValue = settings.value;
		chartValueLabel = chartcontent.getElementsByClassName("chart-num-label")[0];
		chartValueLabel.style.fontSize = settings.numberFontSize + "px";
		
		var chartPctLabel = chartcontent.getElementsByClassName("chart-pct")[0];
		chartPctLabel.style.display = settings.showPercent && settings.showPercent == true ? "inline-block" : "none";
		
		chartBottomLabel = chartcontent.getElementsByClassName("chart-label")[0];
		chartBottomLabel.textContent = settings.label;
		chartBottomLabel.style.fontSize = settings.labelFontSize + "px";
		
		setupCanvas();

		// sets the chart line based on initial values and defaults
		setupDonutChart();
	};
    
    function setupCanvas() {
        canvas = chartcontent.getElementsByClassName("inner-Canvas")[0];
		context = canvas.getContext("2d");
		centerX = canvas.width / 2;
		centerY = canvas.height / 2;
		radius = chartSettings.radius;   
    }
    
    self.createMultiValueDonutChart = function(settings) {
        
        chartSettings = settings;
		chartcontent = document.getElementById(settings.id);
        
        setupDefaults(settings);
        
        chartcontent.innerHTML = '<canvas class="inner-Canvas" width="' + 
            settings.size + '" height="' + settings.size + '"></canvas>';
        
        setupCanvas();
        
        clearChart();
		createChartBackground();
        
        // get a copy of the original array of values
        var chartValues = settings.values;
        
        // sort them first in ascending order
        chartValues.sort(function(firstValue, secondValue) {
            return firstValue.value + secondValue.value; 
        });
        
        // every subsequent value will contain the previous one, 
        // so they show in a stacked fashion
        var currentValue = 0;
        var previousValue = 0;
        for(var i = 0; i < chartValues.length; i++) {
            currentValue = chartValues[i];
            previousValue += currentValue.value;
            currentValue.value = previousValue;
        }
        
        // re-sort them again
        chartValues.sort(function(firstValue, secondValue) {
            return firstValue.value + secondValue.value; 
        });

        // now, render the corresponding
        for(var i = 0; i < chartValues.length; i++) {
            var cValue = chartValues[i];
            chartSettings.lineForegroundColor = cValue.lineForegroundColor;
            createChartForeground(cValue.value);
        }
    };
    
    function setupDefaults(settings) {
        // establish some defaults
		settings.size = settings.size || DEFAULT_SIZE;
		settings.radius = settings.radius || DEFAULT_RADIUS;
		settings.numberFontSize = settings.numberFontSize || DEFAULT_NUM_SIZE;
		settings.labelFontSize = settings.labelFontSize || DEFAULT_LABEL_SIZE;
		settings.value = settings.value || DEFAULT_MAX_VALUE;
		settings.maxValue = settings.maxValue || DEFAULT_MAX_VALUE;
		settings.label = settings.label || "Chart";
		settings.lineWidth = settings.lineWidth || DEFAULT_LINE_WIDTH;
		settings.lineForegroundColor = settings.lineForegroundColor || DEFAULT_FOREGROUND_COLOR;
		settings.lineBackgroundColor = settings.lineBackgroundColor || DEFAULT_BACKGROUND_COLOR;
		settings.showPercent = settings.showPercent || true;
		settings.showInitialValueAnimated = settings.showInitialValueAnimated || true;   
    }
	
	// sets the initial chart line
	function setupDonutChart() {
	
		if (context) {
			self.updateDonutChart(chartSettings.value);
		}
	}
	
	// clears the chart for re-rendering purposes
	function clearChart() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	// creates the background portion of the chart
	function createChartBackground() {
		
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		context.lineWidth = chartSettings.lineWidth;
		context.strokeStyle = chartSettings.lineBackgroundColor;
		context.stroke();
	}
	
	// inner function that creates the chart's foreground ring
	// value: the value to be updated to
	function createChartForeground(value) {
		var minVal = 2 * (value)/(chartSettings.maxValue);
		minVal = value == chartSettings.maxValue ? DEFAULT_VALUE : minVal;
		var angle = (minVal) * Math.PI;
		context.beginPath();
		context.arc(centerX, centerY, radius, angle, (2 * Math.PI),true);
		context.lineWidth = chartSettings.lineWidth;
		context.strokeStyle = chartSettings.lineForegroundColor;
		context.stroke();
	}
	
	// creates the donut chart with a single value
	function createDonutChart(value) {
		clearChart();
		createChartBackground();
		createChartForeground(value);
	}
	
	// updates the chart to the value provided
	self.updateDonutChart = function(value) {
	
		if (context) {
			
			if (chartSettings.showInitialValueAnimated && chartSettings.showInitialValueAnimated == true) {
				self.updateDonutChartAnimated(value);
			}
			else {
				createDonutChart(value);
				self.updateChartValueLabel(value);
			}
		}
	};
	
	// updates the number value on the chart
	// value: the value to update the chart to
	self.updateChartValueLabel = function(value) {
		chartValueLabel.textContent = value;
	};
	
	// updates the number value on the chart
	// value: the value to update the chart to
	self.updateChartBottomLabel = function(value) {
		chartBottomLabel.textContent = value;
	};
	
	// performs the update of the chart in an animated fashion
	// value: the value to update the chart to
	self.updateDonutChartAnimated = function(value) { 
		
		animatedValue = value;
		self.updateChartValueLabel(value);
		
		// let's start at 1
		var chartValue = 1;
		
		// render the initial value
		createDonutChart(value);
		
		// then any subsequent one
		setChartValueAnimated(chartValue);
	};
	
	// call this method recursively in order to perform an animated rendering of the chart's line
	function setChartValueAnimated(chartValue) {
	
		if(chartValue <= animatedValue) {
			
			// render the value on a timeout
			setTimeout(function() {
				createDonutChart(chartValue);
				
				// increase the value and call the method recursively
				chartValue++;
				setChartValueAnimated(chartValue);
			}, DEFAULT_SPEED_TIMEOUT);
		}
	}
};
