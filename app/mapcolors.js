define(["jquery"], function ($) {
    "use strict";
    var colorUtils = function (colorConfig, m, customMax, customMin) {
        
        var c = this;
        c.colorConfig = colorConfig;
        c.calculateBound = function (d, dI, b) {
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
        
        c.customMax = customMax;
        c.customMin = customMin;
        
        c.calculateMinMax = function () {
            if (c.customMax) {
                m.max = c.customMax;
            } else {
                m.max = c.calculateBound(m.data, m.dataIndex, "max");
            }

            if (c.customMin) {
                m.min = c.customMin;
            } else {
                m.min = c.calculateBound(m.data, m.dataIndex, "min");
            }
        };
        
        c.calculateMinMax();
    
        c.colorConfig = {
            highColor : "#b9292f",
            zeroColor : "#ffffff",
            lowColor  : "#fff0d3",
            hoverColor:	"#f8c55b"
        };

        c.hexToRGB = function (hexString) {
            var r = parseInt(hexString.substr(1, 2), 16),
                g = parseInt(hexString.substr(3, 2), 16),
                b = parseInt(hexString.substr(5, 2), 16);
            return [r, g, b];
        };

        c.RGBToHex = function (rgbArray) {
            function pad(num, size) {
                var s = "0" + num;
                return s.substr(s.length - size);
            }
            return "#" + pad(rgbArray[0].toString(16), 2) + pad(rgbArray[1].toString(16), 2) + pad(rgbArray[2].toString(16), 2);
        };

        c.stateColors = {};

        c.calcStateColors = function () {
            var scale, state, dataPoint, dMax, dMin, calcColor, highRGB, lowRGB, zeroRGB, dataIndex, spansZero;

            highRGB = c.hexToRGB(c.colorConfig.highColor);
            zeroRGB = c.hexToRGB(c.colorConfig.zeroColor);
            lowRGB = c.hexToRGB(c.colorConfig.lowColor);

            calcColor = function (cScale) {
                var rgb = [], rgbVal, i;
                for (i = 0; i < 3; i += 1) {
                    if (spansZero) {
                        /*if the actual value was negative, cScale goes from -1 to -2, just as a signal
                        to use negative part of the gradient (originally was 0 to -1 but data min was 
                        assigned to zero and was ambiguous as to which gradient it should use)*/
                        if (cScale <= -1) {
                            /*convert it back to a normal 0 to 1 range and calc color*/
                            rgbVal = -(cScale + 1) * (zeroRGB[i] - lowRGB[i]) + lowRGB[i];
                        } else {
                            rgbVal = cScale * (highRGB[i] - zeroRGB[i]) + zeroRGB[i];
                        }
                    } else {
                        rgbVal = cScale * (highRGB[i] - lowRGB[i]) + lowRGB[i];
                    }
                    rgb[i] = Math.round(rgbVal);
                }
                return c.RGBToHex(rgb);
            };


            dMax = m.max;
            dMin = m.min;
            
            spansZero = (dMin < 0 && dMax > 0);

            for (state in m.data) {
                if (m.data.hasOwnProperty(state)) {
                    dataPoint = m.data[state][m.dataIndex];
                    
                    if (spansZero) {
                        //Data has positive and negative values - use a zero color
                        //Subtract 1 from the scale value - see note above (desired range is -1 to -2)
                        if (dataPoint < 0) { scale = -(dataPoint - dMin) / -dMin - 1; } else { scale = dataPoint / dMax; }
                    } else {
                        //Data is entirely positive or negative - don't use special zero color
                        scale = (dataPoint - dMin) / (dMax - dMin);
                    }
                    c.stateColors[state] = calcColor(scale);
                }
            }
        };

        c.animateStateColor = function (state, newColor, duration) {
        
            var startColor, tracker, r, theAnimation;
           
            if (m.stateObjs[state]) {
                startColor = c.hexToRGB(m.stateObjs[state].attr("fill"));
            }
         
            if (newColor === c.RGBToHex(startColor)) {
                return false;
            }
            
            tracker = 0;
            theAnimation = {
                r: setInterval(function () {
                    if (tracker > duration) {
                        clearInterval(r);
                        return false;
                    }
                    var scale = tracker / duration,
                        rgbColor,
                        frameColor = [0, 0, 0],
                        i;
                    if (state === "") {
                        return false;
                    }
                    rgbColor = c.hexToRGB(newColor);
                    for (i = 0; i < 3; i += 1) {
                        frameColor[i] = Math.round((rgbColor[i] - startColor[i]) * scale + startColor[i]);
                    }
                    m.stateObjs[state].attr("fill", c.RGBToHex(frameColor));
                    tracker += 10;
                }, 10),
                startColor: startColor,
                theState: state,
                newColors: newColor,
                stopAnimation: function () {
                    clearInterval(this.r);
                },
                resetColorImmediately: function () {
                    m.stateObjs[state].attr("fill", startColor);
                }
            };
            return theAnimation;
        };

        c.applyStateColors = function (duration) {
            var toAnimate, state;
            if (typeof (duration) === "undefined") {
                duration = 0;
            }
            if (duration > 0) {
                toAnimate = {};
            }
            function brightness(hexcolor) {
                var color = c.hexToRGB(hexcolor);
                return color[0] + color[1] + color[2];
            }
           
            for (state in c.stateColors) {
                if (c.stateColors.hasOwnProperty(state)) {
                    if (m.stateObjs[state]) {
                        if (duration === 0) {
                            m.stateObjs[state].attr("fill", c.stateColors[state]);
                        } else {
                            toAnimate[state] = c.stateColors[state];
                        }
                        if (m.stateLabelObjs[state]) {
                            if (brightness(c.stateColors[state]) < 200) {
                                m.stateLabelObjs[state].attr("fill", "#ffffff");
                            } else {
                                m.stateLabelObjs[state].attr("fill", "#000000");
                            }
                        }
                    }
                }
            }
            if (duration > 0) {
                for (state in toAnimate) {
                    if (toAnimate.hasOwnProperty(state)) {
                        c.animateStateColor(state, toAnimate[state], duration);
                    }
                }
            }
        };
    };
	
	return colorUtils;
	
});
