define(["jquery"], function ($) {
    "use strict";
    
    return function (m) {
        
        //Runs on mouse entry into state (or touch event on mobile)
        m.hoverIn = function (e) {
            var state = m.stateCodes[this.id];
            m.focusOn(state, "shape");
        };
        
        //Runs on mouse entry into state label (or touch event on mobile)
        m.labelHoverIn = function (e) {
            var state = this.attrs.text;
            m.focusOn(state, "label");
        };
        
        m.hoverOut = function (e) {
            var state = m.stateCodes[this.id];
            m.removeFocus(state, "shape");
        };
        
        m.labelHoverOut = function (e) {
            var state = this.attrs.text;
            m.removeFocus(state, "label");
        };
        
        m.removeFocus = function (s, triggeredBy) {
            setTimeout(function () {
                if (m.focusedState === s && m.focusTriggeredBy === triggeredBy) {
                    m.focusedState = "none";
                }
                if (!m.cursorInsideHover && m.focusedState === "none") {
                    $(".popup_container").fadeOut(200, function () {
                        this.remove();
                    });
                }
            }, 50);
        };
        
        m.cursorInsideHover = false;
        $("#" + m.mapDivID).on("mouseenter touchstart", ".popup", function (e) {
            m.cursorInsideHover = true;
        });
        $("#" + m.mapDivID).on("mouseleave touchend", ".popup", function (e) {
            m.cursorInsideHover = false;
            var state = $(this).parents("div.popup_container").data("state");
            m.removeFocus(state, "popup");
        });
        
        //Focus on the state
        m.focusOn = function (s, triggeredBy) {
            var coords,
                prop,
                box_anchor,
                verticalAlign = "top",
                horizontalAlign = "left",
                popup,
                popup_container,
                popup_subcontainer;
            if (triggeredBy === "shape") {
                coords = m.stateObjs[s].getBBox();
            } else {
                coords = m.stateLabelObjs[s].getBBox();
            }
            m.focusTriggeredBy = triggeredBy;
            if (m.focusedState === s) {
                return false;
            }
            m.focusedState = s;
            box_anchor = [(coords.x + coords.width / 2) / m.ie8_correction,
                          (coords.y + coords.height / 2) / m.ie8_correction];
            if (box_anchor[0] > m.viewX / 2) {
                horizontalAlign = "right";
            }
            if (box_anchor[1] > m.viewY / 2) {
                verticalAlign = "bottom";
            }
            $(".popup_container").fadeOut(200, function () {
                this.remove();
            });
            popup_container = $("<div class='popup_container' id='popup_" + s + "'>");
            popup_container.css({
                "width" : "0px",
                "height" : "0px",
                "position": "absolute",
                "display": "none",
                "left": box_anchor[0] * m.scaleFactor,
                "top": box_anchor[1] * m.scaleFactor
            });
            popup_container.data("state", s);
            
            popup = $("<div class='popup'>");
            popup.css({
                "width": 400 * m.scaleFactor + "px",
                "position": "absolute"
            });
            
            popup.css(horizontalAlign, "0px");
            popup.css(verticalAlign, "0px");
            
            popup.html(m.popupTemplate(m.data[s]));
          
            popup_container.append(popup);
            
            $("#" + m.mapDivID).append(popup_container);
            popup_container.fadeIn(100);
        };
        
        m.applyHoverEvents = function () {
            var state;
            for (state in m.stateObjs) {
                if (m.stateObjs.hasOwnProperty(state)) {
                    m.stateObjs[state].hover(m.hoverIn, m.hoverOut);
                }
            }
            for (state in m.stateLabelObjs) {
                if (m.stateLabelObjs.hasOwnProperty(state)) {
                    m.stateLabelObjs[state].hover(m.labelHoverIn, m.labelHoverOut);
                }
            }
        };
        
        m.applyHoverEvents();
    };
});