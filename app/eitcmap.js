define(["map", "eitcdata"], function (Map, eitcData) {
    "use strict";
    var eitc_map = new Map({
        data: eitcData[2012],
        dataIndex: 0,
        mapDivID: "map",
        hideDC: false
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