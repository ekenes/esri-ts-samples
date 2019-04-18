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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/widgets/BasemapToggle", "esri/widgets/Search", "esri/widgets/Expand", "esri/widgets/Slider", "esri/layers/FeatureLayer", "esri/renderers/smartMapping/symbology/predominance", "esri/renderers/smartMapping/heuristics/scaleRange", "esri/tasks/support/StatisticDefinition", "esri/renderers/smartMapping/symbology/type", "esri/renderers", "app/ArcadeExpressions", "./DotDensityUtils"], function (require, exports, EsriMap, MapView, Legend, BasemapToggle, Search, Expand, Slider, FeatureLayer, predominanceSchemes, scaleRange, StatisticDefinition, typeSchemes, renderers_1, ArcadeExpressions_1, DotDensityUtils_1) {
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
            function maxFieldsAverage(fields) {
                return __awaiter(this, void 0, void 0, function () {
                    var statsQuery, statsResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                statsQuery = layer.createQuery();
                                statsQuery.outStatistics = [new StatisticDefinition({
                                        onStatisticField: fields.reduce(function (a, c) {
                                            return a + " + " + c;
                                        }),
                                        outStatisticFieldName: "avg_value",
                                        statisticType: "avg"
                                    })];
                                return [4 /*yield*/, layer.queryFeatures(statsQuery)];
                            case 1:
                                statsResponse = _a.sent();
                                console.log(statsResponse);
                                return [2 /*return*/, statsResponse.features[0].attributes.avg_value];
                        }
                    });
                });
            }
            function updateSlider(value, max) {
                dotValueInput.values = [value];
                dotValueInput.max = max;
            }
            function createSchemeOptions() {
                var typeSchemes = [availableTypeSchemes.primaryScheme].concat(availableTypeSchemes.secondarySchemes);
                var predominanceSchemes = [availablePredominanceSchemes.primaryScheme].concat(availablePredominanceSchemes.secondarySchemes);
                allSchemes = typeSchemes.concat(predominanceSchemes);
                allSchemes.forEach(function (scheme, i) {
                    var option = document.createElement("option");
                    option.value = i.toString();
                    option.text = "Color scheme No. " + i;
                    option.selected = selectedSchemeIndex === i;
                    schemeList.appendChild(option);
                });
            }
            function getAttributes() {
                var selectedOptions = [].slice.call(fieldList.selectedOptions);
                return selectedOptions.map(function (option, i) {
                    return {
                        field: option.value,
                        label: option.text,
                        color: allSchemes[selectedSchemeIndex].colors[i]
                    };
                });
            }
            function updateRenderer() {
                attributes = getAttributes();
                var ddRenderer = createDotDensityRenderer();
                layer.renderer = ddRenderer;
                layer.popupTemplate = ArcadeExpressions_1.generateTopListPopupTemplate(attributes);
                if (!map.layers.includes(layer)) {
                    map.add(layer);
                }
            }
            /**
             * Creates a predominance renderer if 2 or more fields are selected,
             * or a continuous size renderer if 1 field is selected
             */
            function createDotDensityRenderer() {
                var unit = unitValueInput.value;
                var outline = outlineInput.checked ? { width: "0.5px", color: [128, 128, 128, 0.2] } : null;
                var blendDots = blendDotsInput.checked;
                var dotSize = 1;
                var referenceDotValue = dotValueInput.values[0];
                var referenceScale = dotValueScaleInput.checked ? view.scale : null;
                seed = parseInt(seedInput.value);
                var params = {
                    attributes: attributes,
                    blendDots: blendDots,
                    legendOptions: {
                        unit: unit
                    },
                    outline: outline,
                    dotSize: dotSize,
                    referenceDotValue: referenceDotValue,
                    referenceScale: referenceScale,
                    seed: seed,
                };
                return new renderers_1.DotDensityRenderer(params);
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
            var url, layer, map, view, dotValueInput, scaleRangeSuggestion, scaleRangeSlider, dotValueScaleInput, blendDotsInput, outlineInput, unitValueInput, refreshDotPlacement, schemeList, seedInput, toggleScale, seed, availableTypeSchemes, availablePredominanceSchemes, fieldList, selectedSchemeIndex, allSchemes, attributes, supportedLayer, selectedFields, _a, dotValue, dotMax;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = getUrlParam();
                        if (!url) {
                            url = "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/USA_County_Crops_2007/FeatureServer/0";
                            setUrlParam(url);
                        }
                        layer = new FeatureLayer({
                            url: url,
                            // outFields: ["*"],
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
                            container: "viewDiv",
                            center: [-116.3126, 43.60703],
                            zoom: 11
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
                        _b.sent();
                        dotValueInput = new Slider({
                            container: "dot-value-input",
                            min: 1,
                            max: 5000,
                            values: [1],
                            rangeLabelsVisible: true,
                            rangeLabelInputsEnabled: true,
                            labelsVisible: true,
                            labelInputsEnabled: true,
                            precision: 0,
                            labelFormatFunction: function (value, type) {
                                return value.toFixed(0);
                            }
                        });
                        return [4 /*yield*/, scaleRange({ layer: layer, view: view })];
                    case 2:
                        scaleRangeSuggestion = _b.sent();
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
                        availableTypeSchemes = typeSchemes.getSchemes({
                            basemap: view.map.basemap,
                            geometryType: "polygon"
                        });
                        availablePredominanceSchemes = predominanceSchemes.getSchemes({
                            basemap: map.basemap,
                            geometryType: "polygon",
                            numColors: 10
                        });
                        fieldList = document.getElementById("fieldList");
                        selectedSchemeIndex = 0;
                        // Each time the user changes the value of one of the DOM elements
                        // (list box and two checkboxes), then generate a new predominance visualization
                        fieldList.addEventListener("change", function () { return __awaiter(_this, void 0, void 0, function () {
                            var fields, _a, dotValue, dotMax;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        attributes = getAttributes();
                                        fields = attributes.map(function (attribute) { return attribute.field; });
                                        return [4 /*yield*/, DotDensityUtils_1.calculateSuggestedDotValue({
                                                layer: layer,
                                                view: view,
                                                fields: fields
                                            })];
                                    case 1:
                                        _a = _b.sent(), dotValue = _a.dotValue, dotMax = _a.dotMax;
                                        console.log("suggested dot value: " + dotValue);
                                        updateSlider(dotValue, dotMax);
                                        updateRenderer();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        dotValueInput.on("value-change", function (event) {
                            updateRenderer();
                        });
                        dotValueScaleInput.addEventListener("change", updateRenderer);
                        blendDotsInput.addEventListener("change", updateRenderer);
                        outlineInput.addEventListener("change", updateRenderer);
                        unitValueInput.addEventListener("change", updateRenderer);
                        schemeList.addEventListener("change", function (event) {
                            selectedSchemeIndex = parseInt(event.target.value);
                            updateRenderer();
                        });
                        seedInput.addEventListener("change", updateRenderer);
                        return [4 /*yield*/, supportsDotDensity(layer)];
                    case 3:
                        supportedLayer = _b.sent();
                        if (!!supportedLayer) return [3 /*break*/, 4];
                        alert("Invalid layer. Please provide a valid polygon layer.");
                        return [3 /*break*/, 9];
                    case 4: return [4 /*yield*/, layer.load()];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, zoomToLayer(layer)];
                    case 6:
                        _b.sent();
                        createSchemeOptions();
                        console.log("createSchemeOptions done");
                        return [4 /*yield*/, createFieldOptions()];
                    case 7:
                        selectedFields = _b.sent();
                        console.log("selectedFields done");
                        return [4 /*yield*/, DotDensityUtils_1.calculateSuggestedDotValue({
                                layer: layer,
                                view: view,
                                fields: selectedFields
                            })];
                    case 8:
                        _a = _b.sent(), dotValue = _a.dotValue, dotMax = _a.dotMax;
                        console.log("suggested dot value: " + dotValue);
                        updateSlider(dotValue, dotMax);
                        updateRenderer();
                        console.log("updaterenderer done");
                        view.watch("scale", function (scale, oldScale) {
                            // Update dot value on slider as view scale changes
                            var renderer = layer.renderer;
                            var dotValue = renderer.calculateDotValue(scale);
                            dotValueInput.values = [Math.round(dotValue)];
                        });
                        _b.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        }); })();
    }
    catch (e) {
        console.error(e);
    }
});
//# sourceMappingURL=main.js.map