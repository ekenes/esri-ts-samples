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
define(["require", "exports", "esri/Map", "esri/views/SceneView", "esri/layers/FeatureLayer", "esri/widgets/Legend", "esri/widgets/Expand", "esri/renderers/smartMapping/symbology/relationship", "esri/renderers/smartMapping/creators/relationship", "esri/renderers/smartMapping/creators/size"], function (require, exports, EsriMap, SceneView, FeatureLayer, Legend, Expand, relationshipSchemes, relationshipRendererCreator, sizeRendererCreator) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        /**
         * Creates a relationship renderer based on the Maximum
         * wait time for public transit during rush hour and the
         * percent of the population that belongs to a minority.
         */
        function createRelationshipRenderer() {
            return __awaiter(this, void 0, void 0, function () {
                var schemes, params;
                return __generator(this, function (_a) {
                    schemes = relationshipSchemes.getSchemes({
                        basemap: map.basemap,
                        geometryType: "mesh"
                    });
                    params = {
                        relationshipScheme: schemes.secondarySchemes[1],
                        layer: layer,
                        view: view,
                        basemap: map.basemap,
                        field1: {
                            field: "MaxWaitTime4_6"
                        },
                        field2: {
                            field: "PercentMinority"
                        },
                        focus: "HH",
                        symbolType: "3d-volumetric"
                    };
                    return [2 /*return*/, relationshipRendererCreator.createRenderer(params)];
                });
            });
        }
        /**
         * Create a size visual variable based on the total minority population
         * and apply it to the relationship renderer
         */
        function createSizeVariable(response) {
            return __awaiter(this, void 0, void 0, function () {
                var renderer, sizeResponse;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            renderer = response.renderer;
                            return [4 /*yield*/, sizeRendererCreator.createVisualVariables({
                                    layer: layer,
                                    field: "MINORITYCY",
                                    basemap: map.basemap,
                                    view: view,
                                    worldScale: true,
                                    axis: "height"
                                })];
                        case 1:
                            sizeResponse = _a.sent();
                            renderer.visualVariables = sizeResponse.visualVariables;
                            return [2 /*return*/, renderer];
                    }
                });
            });
        }
        /**
         * Applies a relationship renderer to a layer after updating the legend
         * text to some meaningful description.
         *
         * @param renderer A relationship renderer instance
         */
        function applyRenderer(renderer) {
            var uniqueValueInfos = renderer.uniqueValueInfos.map(function (info) {
                switch (info.value) {
                    case "HH":
                        info.label = "Longer Waits & More Minorities";
                        break;
                    case "HL":
                        info.label = "Longer Waits";
                        break;
                    case "LH":
                        info.label = "More Minority Population";
                        break;
                    case "LL":
                        info.label = "Shorter Waits & Fewer Minorities";
                        break;
                }
                return info;
            });
            renderer.uniqueValueInfos = uniqueValueInfos;
            layer.renderer = renderer;
        }
        var layer, map, view, legend, relationshipResponse, sizeResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = new FeatureLayer({
                        url: "https://services1.arcgis.com/4yjifSiIG17X0gW4/ArcGIS/rest/services/LA_Stops_Enriched/FeatureServer/0"
                    });
                    map = new EsriMap({
                        basemap: "gray",
                        ground: "world-elevation",
                        layers: [layer]
                    });
                    view = new SceneView({
                        container: "viewDiv",
                        map: map,
                        camera: {
                            position: {
                                spatialReference: {
                                    wkid: 3857
                                },
                                x: -13189768,
                                y: 3992496,
                                z: 19388
                            },
                            heading: 31,
                            tilt: 60
                        },
                        // Set dock options on the view's popup
                        popup: {
                            dockEnabled: true,
                            dockOptions: {
                                breakpoint: false
                            }
                        },
                        // enable shadows to be cast from the features
                        environment: {
                            lighting: {
                                directShadowsEnabled: true
                            }
                        }
                    });
                    legend = new Expand({
                        view: view,
                        content: new Legend({ view: view }),
                        expandIconClass: "esri-icon-key"
                    });
                    legend.expand();
                    view.ui.add(legend, "bottom-left");
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createRelationshipRenderer()];
                case 2:
                    relationshipResponse = _a.sent();
                    return [4 /*yield*/, createSizeVariable(relationshipResponse)];
                case 3:
                    sizeResponse = _a.sent();
                    applyRenderer(sizeResponse);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map