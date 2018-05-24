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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/renderers/smartMapping/creators/color", "esri/renderers/smartMapping/statistics/histogram", "esri/widgets/ColorSlider", "esri/layers/FeatureLayer", "esri/core/lang"], function (require, exports, EsriMap, MapView, colorRendererCreator, histogram, ColorSlider, FeatureLayer, lang) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function updatePanel() {
            var panelDiv = document.getElementById("panel");
            var titleElement = document.createElement("h2");
            titleElement.style.textAlign = "center";
            titleElement.innerText = title;
            panelDiv.appendChild(titleElement);
            var descriptionElement = document.createElement("div");
            descriptionElement.style.textAlign = "center";
            descriptionElement.style.paddingBottom = "10px";
            descriptionElement.innerText = appDescription;
            panelDiv.appendChild(descriptionElement);
            var selectElement = createSelect(variables);
            panelDiv.appendChild(selectElement);
            view.ui.add(panelDiv, "bottom-left");
            selectElement.addEventListener("change", selectVariable);
            selectVariable();
        }
        function createSelect(fieldInfos) {
            var selectElement = document.createElement("select");
            selectElement.className = "esri-widget";
            fieldInfos.forEach(function (info, i) {
                var option = document.createElement("option");
                option.value = info.value;
                option.text = info.description;
                option.selected = i === 0;
                selectElement.appendChild(option);
            });
            return selectElement;
        }
        function selectVariable(event) {
            return __awaiter(this, void 0, void 0, function () {
                var selectedValue, selectedInfo, rendererResponse;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            selectedValue = event ? event.target.value : variables[0].value;
                            selectedInfo = findVariableByValue(selectedValue);
                            return [4 /*yield*/, generateRenderer({
                                    layer: layer,
                                    view: view,
                                    value: selectedInfo.value,
                                    normalize: true
                                })];
                        case 1:
                            rendererResponse = _a.sent();
                            layer.renderer = rendererResponse.renderer;
                            colorSlider = updateSlider({
                                statistics: rendererResponse.statistics,
                                histogram: rendererResponse.histogram,
                                visualVariable: rendererResponse.visualVariable
                            }, colorSlider);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function findVariableByValue(value) {
            return variables.filter(function (info) { return info.value === value; })[0];
        }
        function getValueExpression(value, normalize) {
            // See variables array above
            var fieldInfo = findVariableByValue(value);
            var normalizationField = normalize ? normalizationVariable : null;
            return {
                valueExpression: generateArcade(fieldInfo.fields, normalizationField),
                valueExpressionTitle: fieldInfo.description
            };
        }
        function generateArcade(fields, normalizationField) {
            var value = fields.reduce(function (a, c, i) { return i === 1 ? "$feature." + a + " + $feature." + c : a + " + $feature." + c; });
            var percentValue = normalizationField ? "( ( " + value + " ) / $feature." + normalizationField + " ) * 100" : value;
            return "Round( " + percentValue + " )";
        }
        function generateRenderer(params) {
            return __awaiter(this, void 0, void 0, function () {
                var valueExpressionInfo, rendererParams, rendererResponse, rendererHistogram;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            valueExpressionInfo = getValueExpression(params.value, params.normalize);
                            rendererParams = {
                                layer: params.layer,
                                valueExpression: valueExpressionInfo.valueExpression,
                                valueExpressionTitle: valueExpressionInfo.valueExpressionTitle,
                                basemap: params.view.map.basemap,
                                view: params.view
                            };
                            return [4 /*yield*/, colorRendererCreator.createContinuousRenderer(rendererParams)];
                        case 1:
                            rendererResponse = _a.sent();
                            return [4 /*yield*/, histogram({
                                    layer: params.layer,
                                    valueExpression: valueExpressionInfo.valueExpression,
                                    numBins: 30,
                                    view: params.view
                                })];
                        case 2:
                            rendererHistogram = _a.sent();
                            return [2 /*return*/, {
                                    renderer: rendererResponse.renderer,
                                    statistics: rendererResponse.statistics,
                                    histogram: rendererHistogram,
                                    visualVariable: rendererResponse.visualVariable
                                }];
                    }
                });
            });
        }
        function updateSlider(params, slider) {
            if (!slider) {
                var sliderContainer = document.createElement("div");
                var panelDiv = document.getElementById("panel");
                panelDiv.appendChild(sliderContainer);
                slider = new ColorSlider({
                    container: sliderContainer,
                    statistics: params.statistics,
                    histogram: params.histogram,
                    visualVariable: params.visualVariable
                });
                slider.on("data-change", function (event) {
                    var renderer = layer.renderer;
                    var rendererClone = renderer.clone();
                    rendererClone.visualVariables = [lang.clone(slider.visualVariable)];
                    layer.renderer = rendererClone;
                });
            }
            else {
                slider.set(params);
            }
            return slider;
        }
        var layer, map, view, title, appDescription, variables, normalizationVariable, colorSlider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = new FeatureLayer({
                        portalItem: {
                            id: "b975d17543fb4ab2a106415dca478684"
                        }
                    });
                    map = new EsriMap({
                        basemap: "streets",
                        layers: [layer]
                    });
                    view = new MapView({
                        map: map,
                        container: "viewDiv",
                        center: [-99.5789795341516, 19.04471398160347],
                        zoom: 7
                    });
                    title = "2014 Educational Attainment";
                    appDescription = "\n    Educational attainment refers to the \n    highest level of education that an \n    individual has completed. People\n    who completed higher levels of\n    education are not included in counts\n    of lower education levels.\n  ";
                    variables = [
                        {
                            value: "no-school",
                            description: "% population that didn't complete any education level",
                            fields: ["EDUC01_CY", "EDUC02_CY", "EDUC03_CY"]
                        }, {
                            value: "primary",
                            description: "% population with primary education",
                            fields: ["EDUC04_CY", "EDUC05_CY", "EDUC07_CY"]
                        }, {
                            value: "secondary",
                            description: "% population with secondary education",
                            fields: ["EDUC06_CY", "EDUC08_CY"]
                        }, {
                            value: "high-school",
                            description: "% population with high school education",
                            fields: ["EDUC09_CY", "EDUC11_CY"]
                        }, {
                            value: "university",
                            description: "% population with university education",
                            fields: ["EDUC10_CY", "EDUC12_CY", "EDUC13_CY", "EDUC14_CY", "EDUC15_CY"]
                        }
                    ];
                    normalizationVariable = "EDUCA_BASE";
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    updatePanel();
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map