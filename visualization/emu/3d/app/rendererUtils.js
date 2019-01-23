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
define(["require", "exports", "esri/renderers", "esri/symbols", "esri/renderers/smartMapping/creators/color", "esri/renderers/smartMapping/creators/relationship", "./colorSliderUtils", "esri/renderers/visualVariables/SizeVariable"], function (require, exports, renderers_1, symbols_1, colorRendererCreator, relationshipRendererCreator, colorSliderUtils_1, SizeVisualVariable) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function generateContinuousVisualization(params) {
        return __awaiter(this, void 0, void 0, function () {
            var symbolType, options, renderer, colorResponse, colorVV, min, max, stddev, fieldNameValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        symbolType = getSymbolType(params.layer.renderer);
                        options = {
                            layer: params.layer,
                            basemap: params.basemap ? params.basemap : "dark-gray",
                            field: params.field,
                            theme: params.theme ? params.theme : "above-and-below",
                            view: symbolType === "object" ? params.view : null,
                            worldScale: symbolType === "object"
                        };
                        renderer = new renderers_1.SimpleRenderer({
                            symbol: createSymbol("white", symbolType)
                        });
                        if (symbolType === "object") {
                            renderer.visualVariables = getRealWorldSizeVariables(params.exaggeration);
                        }
                        return [4 /*yield*/, colorRendererCreator.createVisualVariable(options)];
                    case 1:
                        colorResponse = _a.sent();
                        colorVV = colorResponse.visualVariable;
                        if (renderer.visualVariables && renderer.visualVariables.length > 1) {
                            renderer.visualVariables.push(colorVV);
                        }
                        else {
                            renderer.visualVariables = [colorVV];
                        }
                        // apply input renderer back on layer
                        params.layer.renderer = renderer;
                        min = colorResponse.statistics.min;
                        max = colorResponse.statistics.max;
                        stddev = colorResponse.statistics.stddev * 0.33;
                        fieldNameValue = document.getElementById("field-name");
                        fieldNameValue.innerText = options.field;
                        colorSliderUtils_1.updateColorSlider({
                            colorResponse: colorResponse,
                            layer: options.layer,
                            field: options.field,
                            theme: options.theme
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.generateContinuousVisualization = generateContinuousVisualization;
    function getSymbolType(renderer) {
        var symbolType;
        var symbol = getSymbolFromRenderer(renderer);
        if (symbol.type === "point-3d") {
            var symbolLayer = symbol.symbolLayers.getItemAt(0);
            symbolType = symbolLayer.type;
        }
        else {
            symbolType = "icon";
        }
        return symbolType;
    }
    function createSymbol(color, type) {
        var symbolLayerOptions = {
            resource: {
                primitive: type === "object" ? "cylinder" : "circle"
            },
            material: {
                color: color ? color : "white"
            },
            size: type === "icon" ? 6 : null,
            width: type === "object" ? 27000 : null,
            anchor: type === "object" ? "top" : null
        };
        var symbolLayer = type === "object" ? new symbols_1.ObjectSymbol3DLayer(symbolLayerOptions) : new symbols_1.IconSymbol3DLayer(symbolLayerOptions);
        return new symbols_1.PointSymbol3D({
            symbolLayers: [
                symbolLayer
            ]
        });
    }
    function containsIconSymbol(renderer) {
        var symbol = getSymbolFromRenderer(renderer);
        var hasIconSymbol;
        if (symbol.type === "point-3d") {
            hasIconSymbol = symbol.symbolLayers.some(function (sl) { sl.type === "icon"; });
        }
        else {
            hasIconSymbol = false;
        }
        return hasIconSymbol;
    }
    function getSymbolFromRenderer(renderer) {
        var symbol;
        if (renderer.type === "simple") {
            symbol = renderer.symbol;
        }
        else if (renderer.type === "class-breaks" || renderer.type === "unique-value") {
            symbol = renderer.defaultSymbol;
        }
        else {
            console.error("getSymbolFromRenderer() could not return a symbol from input renderer.");
        }
        return symbol;
    }
    function setEMUClusterVisualization(layer, exaggeration) {
        var originalRenderer = layer.renderer;
        var symbolType = getSymbolType(originalRenderer);
        var renderer = new renderers_1.UniqueValueRenderer({
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
        });
        if (symbolType === "object") {
            renderer.visualVariables = getRealWorldSizeVariables(exaggeration);
        }
        layer.renderer = renderer;
    }
    exports.setEMUClusterVisualization = setEMUClusterVisualization;
    function generateRelationshipVisualization(params) {
        return __awaiter(this, void 0, void 0, function () {
            var options, relationshipRendererResponse, oldRenderer, symbolType, renderer, uniqueValueInfos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            // relationshipScheme: schemes.secondarySchemes[8],
                            layer: params.layer,
                            view: params.view,
                            basemap: params.view.map.basemap,
                            field1: {
                                field: params.field1.fieldName
                            },
                            field2: {
                                field: params.field2.fieldName
                            },
                            classificationMethod: "quantile",
                            focus: "HH"
                        };
                        return [4 /*yield*/, relationshipRendererCreator.createRenderer(options)];
                    case 1:
                        relationshipRendererResponse = _a.sent();
                        oldRenderer = options.layer.renderer;
                        symbolType = getSymbolType(oldRenderer);
                        renderer = relationshipRendererResponse.renderer;
                        if (symbolType === "object") {
                            uniqueValueInfos = renderer.uniqueValueInfos.map(function (info) {
                                info.symbol = createSymbol(info.symbol.color.clone(), symbolType);
                                switch (info.value) {
                                    case "HH":
                                        info.label = "High " + params.field1.label + ", High " + params.field2.label;
                                        break;
                                    case "HL":
                                        info.label = "High " + params.field1.label + ", Low " + params.field2.label;
                                        break;
                                    case "LH":
                                        info.label = "Low " + params.field1.label + ", High " + params.field2.label;
                                        break;
                                    case "LL":
                                        info.label = "Low " + params.field1.label + ", Low " + params.field2.label;
                                        break;
                                }
                                return info;
                            });
                            renderer.defaultSymbol = createSymbol([128, 128, 128], symbolType);
                            renderer.visualVariables = getRealWorldSizeVariables(params.exaggeration);
                        }
                        else {
                            uniqueValueInfos = renderer.uniqueValueInfos.map(function (info) {
                                switch (info.value) {
                                    case "HH":
                                        info.label = "High " + params.field1.label + ", High " + params.field2.label;
                                        break;
                                    case "HL":
                                        info.label = "High " + params.field1.label + ", Low " + params.field2.label;
                                        break;
                                    case "LH":
                                        info.label = "Low " + params.field1.label + ", High " + params.field2.label;
                                        break;
                                    case "LL":
                                        info.label = "Low " + params.field1.label + ", Low " + params.field2.label;
                                        break;
                                }
                                return info;
                            });
                        }
                        renderer.uniqueValueInfos = uniqueValueInfos;
                        params.layer.renderer = renderer;
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.generateRelationshipVisualization = generateRelationshipVisualization;
    function getRealWorldSizeVariables(exaggeration) {
        return [new SizeVisualVariable({
                valueExpression: "$feature.ThicknessPos" + " * " + exaggeration,
                valueUnit: "meters",
                axis: "height"
            }), new SizeVisualVariable({
                useSymbolValue: true,
                axis: "width-and-depth"
            })];
    }
});
//# sourceMappingURL=rendererUtils.js.map