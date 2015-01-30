/*Code specific to this map*/

define(["map", "eitcdata", "jquery", "stateNames"], function (Map, eitcData, $, stateNames) {
    "use strict";
    
    /*I'm making an empty object rather than just starting with the map object because I also
    need to keep track of the year outside of the core map module functionality*/

    var eitc_map = {};
    eitc_map.year = 2012;
    
    /*Function to switch the dataset year and redraw the map*/
    function switchYear(year) {
        
        //short reference to map object
        var m = eitc_map.map;
        
        //get rid of any visible popups
        $("#map .popup_container").fadeOut(100, function () {
            $(this).remove();
        });
        
        //assign the new data to the map
        m.data = eitcData[year];
        
        //recalculate the max and min based on the new dataset
        m.colors.calculateMinMax();
        
        //recalculate the map colors based on new data and new max/min
        m.colors.calcStateColors();
        
        //redraw the map (animate over 100 ms)
        m.colors.applyStateColors(100);
        
        //redraw the legend
        m.legendMaker.setBounds(m.min, m.max);
        m.legendMaker.draw(m);
        
        //store the new year in the base object
        eitc_map.year = year;
    }
    
    /*Runs when the user clicks on the year picker*/
    $("#yearPicker div").click(function () {
        
        //unselect all the year clickers
        $("#yearPicker div").removeClass("selected");
        
        //get the year from the clicked div
        var year = $(this).data("year");
        
        //select it
        $(this).addClass("selected");
        
        //run the year switcher function above
        switchYear(year);
    });
    
    /*Make the actual map object - all of the possible configuration options are used here
    except for the stateClick callback*/
    eitc_map.map = new Map({
        
        /*Assign data to the map*/
        data: eitcData[eitc_map.year],
        
        /*Each data point is an array (so that the popup can show more info than the colors) -
        this tells the map which quantity to use for the color scheme*/
        dataIndex: 3,
        
        /*Tell the object which div to paint the map inside*/
        mapDivID: "map",
        
        /*Not even sure if this works yet when true, but it will*/
        hideDC: false,
        
        /*Template for popup box. Function must return an HTML string*/
        popupTemplate: function (data, state) {
            function formatNumber(n) {
                var m = eitc_map.map;
                if (n >= 1000000) {
                    return m.utilities.commaSeparateNumber(Math.round(n / 10000) / 100) + " billion";
                } else {
                    return m.utilities.commaSeparateNumber(Math.round(n / 100) / 10) + " million";
                }
            }
            
            if (isNaN(data[0])) {
                return "No data";
            }
            var str = "<h4>" + stateNames[state] + ", " + eitc_map.year + "</h4>";
            str += "<p>Number of Claims: " + this.utilities.commaSeparateNumber(data[0]) + "<br />";
            str += "Dollar Amount: $" + formatNumber(data[1]) + "<br />";
            str += "Total Returns: " + this.utilities.commaSeparateNumber(data[2]) + "<br />";
            str += "Percent of Total Filers: " + Math.round(data[3] * 10000) / 100 + "%</p>";
            return str;
        },
        
        /*Background color for popup*/
        popupStyle: {
            bgColor: "#dddddd"
            /*These options are also available though not used here*/
            /*padding: 10,
            fontSize: 28*/
        },
        
        /*Configure colors for map*/
        colorConfig: {
            highColor  : "#117b3c", //max of dataset
            lowColor   : "#fff0d3", //min of dataset
            hoverColor : "#f8c55b", //color when hovering over a state
            noDataColor: "#aaaaaa", //color for null or NaN data
            
            /*if dataset goes from negative to positive, it uses a three color gradient with
            the middle color at zero*/
            zeroColor  : "#ffffff"
        },
        
        /*Function to format the legend labels*/
        legendFormatter: function (t) {
            return Math.round(t * 10000) / 100 + "%";
        }
        
        /*Below is an example of how to define a state click callback, 
        though this particular map has no need for it*/
        /*stateClick: function (state) {
            console.log("you clicked on " + state);
        },*/
    });
    
    
    
});