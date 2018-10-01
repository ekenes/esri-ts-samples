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
define(["require", "exports", "esri/WebMap", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/renderers", "esri/symbols", "esri/widgets/Legend"], function (require, exports, WebMap, MapView, FeatureLayer, renderers_1, symbols_1, Legend) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(_this, void 0, void 0, function () {
        // Updates the renderer with the new Arcade expression and the 
        // updated text reflecting the new value obtained from the clicked feature
        function updateRenderer(name, newValue) {
            var oldRenderer = chinaLayer.renderer;
            var newRenderer = oldRenderer.clone();
            newRenderer.valueExpression = createArcade(newValue);
            newRenderer.uniqueValueInfos.forEach(function (info, i) {
                info.label = (i !== 1) ? info.label.substring(0, 5) + " " + newValue + "%" : "Within +/- 1% of " + name + " (" + newValue + "%)";
            });
            newRenderer.valueExpressionTitle = "% population without formal education relative to " + name;
            chinaLayer.renderer = newRenderer;
        }
        // Creates an Arcade expression that categories each feature as either
        // above or below the input value
        function createArcade(value) {
            return "\n      var value = " + value + ";\n      var total = Sum( $feature.EDUC01_CY, $feature.EDUC02_CY, $feature.EDUC03_CY, \n        $feature.EDUC04_CY, $feature.EDUC05_CY, $feature.EDUC06_CY );\n\n      var percentTotalFeature = Round( ($feature." + visualizationField + " / total) * 100);\n      When( percentTotalFeature <= value + 1 && \n            percentTotalFeature >= value - 1, \"Similar\",\n            percentTotalFeature > value, \"Above\",\n            \"Below\" );\n    ";
        }
        function createSymbol(color, style) {
            return new symbols_1.SimpleFillSymbol({
                color: color,
                outline: {
                    color: "white",
                    width: 0.75
                },
                style: style ? style : "solid"
            });
        }
        var visualizationField, allFields, description, startValue, chinaLayer, map, view, chinaLayerView, highlight;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    visualizationField = "EDUC01_CY";
                    allFields = [
                        "EDUC01_CY",
                        "EDUC02_CY",
                        "EDUC03_CY",
                        "EDUC04_CY",
                        "EDUC05_CY",
                        "EDUC06_CY" // University and Above
                    ];
                    description = "Education in mainland China";
                    startValue = 5;
                    chinaLayer = new FeatureLayer({
                        portalItem: {
                            id: "7b1fb95ab77f40bf8aa09c8b59045449"
                        },
                        opacity: 0.7,
                        title: "" + description,
                        outFields: allFields.concat(["name"])
                    });
                    map = new WebMap({
                        basemap: {
                            portalItem: {
                                id: "eee15c389eec43ef98f1f55124b6a0cf"
                            }
                        },
                        layers: [chinaLayer]
                    });
                    view = new MapView({
                        map: map,
                        container: "viewDiv",
                        highlightOptions: {
                            color: [0, 0, 0],
                            fillOpacity: 0
                        },
                        center: [104.2530, 33.8218],
                        zoom: 5
                    });
                    view.ui.add(new Legend({ view: view }), "bottom-left");
                    return [4 /*yield*/, view.when()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, chinaLayer.when()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, view.whenLayerView(chinaLayer)];
                case 3:
                    chinaLayerView = _a.sent();
                    // render the layer with an Arcade expression
                    // Features where more than 5% of the population didn't 
                    // complete formal education are rendered in red. Features
                    // where less than 5% of the population didn't complete
                    // formal education will be rendered in orange
                    // Features where 5% of the population didn't complete
                    // formal education will be rendered in gray
                    chinaLayer.renderer = new renderers_1.UniqueValueRenderer({
                        valueExpression: createArcade(startValue),
                        valueExpressionTitle: "% population without formal education",
                        uniqueValueInfos: [{
                                value: "Above",
                                symbol: createSymbol("#b30000"),
                                label: "Above " + startValue + "%"
                            }, {
                                value: "Similar",
                                symbol: createSymbol("gray"),
                                label: "Similar (within +/- 1%)"
                            }, {
                                value: "Below",
                                symbol: createSymbol("orange"),
                                label: "Below " + startValue + "%"
                            }],
                        defaultLabel: "No data",
                        defaultSymbol: createSymbol("black", "backward-diagonal")
                    });
                    view.on("click", function (event) { return __awaiter(_this, void 0, void 0, function () {
                        var hitTestResponse, result, attributes, newValue, totalValue, midPoint, name;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, view.hitTest(event)];
                                case 1:
                                    hitTestResponse = _a.sent();
                                    result = hitTestResponse.results && hitTestResponse.results.filter(function (result) {
                                        return result.graphic.layer.type === "feature";
                                    })[0];
                                    if (!result) {
                                        return [2 /*return*/, null];
                                    }
                                    attributes = result.graphic.attributes;
                                    newValue = attributes[visualizationField];
                                    totalValue = 0;
                                    allFields.forEach(function (fieldName) {
                                        totalValue += attributes[fieldName];
                                    });
                                    midPoint = Math.round((newValue / totalValue) * 100);
                                    name = attributes.NAME;
                                    updateRenderer(name, midPoint);
                                    if (highlight) {
                                        highlight.remove();
                                    }
                                    highlight = chinaLayerView.highlight(attributes.OBJECTID);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map