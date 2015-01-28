define(["map", "eitcdata"], function (Map, eitcData) {
    "use strict";
    var eitc_map = new Map({
        data: eitcData[2012],
        dataIndex: 3,
        mapDivID: "map",
        hideDC: false,
        popupTemplate: function (data) {
            var str = "Number of Claims: " + data[0] + "<br />";
            str += "Dollar Amount (in thousands): " + data[1] + "<br />";
            str += "Total Returns: " + data[2] + "<br />";
            str += "Percent of Total Filers: " + data[3];
            return str;
        }
    });
    
    eitc_map.drawPaths();
    
    eitc_map.colors = new eitc_map.colorUtils({
        highColor : "#b9292f",
        zeroColor : "#ffffff",
        lowColor  : "#fff0d3",
        hoverColor:	"#f8c55b"
    }, eitc_map);
    
    eitc_map.colors.calcStateColors();
    eitc_map.colors.applyStateColors();
    
    

});