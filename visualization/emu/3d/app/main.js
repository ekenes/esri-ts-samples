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
define(["require", "exports", "esri/Map", "esri/views/SceneView", "esri/layers/FeatureLayer", "esri/geometry", "../app/ExaggeratedBathymetryLayer", "./depthUtils", "./rendererUtils", "esri/widgets/Home", "esri/widgets/BasemapToggle", "esri/widgets/Legend", "esri/widgets/LayerList", "esri/widgets/Expand", "esri/widgets/Slice"], function (require, exports, EsriMap, SceneView, FeatureLayer, geometry_1, ExaggeratedBathymetryLayer_1, depthUtils_1, rendererUtils_1, Home, BasemapToggle, Legend, LayerList, Expand, Slice) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        function filterChange() {
            var depthExpression = depthFilter.value;
            var emuExpression = emuFilter.value;
            var dataExpression = filterCheckbox.checked ? colorField1Select.value + " <= " + dataFilter.value : "1=1";
            var expression = "(" + depthExpression + ") AND (" + dataExpression + ") AND (" + emuExpression + ")";
            layer.definitionExpression = expression;
        }
        function changeEventListener() {
            if (colorField1Select.value === "Cluster37") {
                colorField2Select.disabled = true;
                destroyColorSlider();
                getEMUClusterVisualization();
            }
            else {
                if (colorField2Select.value === "") {
                    colorField2Select.disabled = false;
                    displayMean.style.visibility = /*themeOptions.value === "centered-on" ? "visible" : */ "hidden";
                    displayVariable.innerHTML = colorField1Select.selectedOptions[0].text;
                    if (colorField1Select.value === "salinity") {
                        displayUnit.innerHTML = "";
                    }
                    else {
                        displayUnit.innerHTML = colorField1Select.value === "temp" ? " °C" : " µmol/l";
                    }
                    rendererUtils_1.generateContinuousVisualization();
                }
                else {
                    destroyColorSlider();
                    generateRelationshipVisualization();
                }
            }
        }
        function getUniqueValueVisualization() {
            var symbolType = cylinderSymbolsUsed ? "object" : "icon";
            var renderer = layer.renderer.clone();
            renderer.uniqueValueInfos.forEach(function (info) {
                var color = info.symbol.color ? info.symbol.color.clone() : info.symbol.symbolLayers.getItemAt(0).material.color.clone();
                info.symbol = createSymbol(color, symbolType);
            });
            if (symbolType === "object") {
                renderer.visualVariables = [{
                        type: "size",
                        valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
                        valueUnit: "meters",
                        axis: "height"
                    }, {
                        type: "size",
                        useSymbolValue: true,
                        axis: "width-and-depth"
                    }];
            }
            layer.renderer = renderer;
        }
        function getEMUClusterVisualization() {
            var symbolType = cylinderSymbolsUsed ? "object" : "icon";
            var renderer = {
                type: "unique-value",
                field: "Cluster37",
                defaultSymbol: createSymbol("darkgray", symbolType),
                defaultLabel: "no classification",
                uniqueValueInfos: [{
                        value: 10,
                        label: "EMU 10",
                        symbol: createSymbol([117, 112, 230], symbolType)
                    }, {
                        value: 13,
                        label: "EMU 13",
                        symbol: createSymbol([54, 71, 153], symbolType)
                    }, {
                        value: 33,
                        label: "EMU 33",
                        symbol: createSymbol([117, 145, 255], symbolType)
                    }, {
                        value: 24,
                        label: "EMU 24",
                        symbol: createSymbol([235, 169, 212], symbolType)
                    }, {
                        value: 26,
                        label: "EMU 26",
                        symbol: createSymbol([147, 101, 230], symbolType)
                    }, {
                        value: 18,
                        label: "EMU 18",
                        symbol: createSymbol([188, 90, 152], symbolType)
                    }, {
                        value: 36,
                        label: "EMU 36",
                        symbol: createSymbol([26, 82, 170], symbolType)
                    }, {
                        value: 14,
                        label: "EMU 14",
                        symbol: createSymbol([70, 82, 144], symbolType)
                    }]
            };
            if (symbolType === "object") {
                renderer.visualVariables = [{
                        type: "size",
                        valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
                        valueUnit: "meters",
                        axis: "height"
                    }, {
                        type: "size",
                        useSymbolValue: true,
                        axis: "width-and-depth"
                    }];
            }
            layer.renderer = renderer;
        }
        function destroyColorSlider() {
            if (colorSlider) {
                colorSlider.destroy();
                colorSlideChangeEvent.remove();
                colorSlideSlideEvent.remove();
                colorSlider = null;
            }
        }
        function generateRelationshipVisualization() {
            var params = {
                // relationshipScheme: schemes.secondarySchemes[8],
                layer: layer,
                view: view,
                basemap: map.basemap,
                field1: {
                    field: colorField1Select.value
                },
                field2: {
                    field: colorField2Select.value
                },
                classificationMethod: "quantile",
                focus: "HH"
            };
            return relationshipRendererCreator.createRenderer(params)
                .then(function (response) {
                var symbolType = cylinderSymbolsUsed ? "object" : "icon";
                var renderer = response.renderer;
                var uniqueValueInfos;
                if (cylinderSymbolsUsed) {
                    uniqueValueInfos = renderer.uniqueValueInfos.map(function (info) {
                        info.symbol = createSymbol(info.symbol.color.clone(), symbolType);
                        switch (info.value) {
                            case "HH":
                                info.label = "High " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                                break;
                            case "HL":
                                info.label = "High " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                                break;
                            case "LH":
                                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                                break;
                            case "LL":
                                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                                break;
                        }
                        return info;
                    });
                    renderer.defaultSymbol = createSymbol([128, 128, 128], symbolType);
                    renderer.visualVariables = [{
                            type: "size",
                            valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
                            valueUnit: "meters",
                            axis: "height"
                        }, {
                            type: "size",
                            useSymbolValue: true,
                            axis: "width-and-depth"
                        }];
                }
                else {
                    uniqueValueInfos = renderer.uniqueValueInfos.map(function (info) {
                        switch (info.value) {
                            case "HH":
                                info.label = "High " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                                break;
                            case "HL":
                                info.label = "High " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                                break;
                            case "LH":
                                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", High " + colorField2Select.selectedOptions[0].text;
                                break;
                            case "LL":
                                info.label = "Low " + colorField1Select.selectedOptions[0].text + ", Low " + colorField2Select.selectedOptions[0].text;
                                break;
                        }
                        return info;
                    });
                }
                renderer.uniqueValueInfos = uniqueValueInfos;
                layer.renderer = renderer;
            });
        }
        var colorField1Select, colorField2Select, depthFilter, dataFilter, emuFilter, dataFilterValue, displayMean, displayVariable, displayUnit, colorSlider, cylinderSymbolsUsed, dataMinElem, dataMaxElem, filterCheckbox, dataFilterContainer, colorSlideEvent, exaggeration, studyArea, depth, bathymetryLayer, map, view, layer, depthRuler, layerView, layerList, layerListExpand, legend, legendExpand, colorSliderExpand, filtersExpand, sliceExpand;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    colorField1Select = document.getElementById("color-field1-select");
                    colorField2Select = document.getElementById("color-field2-select");
                    depthFilter = document.getElementById("depth-filter");
                    dataFilter = document.getElementById("data-filter");
                    emuFilter = document.getElementById("emu-filter");
                    dataFilterValue = document.getElementById("data-value");
                    displayMean = document.getElementById("display-mean");
                    displayVariable = document.getElementById("display-variable");
                    displayUnit = document.getElementById("display-unit");
                    colorSlider = null;
                    cylinderSymbolsUsed = false;
                    dataMinElem = document.getElementById("data-min");
                    dataMaxElem = document.getElementById("data-max");
                    filterCheckbox = document.getElementById("filter-data-check");
                    dataFilterContainer = document.getElementById("data-filter-container");
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
                        outFields: ["*"],
                        screenSizePerspectiveEnabled: false,
                        elevationInfo: {
                            mode: "absolute-height",
                            featureExpressionInfo: {
                                expression: "$feature.UnitTop" + "*" + exaggeration
                            },
                            unit: "meters"
                        }
                    });
                    map.add(layer);
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    depthRuler = depthUtils_1.createDepthRulerLayer(view, studyArea, depth, exaggeration);
                    map.add(depthRuler);
                    return [4 /*yield*/, layer.when()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, view.whenLayerView(layer)];
                case 3:
                    layerView = _a.sent();
                    layerView.maximumNumberOfFeatures = 100000;
                    rendererUtils_1.generateContinuousVisualization({
                        view: view,
                        layer: layer,
                        exaggeration: exaggeration,
                        field: colorField1Select.value
                    });
                    emuFilter.addEventListener("change", filterChange);
                    symbolCheck.addEventListener("click", function () {
                        rendererUtils_1.generateContinuousVisualization();
                    });
                    ///////////////////////////////////////
                    //
                    // Widgets
                    //
                    //////////////////////////////////////
                    // Display mean
                    view.ui.add(displayMean, "top-right");
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
                        content: new Slice({ view: view }),
                        expandIconClass: "esri-icon-search",
                        group: "top-left"
                    });
                    view.ui.add(sliceExpand, "top-left");
                    colorField1Select.addEventListener("change", changeEventListener);
                    colorField2Select.addEventListener("change", changeEventListener);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map