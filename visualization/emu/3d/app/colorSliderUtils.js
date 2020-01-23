var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/widgets/smartMapping/ColorSlider", "esri/renderers/smartMapping/statistics/histogram", "esri/Color"], function (require, exports, ColorSlider, histogram, Color) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var colorSlider;
    var colorSlideChangeEvent, colorSlideSlideEvent;
    var bars = [];
    function updateColorSlider(params) {
        return __awaiter(this, void 0, void 0, function () {
            var layer, colorSliderContainer, colorHistogram, colorStops, colorSliderParams, colorSliderParent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layer = params.layer;
                        colorSliderContainer = document.createElement("div");
                        return [4 /*yield*/, histogram({
                                layer: params.layer,
                                field: params.field,
                                numBins: 50
                            })];
                    case 1:
                        colorHistogram = _a.sent();
                        colorStops = params.colorResponse.visualVariable.stops;
                        colorSliderParams = {
                            max: params.colorResponse.statistics.max,
                            min: params.colorResponse.statistics.min,
                            stops: colorStops,
                            primaryHandleEnabled: params.theme !== "high-to-low",
                            handlesSyncedToPrimary: params.theme !== "high-to-low",
                            container: colorSliderContainer,
                            histogramConfig: {
                                bins: colorHistogram.bins,
                                barCreatedFunction: function (index, element) {
                                    var bin = colorHistogram.bins[index];
                                    var midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
                                    var color = getColorFromValue(colorStops, midValue);
                                    element.setAttribute("fill", color.toHex());
                                    bars.push(element);
                                }
                            }
                        };
                        if (!colorSlider) {
                            colorSliderParent = document.getElementById("color-container");
                            colorSliderContainer.className = "esri-widget";
                            colorSliderParent.appendChild(colorSliderContainer);
                            colorSlider = new ColorSlider(colorSliderParams);
                            updateMeanValue();
                            // when the user slides the handle(s), update the renderer
                            // with the updated color visual variable object
                            colorSlideChangeEvent = colorSlider.on(["thumb-change", "thumb-drag", "min-change", "max-change"], function () {
                                var oldRenderer = layer.renderer;
                                var newRenderer = oldRenderer.clone();
                                if (newRenderer.visualVariables.length < 1) {
                                    return;
                                }
                                var visualVariables = newRenderer.visualVariables;
                                oldRenderer.visualVariables = [];
                                var unchangedVVs = [];
                                var colorVariable = null;
                                if (visualVariables) {
                                    visualVariables.forEach(function (vv) {
                                        if (vv.type === "color") {
                                            colorVariable = vv;
                                        }
                                        else {
                                            unchangedVVs.push(vv);
                                        }
                                    });
                                }
                                // else {
                                //   newRenderer.visualVariables.push(lang.clone(colorSlider.visualVariable));
                                // }
                                colorVariable.stops = colorSlider.stops;
                                newRenderer.visualVariables = unchangedVVs.concat(colorVariable);
                                updateMeanValue();
                                layer.renderer = newRenderer;
                                bars.forEach(function (bar, index) {
                                    var bin = colorSlider.histogramConfig.bins[index];
                                    var midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
                                    var color = getColorFromValue(colorSlider.stops, midValue);
                                    bar.setAttribute("fill", color.toHex());
                                });
                            });
                            // colorSlideSlideEvent = colorSlider.on("data-change", function() {
                            //   const oldRenderer = layer.renderer as SimpleRenderer;
                            //   const newRenderer = oldRenderer.clone();
                            //   if(newRenderer.visualVariables.length > 1){
                            //     return;
                            //   }
                            //   newRenderer.visualVariables = [ lang.clone(colorSlider.visualVariable) ];
                            //   updateMeanValue();
                            //   layer.renderer = newRenderer;
                            // });
                        }
                        else {
                            colorSlider.set(colorSliderParams);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.updateColorSlider = updateColorSlider;
    var displayMeanValue = document.getElementById("display-mean-value");
    function updateMeanValue() {
        displayMeanValue.innerText = colorSlider.stops[2].value.toFixed(2).toString();
    }
    function destroyColorSlider() {
        if (colorSlider) {
            colorSlideChangeEvent.remove();
            colorSlider.destroy();
            colorSlider = null;
        }
    }
    exports.destroyColorSlider = destroyColorSlider;
    // infers the color for a given value
    // based on the stops from a ColorVariable
    function getColorFromValue(stops, value) {
        var minStop = stops[0];
        var maxStop = stops[stops.length - 1];
        var minStopValue = minStop.value;
        var maxStopValue = maxStop.value;
        if (value < minStopValue) {
            return minStop.color;
        }
        if (value > maxStopValue) {
            return maxStop.color;
        }
        var exactMatches = stops.filter(function (stop) {
            return stop.value === value;
        });
        if (exactMatches.length > 0) {
            return exactMatches[0].color;
        }
        minStop = null;
        maxStop = null;
        stops.forEach(function (stop, i) {
            if (!minStop && !maxStop && stop.value >= value) {
                minStop = stops[i - 1];
                maxStop = stop;
            }
        });
        var weightedPosition = (value - minStop.value) / (maxStop.value - minStop.value);
        return Color.blendColors(minStop.color, maxStop.color, weightedPosition);
    }
});
//# sourceMappingURL=colorSliderUtils.js.map