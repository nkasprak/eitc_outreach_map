define(["jquery"], function ($) {
    "use strict";
    
    return function (m) {
        
        m.applyMousePos = function (e) {
            if (typeof (m.mousePos) === "undefined") {
                m.mousePos = {};
            }
        
            //IE8 fallback
            if (typeof (e.pageX === "undefined")) {
                m.mousePos.x = e.clientX;
                m.mousePos.y = e.clientY;
            } else {
                m.mousePos.x = e.pageX;
                m.mousePos.y = e.pageY;
            }
        };
        
        //Runs on mouse entry into state (or touch event on mobile)
        m.hoverIn = function (e) {
            var state = m.stateCodes[this.id];
            clearTimeout(m.popupFadeoutTimer);
            m.applyMousePos(e);
            setTimeout(function () {
                m.focusOn(state);
            }, 100);
        };
        
        //Runs on mouse entry into state label (or touch event on mobile)
        m.labelHoverIn = function (e) {
            var state = this.attrs.text;
            clearTimeout(m.popupFadeoutTimer);
            m.applyMousePos(e);
            setTimeout(function () {
                m.focusOn(state);
            }, 100);
        };
        
        m.hoverOut = function (e) {
            var state = m.stateCodes[this.id];
            m.removeFocus(state);
        };
        
        m.labelHoverOut = function (e) {
            var state = this.attrs.text;
            m.removeFocus(state);
        };
        
        m.mouseClick = function (e) {
            var state = m.stateCodes[this.id];
            m.stateClick(state);
        };
        
        m.labelMouseClick = function (e) {
            var state = this.attrs.text;
            m.stateClick(state);
        };
        
        m.removeFocus = function (s) {
            m.popupFadeoutTimer = setTimeout(function () {
                
                if (!m.cursorInsideHover) {
                    $(".popup_container").fadeOut(200, function () {
                        $(this).remove();
                        m.focusedState = "none";
                        m.revertFocusColor(s, 300);
                    });
                }
            }, 300);
        };
        
        m.revertFocusColor = function (s, duration) {
           
            if (typeof (m.animationRefs) === "undefined") {
                m.animationRefs = {};
            }
            if (m.animationRefs[s]) {
                m.animationRefs[s].stopAnimation();
            }
           
            m.animationRefs[s] = m.colors.animateStateColor(s,  m.colors.stateColors[s], duration);
        };
        
        m.mouseTracker = function (e) {
            m.applyMousePos(e);
        };
        
        m.cursorInsideHover = false;
        $("#" + m.mapDivID).on("mouseenter touchstart", ".popup", function (e) {
            m.cursorInsideHover = true;
        });
        
        $("#" + m.mapDivID).on("mouseleave touchend", ".popup", function (e) {
            m.cursorInsideHover = false;
            var state = $(this).parents("div.popup_container").data("state");
            m.removeFocus(state);
        });
        
        //Focus on the state
        m.focusOn = function (s) {
            var coords,
                prop,
                box_anchor,
                verticalAlign = "top",
                horizontalAlign = "left",
                popup,
                popup_container,
                popup_subcontainer,
                stateAnimation,
                oldStateAnimation,
                animatingState;
            
            if (m.focusedState === s) {
                return false;
            }
            
            if (m.focusedState) {
                if (m.focusedState !== "none") {
                    m.revertFocusColor(m.focusedState, 200);
                }
            }
            
            m.focusedState = s;
            box_anchor = [m.mousePos.x, m.mousePos.y];
            if (box_anchor[0] > m.width / 2) {
                horizontalAlign = "right";
            }
            if (box_anchor[1] > m.height / 2) {
                verticalAlign = "bottom";
            }
            $(".popup_container").fadeOut(200, function () {
                $(this).remove();
            });
            
            if (typeof (m.animationRefs) === "undefined") {
                m.animationRefs = {};
            }
            
            for (animatingState in m.animationRefs) {
                if (m.animationRefs.hasOwnProperty(animatingState)) {
                    if (m.animationRefs[animatingState]) {
                        m.animationRefs[animatingState].stopAnimation();
                        m.animationRefs[animatingState] = m.colors.animateStateColor(animatingState, m.colors.stateColors[animatingState], 200);
                    }
                }
            }
            
            popup_container = $("<div class='popup_container' id='popup_" + s + "'>");
            popup_container.css({
                "width" : "0px",
                "height" : "0px",
                "position": "absolute",
                "display": "none",
                "left": box_anchor[0],
                "top": box_anchor[1]
            });
            popup_container.data("state", s);
            
            popup = $("<div class='popup'>");
            popup.css({
                "width": 400 * m.scaleFactor + "px",
                "font-size" : m.popupStyle.fontSize * m.scaleFactor + "px",
                "position": "absolute",
                "padding": m.popupStyle.padding + "px",
                "background-color": m.popupStyle.bgColor
            });
            
            popup.css(horizontalAlign, "10px");
            popup.css(verticalAlign, "10px");
            
            popup.html(m.popupTemplate(m.data[s]));
          
            popup_container.append(popup);
            
            $("#" + m.mapDivID).append(popup_container);
            popup_container.fadeIn(100);
    
            if (m.animationRefs[s]) {
                m.animationRefs[s].stopAnimation();
            }
            
            m.animationRefs[s] = m.colors.animateStateColor(s, m.colors.colorConfig.hoverColor, 200);
        };
        
        m.applyHoverEvents = function () {
            var state;
            for (state in m.stateObjs) {
                if (m.stateObjs.hasOwnProperty(state)) {
                    m.stateObjs[state].hover(m.hoverIn, m.hoverOut);
                    m.stateObjs[state].mousemove(m.mouseTracker);
                    m.stateObjs[state].click(m.mouseClick);
                }
            }
            for (state in m.stateLabelObjs) {
                if (m.stateLabelObjs.hasOwnProperty(state)) {
                    m.stateLabelObjs[state].hover(m.labelHoverIn, m.labelHoverOut);
                    m.stateLabelObjs[state].click(m.labelMouseClick);
                }
            }
        };
        
        m.applyHoverEvents();
    };
});