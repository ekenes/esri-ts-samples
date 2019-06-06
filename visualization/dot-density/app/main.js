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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/widgets/BasemapToggle", "esri/widgets/Search", "esri/widgets/Expand", "esri/widgets/Slider", "esri/layers/FeatureLayer", "esri/renderers/smartMapping/symbology/dotDensity", "esri/renderers/smartMapping/creators/dotDensity", "esri/renderers/smartMapping/heuristics/scaleRange", "app/ArcadeExpressions"], function (require, exports, EsriMap, MapView, Legend, BasemapToggle, Search, Expand, Slider, FeatureLayer, dotDensitySchemes, dotDensityRendererCreator, scaleRange, ArcadeExpressions_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    try {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            // function to retrieve query parameters (in this case only id)
            function getUrlParam() {
                var queryParams = document.location.search.substr(1);
                var result = {};
                queryParams.split("&").forEach(function (part) {
                    var item = part.split("=");
                    result[item[0]] = decodeURIComponent(item[1]);
                });
                return result.url;
            }
            // function to set an id as a url param
            function setUrlParam(url) {
                window.history.pushState("", "", window.location.pathname + "?url=" + url);
            }
            function createFieldOptions() {
                return __awaiter(this, void 0, void 0, function () {
                    var validFieldTypes, excludedFieldNames, selectedFields;
                    return __generator(this, function (_a) {
                        validFieldTypes = ["small-integer", "integer", "single", "double", "long"];
                        excludedFieldNames = ["HasData", "ENRICH_FID"];
                        selectedFields = [];
                        layer.fields.filter(function (field) {
                            return (validFieldTypes.indexOf(field.type) > -1) &&
                                (excludedFieldNames.indexOf(field.name) === -1);
                        }).forEach(function (field, i) {
                            var option = document.createElement("option");
                            option.value = field.name;
                            option.text = field.alias;
                            option.title = field.alias;
                            option.selected = i < 1;
                            fieldList.appendChild(option);
                            if (option.selected) {
                                selectedFields.push(field.name);
                            }
                        });
                        return [2 /*return*/, selectedFields];
                    });
                });
            }
            function updateSlider(value, max) {
                if (value >= max || dotValueInput.min >= max) {
                    max = value + dotValueInput.min + max;
                }
                dotValueInput.values = null;
                dotValueInput.max = max;
                dotValueInput.values = [value];
                dotValueInput.tickConfigs[0].values = [value];
                dotValueTick.onclick = function () {
                    dotValueInput.viewModel.setValue(0, value);
                };
                dotValueTickLabel.onclick = function () {
                    dotValueInput.viewModel.setValue(0, value);
                };
            }
            function createSchemeOptions() {
                allSchemes = [availableSchemes.primaryScheme].concat(availableSchemes.secondarySchemes);
                allSchemes.forEach(function (scheme, i) {
                    var option = document.createElement("option");
                    option.value = i.toString();
                    option.text = scheme.name;
                    option.selected = selectedSchemeIndex === i;
                    schemeList.appendChild(option);
                });
            }
            function updateRendererFromDotValue() {
                var oldRenderer = layer.renderer;
                var newRenderer = oldRenderer.clone();
                newRenderer.dotValue = dotValueInput.values[0];
                layer.renderer = newRenderer;
            }
            function getAttributes() {
                var selectedOptions = [].slice.call(fieldList.selectedOptions);
                return selectedOptions.map(function (option, i) {
                    return {
                        field: option.value,
                        // valueExpression: `$feature.${option.value}`,
                        label: option.text
                    };
                });
            }
            function updateRenderer() {
                return __awaiter(this, void 0, void 0, function () {
                    var ddRendererResponse, renderer, dotValue, dotMax;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                attributes = getAttributes();
                                return [4 /*yield*/, createDotDensityRenderer()];
                            case 1:
                                ddRendererResponse = _a.sent();
                                console.log(ddRendererResponse);
                                renderer = ddRendererResponse.renderer;
                                dotValue = renderer.dotValue;
                                dotMax = renderer.authoringInfo.maxSliderValue;
                                layer.renderer = renderer;
                                layer.popupTemplate = ArcadeExpressions_1.generateTopListPopupTemplate(attributes);
                                if (!map.layers.includes(layer)) {
                                    map.add(layer);
                                }
                                updateSlider(dotValue, dotMax);
                                return [2 /*return*/];
                        }
                    });
                });
            }
            /**
             * Creates a predominance renderer if 2 or more fields are selected,
             * or a continuous size renderer if 1 field is selected
             */
            function createDotDensityRenderer() {
                return __awaiter(this, void 0, void 0, function () {
                    var unit, outlineOptimizationEnabled, dotBlendingEnabled, dotValueOptimizationEnabled, dotDensityScheme, params;
                    return __generator(this, function (_a) {
                        unit = unitValueInput.value;
                        outlineOptimizationEnabled = outlineInput.checked;
                        dotBlendingEnabled = blendDotsInput.checked;
                        dotValueOptimizationEnabled = dotValueScaleInput.checked;
                        dotDensityScheme = allSchemes[selectedSchemeIndex];
                        params = {
                            layer: layer,
                            view: view,
                            attributes: attributes,
                            basemap: view.map.basemap,
                            dotValueOptimizationEnabled: dotValueOptimizationEnabled,
                            dotBlendingEnabled: dotBlendingEnabled,
                            outlineOptimizationEnabled: outlineOptimizationEnabled,
                            legendOptions: {
                                unit: unit
                            },
                            dotDensityScheme: dotDensityScheme,
                        };
                        return [2 /*return*/, dotDensityRendererCreator.createRenderer(params)];
                    });
                });
            }
            function supportsDotDensity(layer) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, layer.load()];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, layer.geometryType === "polygon"];
                        }
                    });
                });
            }
            function zoomToLayer(layer) {
                return __awaiter(this, void 0, void 0, function () {
                    var extentResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, layer.load()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, layer.queryExtent()];
                            case 2:
                                extentResponse = _a.sent();
                                return [2 /*return*/, view.goTo(extentResponse.extent)];
                        }
                    });
                });
            }
            var url, layer, map, view, dotValueTick, dotValueTickLabel, dotValueInput, scaleRangeSuggestion, scaleRangeSlider, dotValueScaleInput, blendDotsInput, outlineInput, unitValueInput, refreshDotPlacement, schemeList, seedInput, toggleScale, seed, availableSchemes, fieldList, selectedSchemeIndex, allSchemes, attributes, supportedLayer, selectedFields;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = getUrlParam();
                        if (!url) {
                            url = "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/USA_County_Crops_2007/FeatureServer/0";
                            setUrlParam(url);
                        }
                        layer = new FeatureLayer({
                            url: url,
                            outFields: ["*"],
                            opacity: 0.9,
                            maxScale: 0,
                            minScale: 0
                        });
                        map = new EsriMap({
                            basemap: {
                                portalItem: {
                                    id: "9d5cf81cf8ce437584cedc8a2ee4ea4e"
                                }
                            }
                        });
                        view = new MapView({
                            map: map,
                            container: "viewDiv"
                        });
                        view.ui.add([new Expand({
                                content: new Legend({ view: view }),
                                view: view,
                                group: "top-left"
                            }), new Expand({
                                content: new Search({ view: view }),
                                view: view,
                                group: "top-left"
                            }), new Expand({
                                content: new BasemapToggle({
                                    view: view,
                                    nextBasemap: "gray-vector"
                                }),
                                view: view,
                                expandIconClass: "esri-icon-basemap",
                                group: "top-left"
                            })], "top-left");
                        return [4 /*yield*/, view.when()];
                    case 1:
                        _a.sent();
                        dotValueInput = new Slider({
                            container: "dot-value-input",
                            min: 1,
                            max: 5000,
                            values: [2],
                            rangeLabelsVisible: true,
                            rangeLabelInputsEnabled: true,
                            labelsVisible: true,
                            labelInputsEnabled: true,
                            precision: 0,
                            tickConfigs: [{
                                    mode: "position",
                                    labelsVisible: true,
                                    values: [1],
                                    tickCreatedFunction: function (value, tickElement, labelElement) {
                                        dotValueTick = tickElement;
                                        dotValueTickLabel = labelElement;
                                    },
                                }],
                            labelFormatFunction: function (value, type) {
                                return value.toFixed(0);
                            }
                        });
                        return [4 /*yield*/, scaleRange({ layer: layer, view: view })];
                    case 2:
                        scaleRangeSuggestion = _a.sent();
                        scaleRangeSlider = new Slider({
                            container: "scale-range-slider",
                            min: Math.round(scaleRangeSuggestion.maxScale * 0.25),
                            max: Math.round(scaleRangeSuggestion.minScale * 5),
                            values: [scaleRangeSuggestion.maxScale, scaleRangeSuggestion.minScale],
                            rangeLabelsVisible: true,
                            rangeLabelInputsEnabled: true,
                            labelsVisible: true,
                            labelInputsEnabled: true,
                            precision: 0,
                            labelFormatFunction: function (value, type) {
                                if (type === "min") {
                                    return "house";
                                }
                                else if (type === "max") {
                                    return "country";
                                }
                                else {
                                    return value.toFixed(0);
                                }
                            }
                        });
                        scaleRangeSlider.on("value-change", function (event) {
                            if (event.index === 1) {
                                layer.minScale = event.value;
                            }
                            if (event.index === 0) {
                                layer.maxScale = event.value;
                            }
                        });
                        dotValueScaleInput = document.getElementById("dot-value-scale-input");
                        blendDotsInput = document.getElementById("blend-dots-input");
                        outlineInput = document.getElementById("outline-input");
                        unitValueInput = document.getElementById("unit-value-input");
                        refreshDotPlacement = document.getElementById("refresh-dot-placement");
                        schemeList = document.getElementById("scheme-list");
                        seedInput = document.getElementById("seed-input");
                        toggleScale = document.getElementById("toggle-scale");
                        toggleScale.addEventListener("change", function (event) {
                            var checked = event.target.checked;
                            if (checked) {
                                layer.minScale = scaleRangeSlider.values[1];
                                layer.maxScale = scaleRangeSlider.values[0];
                            }
                            else {
                                layer.minScale = 0;
                                layer.maxScale = 0;
                            }
                        });
                        seed = parseInt(seedInput.value);
                        refreshDotPlacement.addEventListener("click", function () {
                            seed = Math.round(Math.random() * 100000);
                            seedInput.value = seed.toString();
                            var oldRenderer = layer.renderer;
                            var newRenderer = oldRenderer.clone();
                            newRenderer.seed = seed;
                            layer.renderer = newRenderer;
                        });
                        availableSchemes = dotDensitySchemes.getSchemes({
                            basemap: view.map.basemap,
                            numColors: 10
                        });
                        fieldList = document.getElementById("fieldList");
                        selectedSchemeIndex = 0;
                        // Each time the user changes the value of one of the DOM elements
                        // (list box and two checkboxes), then generate a new predominance visualization
                        fieldList.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                attributes = getAttributes();
                                updateRenderer();
                                return [2 /*return*/];
                            });
                        }); });
                        dotValueInput.on("value-change", updateRendererFromDotValue);
                        dotValueScaleInput.addEventListener("change", updateRenderer);
                        blendDotsInput.addEventListener("change", function () {
                            var oldRenderer = layer.renderer;
                            var newRenderer = oldRenderer.clone();
                            newRenderer.dotBlendingEnabled = blendDotsInput.checked;
                            layer.renderer = newRenderer;
                        });
                        outlineInput.addEventListener("change", updateRenderer);
                        unitValueInput.addEventListener("change", updateRenderer);
                        schemeList.addEventListener("change", function (event) {
                            selectedSchemeIndex = parseInt(event.target.value);
                            updateRenderer();
                        });
                        seedInput.addEventListener("change", updateRenderer);
                        return [4 /*yield*/, supportsDotDensity(layer)];
                    case 3:
                        supportedLayer = _a.sent();
                        if (!!supportedLayer) return [3 /*break*/, 4];
                        alert("Invalid layer. Please provide a valid polygon layer.");
                        return [3 /*break*/, 8];
                    case 4: return [4 /*yield*/, layer.load()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, zoomToLayer(layer)];
                    case 6:
                        _a.sent();
                        createSchemeOptions();
                        return [4 /*yield*/, createFieldOptions()];
                    case 7:
                        selectedFields = _a.sent();
                        updateRenderer();
                        view.watch("scale", function (scale) {
                            // Update dot value on slider as view scale changes
                            var renderer = layer.renderer;
                            var dotValue = renderer.calculateDotValue(scale);
                            dotValueInput.values = [Math.round(dotValue)];
                        });
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        }); })();
    }
    catch (e) {
        console.error(e);
    }
});
//# sourceMappingURL=main.js.map