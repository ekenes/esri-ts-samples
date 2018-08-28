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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/LayerList", "esri/layers/MapImageLayer", "esri/renderers/smartMapping/creators/color"], function (require, exports, EsriMap, MapView, LayerList, MapImageLayer, colorRendererCreator) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        // Generates a renderer using the feature layer and
        // sets the renderer on the sublayer instance
        function createRenderer() {
            return __awaiter(this, void 0, void 0, function () {
                var params, response, selectedAncestry;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = {
                                // set FeatureLayer as input
                                layer: ancestryFeatureLayer,
                                basemap: map.basemap,
                                // Arcade is used to normalize and round the data
                                valueExpression: "Round( ( $feature['" + ancestrySelect.value + "'] / $feature['states.POP2007'] ) * 100, 1);",
                                view: view,
                                classificationMethod: classSelect.value
                            };
                            return [4 /*yield*/, colorRendererCreator.createClassBreaksRenderer(params)];
                        case 1:
                            response = _a.sent();
                            // set the renderer on the sublayer
                            ancestrySublayer.renderer = response.renderer;
                            selectedAncestry = ancestrySelect.options[ancestrySelect.selectedIndex].text;
                            if (!map.layers.includes(layer)) {
                                map.add(layer);
                            }
                            // Update the popupTemplate to display data from the selected field
                            ancestrySublayer.popupTemplate = {
                                title: "{states.STATE_NAME}",
                                content: "{ancestry." + selectedAncestry + "} of the {states.POP2007} people in {states.STATE_NAME} have "
                                    + selectedAncestry + " ancestry.",
                                expressionInfos: [{
                                        name: "per_ancestry",
                                        expression: response.renderer.valueExpression
                                    }],
                                fieldInfos: [{
                                        fieldName: "states.POP2007",
                                        format: {
                                            digitSeparator: true,
                                            places: 0
                                        }
                                    }, {
                                        fieldName: "ancestry." + selectedAncestry,
                                        format: {
                                            digitSeparator: true,
                                            places: 0
                                        }
                                    }]
                            };
                            return [2 /*return*/];
                    }
                });
            });
        }
        var map, view, ancestrySelect, classSelect, layerList, layer, ancestrySublayer, ancestryFeatureLayer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    map = new EsriMap({
                        basemap: "hybrid"
                    });
                    view = new MapView({
                        map: map,
                        container: "viewDiv",
                        zoom: 5,
                        center: [-101.088, 40.969]
                    });
                    ancestrySelect = document.getElementById("ancestry-select");
                    classSelect = document.getElementById("classification-select");
                    layerList = new LayerList({
                        view: view,
                        listItemCreatedFunction: function (event) {
                            var item = event.item;
                            item.panel = {
                                content: [document.getElementById("infoDiv"), "legend"],
                                open: true
                            };
                        }
                    });
                    view.ui.add(layerList, "top-right");
                    layer = new MapImageLayer({
                        url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/AGP/Census/MapServer",
                        title: "United States Population",
                        listMode: "hide-children",
                        sublayers: [{
                                title: "% population with selected ancestry",
                                id: 0,
                                opacity: 0.75,
                                source: {
                                    type: "data-layer",
                                    dataSource: {
                                        type: "join-table",
                                        leftTableSource: {
                                            type: "map-layer",
                                            mapLayerId: 3
                                        },
                                        rightTableSource: {
                                            type: "data-layer",
                                            dataSource: {
                                                type: "table",
                                                workspaceId: "CensusFileGDBWorkspaceID",
                                                dataSourceName: "ancestry"
                                            }
                                        },
                                        leftTableKey: "STATE_NAME",
                                        rightTableKey: "State",
                                        joinType: "left-outer-join"
                                    }
                                }
                            }]
                    });
                    ancestrySublayer = layer.sublayers.find(function (sublayer) {
                        return sublayer.title === "% population with selected ancestry";
                    });
                    ancestryFeatureLayer = ancestrySublayer.createFeatureLayer();
                    // Populate one of the select elements with options for exploring
                    // different ancestry types.
                    return [4 /*yield*/, ancestryFeatureLayer.load()];
                case 1:
                    // Populate one of the select elements with options for exploring
                    // different ancestry types.
                    _a.sent();
                    ancestryFeatureLayer.fields.filter(function (field) {
                        return field.name.slice(0, 8) === "ancestry"
                            && field.name.indexOf("OBJECTID") === -1
                            && field.name.indexOf("State") === -1;
                    }).forEach(function (field) {
                        var option = document.createElement("option");
                        option.value = field.name;
                        option.text = field.name.slice(9, 30);
                        ancestrySelect.appendChild(option);
                    });
                    createRenderer();
                    ancestrySelect.addEventListener("change", createRenderer);
                    classSelect.addEventListener("change", createRenderer);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map