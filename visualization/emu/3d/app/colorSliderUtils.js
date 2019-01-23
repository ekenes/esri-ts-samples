var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
define(["require", "exports", "esri/widgets/ColorSlider", "esri/renderers/smartMapping/statistics/histogram", "esri/core/lang"], function (require, exports, ColorSlider, histogram, lang) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var colorSlider;
    function updateColorSlider(params) {
        return __awaiter(this, void 0, void 0, function () {
            var layer, colorSliderContainer, colorHistogram, colorSliderParams, colorSliderParent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layer = params.layer;
                        colorSliderContainer = document.createElement("div");
                        return [4 /*yield*/, histogram({
                                layer: params.layer,
                                field: params.field,
                                numBins: 30
                            })];
                    case 1:
                        colorHistogram = _a.sent();
                        colorSliderParams = {
                            statistics: params.colorResponse.statistics,
                            maxValue: params.colorResponse.statistics.max,
                            minValue: params.colorResponse.statistics.min,
                            histogram: colorHistogram,
                            visualVariable: params.colorResponse.visualVariable,
                            numHandles: getNumHandles(params.theme),
                            syncedHandles: getNumHandles(params.theme) > 2,
                            container: colorSliderContainer
                        };
                        if (!colorSlider) {
                            colorSliderParent = document.getElementById("color-container");
                            colorSliderContainer.className = "esri-widget";
                            colorSliderParent.appendChild(colorSliderContainer);
                            colorSlider = new ColorSlider(colorSliderParams);
                            // when the user slides the handle(s), update the renderer
                            // with the updated color visual variable object
                            colorSlider.on("handle-value-change", function () {
                                var oldRenderer = layer.renderer;
                                var newRenderer = oldRenderer.clone();
                                if (newRenderer.visualVariables.length <= 1) {
                                    return;
                                }
                                var visualVariables = lang.clone(newRenderer.visualVariables);
                                oldRenderer.visualVariables = [];
                                if (visualVariables) {
                                    var unchangedVVs = visualVariables.filter(function (vv) {
                                        return vv.type !== "color";
                                    });
                                    newRenderer.visualVariables = unchangedVVs.concat([lang.clone(colorSlider.visualVariable)]);
                                }
                                else {
                                    newRenderer.visualVariables.push(lang.clone(colorSlider.visualVariable));
                                }
                                updateMeanValue();
                                layer.renderer = newRenderer;
                            });
                            colorSlider.on("data-change", function () {
                                var oldRenderer = layer.renderer;
                                var newRenderer = oldRenderer.clone();
                                if (newRenderer.visualVariables.length > 1) {
                                    return;
                                }
                                newRenderer.visualVariables = [lang.clone(colorSlider.visualVariable)];
                                updateMeanValue();
                                layer.renderer = newRenderer;
                            });
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
    function getNumHandles(theme) {
        return theme === "high-to-low" ? 2 : 3;
    }
    function updateMeanValue() {
        var displayMeanValue = document.getElementById("display-mean-value");
        displayMeanValue.innerHTML = (Math.round(colorSlider.visualVariable.stops[2].value * 100) / 100).toString();
    }
});
//# sourceMappingURL=colorSliderUtils.js.map