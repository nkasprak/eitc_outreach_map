define([], function () {
    "use strict";
    var theLegend = (function () {
        
        function getZeroLocation(l) {
            var spansZero = (l.lowValue < 0 && l.highValue > 0), zeroPercent;
            if (spansZero) {
                zeroPercent = Math.round((-l.lowValue) / (l.highValue - l.lowValue) * 100);
                return zeroPercent;
            } else {
                return "noZero";
            }
        }

        function makeGradientString(l) {
            var spansZero = (l.lowValue > 0 && l.highValue < 0),
                gradientString,
                zeroPercent;
            gradientString = "0-" + l.lowColor + "-";
            zeroPercent = getZeroLocation(l);
            if (zeroPercent !== "noZero") {
                gradientString += l.middleColor + ":" + zeroPercent + "-";
                l.middleTextPos = zeroPercent;
            }
            gradientString += l.highColor;
            return gradientString;
        }
        
        
        return {
            setBounds: function (low, high) {
                this.lowValue = low;
                this.highValue = high;
            },
            defineColors: function (low, high, middle) {
                this.lowColor = low;
                this.highColor = high;
                if (typeof (middle) !== "undefined") {
                    this.middleColor = middle;
                }
            },
            formatter: function (t) {
                return t;
            },
            setFormatter: function (formatter) {
                this.formatter = formatter;
            },
            setOptions: function (ops) {

            },
            draw: function (m) {
                var left = m.viewX * 0.15,
                    width = m.viewX * 0.7,
                    legendAttrs,
                    zeroPercent;
                if (m.legendBox) {
                    m.legendBox.remove();
                }
                m.legendBox = m.paper.rect(left, 600, width, 20);
                m.legendBox.attr("fill", makeGradientString(this));
                legendAttrs = {
                    "font-size": 28,
                    "font-family" : m.fontFamily,
                    "text-anchor" : "start"
                };
                if (m.leftLegendText) {
                    m.leftLegendText.remove();
                }
                m.leftLegendText = m.paper.text(left, 635, this.formatter(this.lowValue));
                m.leftLegendText.attr(legendAttrs);
                if (m.rightLegendText) {
                    m.rightLegendText.remove();
                }
                m.rightLegendText = m.paper.text(left + width, 635, this.formatter(this.highValue));
                legendAttrs["text-anchor"] = "end";
                m.rightLegendText.attr(legendAttrs);
                
                if (m.middleLegendText) {
                    m.middleLegendText.remove();
                }
                zeroPercent = getZeroLocation(this);
                if (zeroPercent !== "noZero") {
                    m.middleLegendText = m.paper.text(left + width * zeroPercent / 100, 635, this.formatter(0));
                    legendAttrs["text-anchor"] = "middle";
                    m.middleLegendText.attr(legendAttrs);
                }
            }
        };
    }());
    return theLegend;
});