define(["jquery", "raphael", "uspaths", "mapcolors"], function ($, Raphael, paths, mapColors) {
    "use strict";
    var map = function (ops) {
        var w = $("#" + ops.mapDivID).width(),
            h = $("#" + ops.mapDivID).height(),
            m = this;
                
        m.colorUtils = mapColors;
        console.log(ops);
        m.data = ops.data;
        m.dataIndex = ops.dataIndex;
        m.paper = new Raphael(ops.mapDivID, w, h);
        m.paper.setViewBox(0, 0, 940, 627, true);
        
        this.utilities = {
            pathCenter: function (p) {
                var box, x, y;
                box = p.getBBox();
                x = Math.floor(box.x + box.width / 2.0);
                y = Math.floor(box.y + box.height / 2.0);
                return [x, y];
            },
            //Thanks http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
            commaSeparateNumber: function (val) {
                while (/(\d+)(\d{3})/.test(val.toString())) {
                    val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
                }
                return val;
            },
            getTextCoords: function (state) {
				var coords = m.utilities.pathCenter(m.stateObjs[state]),
                    text_configs = paths.text;
				if (text_configs.offset[state]) {
					coords[0] += text_configs.offset[state][0];
					coords[1] += text_configs.offset[state][1];
				}
				if (text_configs.absOffset[state]) {
					coords[0] = text_configs.absOffset[state][0];
					coords[1] = text_configs.absOffset[state][1];
				}
				return coords;
			}
        };
            
        this.drawPaths = function () {
            
            var us_paths = paths.states, state;
            
            function makeState(state) {
                var pathString = us_paths[state].path;
				
                if (typeof (m.stateObjs) === "undefined") {m.stateObjs = {}; }
                
				m.stateObjs[state] = m.paper.path(pathString);
				m.stateObjs[state].attr({
					cursor: "pointer",
					fill: "#999",
					"stroke-width": 0.5
				});
				
				//store raphael IDs of each state
                if (typeof (m.stateIDs) === "undefined") {m.stateIDs = {}; }
				m.stateIDs[state] = m.stateObjs[state].node.raphaelid;
                
				//and for reverse lookup
                if (typeof (m.stateCodes) === "undefined") {m.stateCodes = {}; }
				m.stateCodes[m.stateObjs[state].node.raphaelid] = state;
            }
            
            function makeText(state) {
				var coords = m.utilities.getTextCoords(state);
                if (typeof (m.stateLabelObjs === "undefined")) {m.stateLabelObjs = {}; }
                 
				m.stateLabelObjs[state] = m.paper.text(coords[0], coords[1], state);
				m.stateLabelObjs[state].attr({
					"font-size": 18,
					"font-family": $("#" + m.mapDivID).css("font-family")
				});
				
				
				//store raphael IDs of each label
                if (typeof (m.stateTextIDs === "undefined")) {m.stateTextIDs = {}; }
				m.stateTextIDs[state] = m.stateLabelObjs[state].node.raphaelid;
                if (typeof (m.stateByRaphaelTextID === "undefined")) {m.stateByRaphaelTextID = {}; }
				m.stateByRaphaelTextID[m.stateLabelObjs[state].node.raphaelid] = state;
			}
            
            for (state in us_paths) {
                if (us_paths.hasOwnProperty(state)) {
				    if (!(ops.hideDC === true && state === "DC")) {
                        makeState(state);
                        if (!paths.text.hide[state]) {
                            makeText(state);
                        }
                    }
                }
			}
            
        };
    };
    return map;
});