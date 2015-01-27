define(["jquery"], function ($) {
    "use strict";
    var colorUtils = function (colorConfig, mapObj, customMax, customMin) {
        
        var m = this;
        m.colorConfig = colorConfig;
        m.stateObjs = mapObj.stateObjs;
        m.data = mapObj.data;
        m.dataIndex = mapObj.dataIndex;
        m.stateLabelObjs = mapObj.stateLabelObjs;
        m.calculateBound = function (d, dI, b) {
            var state, bound;
            for (state in d) {
                if (d.hasOwnProperty(state)) {
                    if (typeof (bound) === "undefined") {
                        bound = d[state][dI];
                    } else {
                        if (b === "min") {
                            bound = Math.min(bound, d[state][dI]);
                           
                        } else if (b === "max") {
                            bound = Math.max(bound, d[state][dI]);
                        } else {
                            return false;
                        }
                    }
                }
            }
            return bound;
        };
        
        if (customMax) {
            m.max = customMax;
        } else {
            m.max = m.calculateBound(m.data, m.dataIndex, "max");
        }
        
        if (customMin) {
            m.min = customMin;
        } else {
            m.min = m.calculateBound(m.data, m.dataIndex, "min");
        }
    
        m.colorConfig = {
            highColor : "#b9292f",
            zeroColor : "#ffffff",
            lowColor  : "#fff0d3",
            hoverColor:	"#f8c55b"
        };

        m.hexToRGB = function (hexString) {
            var r = parseInt(hexString.substr(1, 2), 16),
                g = parseInt(hexString.substr(3, 2), 16),
                b = parseInt(hexString.substr(5, 2), 16);
            return [r, g, b];
        };

        m.RGBToHex = function (rgbArray) {
            function pad(num, size) {
                var s = "0" + num;
                return s.substr(s.length - size);
            }
            return "#" + pad(rgbArray[0].toString(16), 2) + pad(rgbArray[1].toString(16), 2) + pad(rgbArray[2].toString(16), 2);
        };

        m.stateColors = {};

        m.calcStateColors = function () {
            var scale, state, dataPoint, dMax, dMin, calcColor, highRGB, lowRGB, zeroRGB, spansZero, dataIndex, zeroPercent;

            highRGB = m.hexToRGB(m.colorConfig.highColor);
            zeroRGB = m.hexToRGB(m.colorConfig.zeroColor);
            lowRGB = m.hexToRGB(m.colorConfig.lowColor);

            calcColor = function (cScale) {
                var rgb = [], rgbVal, i;
                for (i = 0; i < 3; i += 1) {
                    if (spansZero) {
                        if (cScale < 0) {
                            rgbVal = -cScale * (zeroRGB[i] - lowRGB[i]) + lowRGB[i];
                        } else {
                            rgbVal = cScale * (highRGB[i] - zeroRGB[i]) + zeroRGB[i];
                        }
                    } else {
                        rgbVal = cScale * (highRGB[i] - lowRGB[i]) + lowRGB[i];
                    }
                    rgb[i] = Math.round(rgbVal);
                }
                return m.RGBToHex(rgb);
            };


            dMax = m.max;
            dMin = m.min;

            spansZero = (dMax > 0 && dMin < 0);

            //m.gradientString = "0-" + m.colorConfig.lowColor + "-";

            //m.middleTextPos = "off";

            if (spansZero) {
                zeroPercent = Math.round((-dMin) / (dMax - dMin) * 100);
                //m.gradientString += m.colorConfig.zeroColor + ":" + zeroPercent + "-";
                //m.middleTextPos = zeroPercent;
            }
            //m.gradientString += m.colorConfig.highColor;



            for (state in m.data) {
                if (m.data.hasOwnProperty(state)) {
                    dataPoint = m.data[state][m.dataIndex];

                    if (spansZero) {
                        //Data has positive and negative values - use a zero color
                        if (dataPoint < 0) { scale = -(dataPoint - dMin) / -dMin; } else { scale = dataPoint / dMax; }
                    } else {
                        //Data is entirely positive or negative - don't use special zero color
                        scale = (dataPoint - dMin) / (dMax - dMin);
                    }

                    m.stateColors[state] = calcColor(scale);
                }
            }
        };

        m.animateStateColor = function (newColors, duration) {
            var startColors = {}, state, tracker, r;
            for (state in newColors) {
                if (newColors.hasOwnProperty(state)) {
                    if (m.stateObjs[state]) {
                        startColors[state] = m.hexToRGB(m.stateObjs[state].attr("fill"));
                    }
                }
            }
            tracker = 0;
            r = setInterval(function () {
                if (tracker > duration) {
                    clearInterval(r);
                    return false;
                }
                var scale = tracker / duration;
                $.each(newColors, function (state, color) {
                    var rgbColor, frameColor = [0, 0, 0], i;
                    if (state === "") {
                        return false;
                    }
                    rgbColor = m.hexToRGB(color);
                    for (i = 0; i < 3; i += 1) {
                        frameColor[i] = Math.round((rgbColor[i] - startColors[state][i]) * scale + startColors[state][i]);
                    }
                    m.stateObjs[state].attr("fill", m.RGBToHex(frameColor));
                });
                tracker += 10;
            }, 10);
        };

        m.applyStateColors = function (duration) {
            var toAnimate, state;
            if (typeof (duration) === "undefined") {
                duration = 0;
            }
            if (duration > 0) {
                toAnimate = {};
            }
            function brightness(hexcolor) {
                var color = m.hexToRGB(hexcolor);
                return color[0] + color[1] + color[2];
            }
           
            for (state in m.stateColors) {
                if (m.stateColors.hasOwnProperty(state)) {
                    if (m.stateObjs[state]) {
                        if (duration === 0) {
                            m.stateObjs[state].attr("fill", m.stateColors[state]);
                        } else {
                            toAnimate[state] = m.stateColors[state];
                        }
                        if (m.stateLabelObjs[state]) {
                            if (brightness(m.stateColors[state]) < 200) {
                                m.stateLabelObjs[state].attr("fill", "#ffffff");
                            } else {
                                m.stateLabelObjs[state].attr("fill", "#000000");
                            }
                        }
                    }
                }
            }
            if (duration > 0) {
                m.animateStateColor(toAnimate, duration);
            }
        };
    };
	
	return colorUtils;
	
});
