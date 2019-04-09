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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/Legend", "esri/widgets/BasemapToggle", "esri/widgets/Search", "esri/widgets/Expand", "esri/layers/FeatureLayer", "esri/renderers/smartMapping/symbology/predominance", "esri/tasks/support/StatisticDefinition", "esri/renderers/smartMapping/symbology/type", "esri/renderers", "app/ArcadeExpressions", "./DotDensityUtils"], function (require, exports, EsriMap, MapView, Legend, BasemapToggle, Search, Expand, FeatureLayer, predominanceSchemes, StatisticDefinition, typeSchemes, renderers_1, ArcadeExpressions_1, DotDensityUtils_1) {
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
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, layer.load()];
                            case 1:
                                _a.sent();
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
                        }
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
            function updateSliderMax(max) {
                dotValueInput.max = max.toString();
            }
            function updateSliderValue(value) {
                dotValueInput.value = value.toString();
                dotValueDisplay.innerText = value.toString();
                var max = parseInt(dotValueInput.max);
                if (value >= max) {
                    dotValueInput.max = value.toString();
                }
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
                layer.renderer = createDotDensityRenderer();
                layer.popupTemplate = ArcadeExpressions_1.generateTopListPopupTemplate(attributes);
            }
            /**
             * Creates a predominance renderer if 2 or more fields are selected,
             * or a continuous size renderer if 1 field is selected
             */
            function createDotDensityRenderer() {
                var unit = unitValueInput.value;
                var outline = outlineInput.checked ? { width: "0.5px", color: [128, 128, 128, 0.4] } : null;
                var blendDots = blendDotsInput.checked;
                var dotSize = 1;
                var referenceDotValue = parseInt(dotValueInput.value);
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
            var url, layer, map, view, dotValueInput, dotValueDisplay, dotValueScaleInput, blendDotsInput, outlineInput, unitValueInput, refreshDotPlacement, schemeList, seedInput, seed, availableTypeSchemes, availablePredominanceSchemes, fieldList, selectedSchemeIndex, allSchemes, attributes, supportedLayer, selectedFields, maxAverage, suggestedDotValue;
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
                            },
                            layers: [layer]
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
                        _a.sent();
                        dotValueInput = document.getElementById("dot-value-input");
                        dotValueDisplay = document.getElementById("dot-value-display");
                        dotValueScaleInput = document.getElementById("dot-value-scale-input");
                        blendDotsInput = document.getElementById("blend-dots-input");
                        outlineInput = document.getElementById("outline-input");
                        unitValueInput = document.getElementById("unit-value-input");
                        refreshDotPlacement = document.getElementById("refresh-dot-placement");
                        schemeList = document.getElementById("scheme-list");
                        seedInput = document.getElementById("seed-input");
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
                            var fields, maxAverage, suggestedDotValue;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        updateRenderer();
                                        fields = attributes.map(function (attribute) { return attribute.field; });
                                        return [4 /*yield*/, maxFieldsAverage(fields)];
                                    case 1:
                                        maxAverage = _a.sent();
                                        updateSliderMax(maxAverage);
                                        return [4 /*yield*/, DotDensityUtils_1.calculateSuggestedDotValue({
                                                layer: layer,
                                                view: view,
                                                fields: fields
                                            })];
                                    case 2:
                                        suggestedDotValue = _a.sent();
                                        console.log("suggested dot value: " + suggestedDotValue);
                                        updateSliderValue(suggestedDotValue);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        dotValueInput.addEventListener("input", function () {
                            updateRenderer();
                            dotValueDisplay.innerText = dotValueInput.value;
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
                    case 2:
                        supportedLayer = _a.sent();
                        if (!!supportedLayer) return [3 /*break*/, 3];
                        alert("Invalid layer. Please provide a valid polygon layer.");
                        return [3 /*break*/, 7];
                    case 3:
                        createSchemeOptions();
                        return [4 /*yield*/, createFieldOptions()];
                    case 4:
                        selectedFields = _a.sent();
                        return [4 /*yield*/, maxFieldsAverage(selectedFields)];
                    case 5:
                        maxAverage = _a.sent();
                        updateSliderMax(maxAverage);
                        return [4 /*yield*/, DotDensityUtils_1.calculateSuggestedDotValue({
                                layer: layer,
                                view: view,
                                fields: selectedFields
                            })];
                    case 6:
                        suggestedDotValue = _a.sent();
                        console.log("suggested dot value: " + suggestedDotValue);
                        updateSliderValue(suggestedDotValue);
                        zoomToLayer(layer);
                        updateRenderer();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); })();
    }
    catch (e) {
        console.error(e);
    }
});
//# sourceMappingURL=main.js.map