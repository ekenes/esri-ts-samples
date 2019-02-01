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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/geometry", "./depthUtils", "esri/widgets/Home", "esri/widgets/BasemapToggle", "esri/widgets/Legend", "esri/widgets/Expand", "./rendererUtils", "./colorSliderUtils"], function (require, exports, EsriMap, MapView, FeatureLayer, geometry_1, depthUtils_1, Home, BasemapToggle, Legend, Expand, rendererUtils_1, colorSliderUtils_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function filterChange() {
            var emuExpression = emuFilter.value;
            var expression = "" + emuExpression;
            layer.definitionExpression = expression;
        }
        function changeEventListener() {
            if (colorField1Select.value === "Cluster37") {
                colorField2Select.disabled = true;
                colorSliderUtils_1.destroyColorSlider();
                rendererUtils_1.setEMUClusterVisualization(layer);
            }
            else {
                if (colorField2Select.value === "") {
                    colorField2Select.disabled = false;
                    displayMean.style.visibility = "hidden";
                    displayVariable.innerHTML = colorField1Select.selectedOptions[0].text;
                    if (colorField1Select.value === "salinity") {
                        displayUnit.innerHTML = "";
                    }
                    else {
                        displayUnit.innerHTML = colorField1Select.value === "temp" ? " °C" : " µmol/l";
                    }
                    rendererUtils_1.generateContinuousVisualization({
                        view: view,
                        layer: layer,
                        field: colorField1Select.value
                    });
                }
                else {
                    colorSliderUtils_1.destroyColorSlider();
                    rendererUtils_1.generateRelationshipVisualization({
                        layer: layer,
                        view: view,
                        field1: {
                            fieldName: colorField1Select.value,
                            label: colorField1Select.selectedOptions[0].text
                        },
                        field2: {
                            fieldName: colorField2Select.value,
                            label: colorField2Select.selectedOptions[0].text
                        }
                    });
                }
            }
        }
        var colorField1Select, colorField2Select, emuFilter, displayMean, displayVariable, displayUnit, studyArea, url, layer, map, view, legend, legendExpand, colorSliderExpand, filtersExpand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    colorField1Select = document.getElementById("color-field1-select");
                    colorField2Select = document.getElementById("color-field2-select");
                    emuFilter = document.getElementById("emu-filter");
                    displayMean = document.getElementById("display-mean");
                    displayVariable = document.getElementById("display-variable");
                    displayUnit = document.getElementById("display-unit");
                    studyArea = new geometry_1.Extent({
                        spatialReference: { wkid: 3857 },
                        xmin: -32607543,
                        ymin: -148400,
                        xmax: -31196210,
                        ymax: 952292
                    });
                    url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/EMUMaster_Indian_Ocean_all/FeatureServer/1";
                    layer = new FeatureLayer({
                        title: "EMU data points",
                        url: url,
                        popupTemplate: {
                            title: "{NameEMU}",
                            content: [{
                                    type: "fields",
                                    fieldInfos: [{
                                            fieldName: "temp",
                                            label: "Temperature (F)"
                                        }, {
                                            fieldName: "salinity",
                                            label: "Salinity"
                                        }, {
                                            fieldName: "appO2ut",
                                            label: "Apparent Oxygen"
                                        }, {
                                            fieldName: "dissO2",
                                            label: "Dissolved Oxygen"
                                        }, {
                                            fieldName: "nitrate",
                                            label: "Nitrate"
                                        }, {
                                            fieldName: "percO2sat",
                                            label: "% Saturated Oxygen"
                                        }, {
                                            fieldName: "phosphate",
                                            label: "Phosphate"
                                        }, {
                                            fieldName: "silicate",
                                            label: "Silicate"
                                        }, {
                                            fieldName: "Cluster37",
                                            label: "EMU Cluster"
                                        }, {
                                            fieldName: "ChlorA_12yrAvg",
                                            label: "Chlor A (12 yr avg)"
                                        }, {
                                            fieldName: "expression/depth",
                                            label: "Depth profile"
                                        }]
                                }],
                            expressionInfos: [{
                                    name: "depth",
                                    title: "Depth",
                                    expression: "Text(Abs($feature.UnitTop), '#,###') + 'm - ' + Text(Abs($feature.UnitBottom), '#,###') + 'm'"
                                }]
                        }
                    });
                    map = new EsriMap({
                        basemap: "dark-gray-vector",
                        layers: [layer]
                    });
                    view = new MapView({
                        map: map,
                        container: "viewDiv",
                        extent: studyArea,
                        padding: {
                            top: 40
                        }
                    });
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    depthUtils_1.createDepthSlider({
                        layer: layer,
                        view: view,
                        depthFieldName: "UnitTop"
                    });
                    view.ui.add("slider-div", "top-right");
                    rendererUtils_1.generateContinuousVisualization({
                        view: view,
                        layer: layer,
                        field: colorField1Select.value
                    });
                    emuFilter.addEventListener("change", filterChange);
                    ///////////////////////////////////////
                    //
                    // Widgets
                    //
                    //////////////////////////////////////
                    // Display mean
                    view.ui.add(displayMean, "top-right");
                    // Home
                    view.ui.add(new Home({ view: view }), "top-left");
                    // BasemapToggle
                    view.ui.add(new BasemapToggle({
                        view: view,
                        nextBasemap: "oceans"
                    }), "bottom-right");
                    legend = new Legend({
                        view: view,
                        container: document.createElement("div"),
                        layerInfos: [{ layer: layer }]
                    });
                    legendExpand = new Expand({
                        view: view,
                        content: legend.container,
                        expandIconClass: "esri-icon-key",
                        group: "top-left"
                    });
                    view.ui.add(legendExpand, "top-left");
                    colorSliderExpand = new Expand({
                        view: view,
                        content: document.getElementById("color-container"),
                        expandIconClass: "esri-icon-chart",
                        group: "top-left"
                    });
                    view.ui.add(colorSliderExpand, "top-left");
                    filtersExpand = new Expand({
                        view: view,
                        content: document.getElementById("filter-container"),
                        expandIconClass: "esri-icon-filter",
                        group: "top-left"
                    });
                    view.ui.add(filtersExpand, "top-left");
                    colorField1Select.addEventListener("change", changeEventListener);
                    colorField2Select.addEventListener("change", changeEventListener);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map