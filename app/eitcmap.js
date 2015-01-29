define(["map", "eitcdata", "jquery"], function (Map, eitcData, $) {
    "use strict";
    var eitc_map = new Map({
        data: eitcData[2012],
        dataIndex: 3,
        mapDivID: "map",
        hideDC: false,
        popupTemplate: function (data) {
            var str = "Number of Claims: " + this.utilities.commaSeparateNumber(data[0]) + "<br />";
            str += "Dollar Amount (in thousands): $" + this.utilities.commaSeparateNumber(data[1]) + "<br />";
            str += "Total Returns: " + this.utilities.commaSeparateNumber(data[2]) + "<br />";
            str += "Percent of Total Filers: " + Math.round(data[3] * 10000) / 100 + "%";
            return str;
        },
        popupStyle: {
            bgColor: "#dddddd"
        },
        //Below is an example of something you could do, though this map has no need for it
        /*stateClick: function (state) {
            console.log("you clicked on " + state);
        },*/
        colorConfig: {
            highColor : "#b9292f",
            zeroColor : "#ffffff",
            lowColor  : "#fff0d3",
            hoverColor:	"#f8c55b"
        },
        legendFormatter: function (t) {
            return Math.round(t * 10000) / 100 + "%";
        }
    });
    
    function switchYear(year) {
        $("#map .popup_container").fadeOut(100);
        eitc_map.data = eitcData[year];
        eitc_map.colors.calculateMinMax();
        eitc_map.colors.calcStateColors();
        eitc_map.colors.applyStateColors(100);
        eitc_map.legendMaker.setBounds(eitc_map.min, eitc_map.max);
        eitc_map.legendMaker.draw(eitc_map);
    }
    
    $("#yearPicker div").click(function () {
        $("#yearPicker div").removeClass("selected");
        var year = $(this).data("year");
        $(this).addClass("selected");
        switchYear(year);
    });
    
});