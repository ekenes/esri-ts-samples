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
define(["require", "exports", "esri/Map", "esri/views/SceneView", "esri/layers/FeatureLayer", "esri/geometry", "../app/ExaggeratedBathymetryLayer", "./depthUtils", "./rendererUtils", "esri/widgets/Home", "esri/widgets/BasemapToggle", "esri/widgets/Legend", "esri/widgets/LayerList", "esri/widgets/Expand", "esri/widgets/Slice", "./colorSliderUtils", "./filterUtils"], function (require, exports, EsriMap, SceneView, FeatureLayer, geometry_1, ExaggeratedBathymetryLayer_1, depthUtils_1, rendererUtils_1, Home, BasemapToggle, Legend, LayerList, Expand, Slice, colorSliderUtils_1, filterUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        function filterChange() {
            var emuExpression = emuFilter.value;
            var expression = "" + emuExpression;
            layer.definitionExpression = expression;
            // layerView.filter = new FeatureFilter({
            //   where: expression
            // })
        }
        function changeEventListener() {
            if (colorField1Select.value === "Cluster37") {
                displayMeanValueInfo.style.visibility = "hidden";
                colorField2Select.disabled = true;
                colorSliderUtils_1.destroyColorSlider();
                rendererUtils_1.setEMUClusterVisualization(layer, exaggeration, changeSymbolType);
            }
            else {
                if (colorField2Select.value === "") {
                    colorField2Select.disabled = false;
                    displayMeanValueInfo.style.visibility = "visible";
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
                        exaggeration: exaggeration,
                        field: colorField1Select.value,
                        symbolType: changeSymbolType,
                        theme: "centered-on"
                    });
                }
                else {
                    displayMeanValueInfo.style.visibility = "hidden";
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
                        },
                        exaggeration: exaggeration,
                        symbolType: changeSymbolType
                    });
                }
            }
            changeSymbolType = null;
        }
        var colorField1Select, colorField2Select, emuFilter, displayVariable, displayUnit, displayMeanValueInfo, exaggeration, changeSymbolType, studyArea, depth, bathymetryLayer, map, view, layer, depthRuler, layerView, clearFilterBtn, layerList, layerListExpand, legend, legendExpand, colorSliderExpand, filtersExpand, sliceExpand, sliceWidget;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    colorField1Select = document.getElementById("color-field1-select");
                    colorField2Select = document.getElementById("color-field2-select");
                    emuFilter = document.getElementById("emu-filter");
                    displayVariable = document.getElementById("display-variable");
                    displayUnit = document.getElementById("display-unit");
                    displayMeanValueInfo = document.getElementById("display-mean");
                    exaggeration = 100;
                    studyArea = new geometry_1.Extent({
                        spatialReference: {
                            wkid: 3857
                        },
                        xmin: 7834109,
                        ymin: -69576,
                        xmax: 8502026,
                        ymax: 907517
                    });
                    depth = -4000 * exaggeration;
                    bathymetryLayer = ExaggeratedBathymetryLayer_1.createBathymetryLayer(exaggeration);
                    map = new EsriMap({
                        basemap: "satellite",
                        ground: {
                            layers: [
                                bathymetryLayer
                            ]
                        }
                    });
                    view = new SceneView({
                        container: "viewDiv",
                        viewingMode: "local",
                        map: map,
                        padding: {
                            top: 40
                        },
                        popup: {
                            dockEnabled: true,
                            dockOptions: {
                                breakpoint: false,
                                position: "top-right"
                            }
                        },
                        camera: {
                            position: {
                                spatialReference: {
                                    wkid: 102100
                                },
                                x: 9040444,
                                y: -837938,
                                z: 247393
                            },
                            heading: 325,
                            tilt: 79
                        },
                        clippingArea: studyArea,
                        // Allows for navigating the camera below the surface
                        constraints: {
                            collision: {
                                enabled: false
                            },
                            tilt: {
                                max: 179.99
                            }
                        },
                        // Turns off atmosphere and stars settings
                        environment: {
                            atmosphere: null,
                            starsEnabled: false
                        }
                    });
                    layer = new FeatureLayer({
                        title: "EMU data points",
                        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/EMU_master_3857_2/FeatureServer/0",
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
                        },
                        screenSizePerspectiveEnabled: false,
                        elevationInfo: {
                            mode: "absolute-height",
                            featureExpressionInfo: {
                                expression: "$feature.UnitTop * " + exaggeration
                            },
                            unit: "meters"
                        }
                    });
                    map.add(layer);
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    depthRuler = depthUtils_1.createMeasurementReferenceLayer(view, studyArea, depth, exaggeration);
                    map.add(depthRuler);
                    return [4 /*yield*/, layer.when()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, view.whenLayerView(layer)];
                case 3:
                    layerView = _a.sent();
                    layerView.maximumNumberOfFeatures = 100000;
                    changeEventListener();
                    emuFilter.addEventListener("change", filterChange);
                    clearFilterBtn = document.getElementById("clear-filter-btn");
                    clearFilterBtn.addEventListener("click", function () {
                        filterUtils_1.clearLayerViewFilter(layerView);
                        filterUtils_1.clearDefinitionExpression(layer);
                    });
                    ///////////////////////////////////////
                    //
                    // Widgets
                    //
                    //////////////////////////////////////
                    // Display mean
                    view.ui.add(displayMeanValueInfo, "top-right");
                    // Home
                    view.ui.add(new Home({
                        view: view
                    }), "top-left");
                    // BasemapToggle
                    view.ui.add(new BasemapToggle({
                        view: view,
                        nextBasemap: "oceans"
                    }), "bottom-right");
                    layerList = new LayerList({
                        view: view,
                        container: document.createElement("div"),
                        listItemCreatedFunction: function (event) {
                            var item = event.item;
                            if (item.title === layer.title) {
                                item.actionsSections = [[{
                                            title: "Toggle 3D cylinders",
                                            className: "esri-icon-public",
                                            id: "toggle-3d-cylinders"
                                        }]];
                            }
                        }
                    });
                    layerList.on("trigger-action", function (event) {
                        if (event.action.id === "toggle-3d-cylinders") {
                            var symbolType = rendererUtils_1.getSymbolType(layer.renderer);
                            changeSymbolType = symbolType === "object" ? "icon" : "object";
                            changeEventListener();
                        }
                    });
                    layerListExpand = new Expand({
                        view: view,
                        content: layerList.container,
                        expandIconClass: "esri-icon-layer-list",
                        group: "top-left"
                    });
                    view.ui.add(layerListExpand, "top-left");
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
                    sliceExpand = new Expand({
                        view: view,
                        expandIconClass: "esri-icon-drag-vertical",
                    });
                    view.ui.add(sliceExpand, "bottom-left");
                    sliceExpand.watch("expanded", function (expanded) {
                        if (expanded) {
                            sliceWidget = new Slice({ view: view });
                            sliceExpand.content = sliceWidget;
                        }
                        else {
                            sliceWidget.destroy();
                            sliceWidget = null;
                            sliceExpand.content = null;
                        }
                    });
                    colorField1Select.addEventListener("change", changeEventListener);
                    colorField2Select.addEventListener("change", changeEventListener);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map