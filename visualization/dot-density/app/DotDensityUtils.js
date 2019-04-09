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
define(["require", "exports", "esri/renderers/smartMapping/statistics/spatialStatistics", "esri/geometry/support/scaleUtils", "esri/tasks/support/StatisticDefinition"], function (require, exports, spatialStatistics, scaleUtils, StatisticDefinition) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getAveragePolygonSize(params) {
        return __awaiter(this, void 0, void 0, function () {
            var layer, sampleSize, view, query, response, avgSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layer = params.layer, sampleSize = params.sampleSize, view = params.view;
                        if (!sampleSize) {
                            sampleSize = 500;
                        }
                        return [4 /*yield*/, layer.load()];
                    case 1:
                        _a.sent();
                        if (layer.geometryType !== "polygon") {
                            console.log("layer must be of type Polygon");
                            return [2 /*return*/, 0];
                        }
                        query = layer.createQuery();
                        query.where = layer.objectIdField + " <= " + sampleSize;
                        query.returnGeometry = true;
                        query.outFields = null;
                        query.outSpatialReference = view.spatialReference;
                        return [4 /*yield*/, layer.queryFeatures(query)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, spatialStatistics({
                                features: response.features,
                                geometryType: "polygon"
                            })];
                    case 3:
                        avgSize = (_a.sent()).avgSize;
                        // console.log(stats);
                        return [2 /*return*/, avgSize];
                }
            });
        });
    }
    exports.getAveragePolygonSize = getAveragePolygonSize;
    function getPixelCountByAverage(params) {
        var view = params.view, averagePolygonSize = params.averagePolygonSize;
        var sizePerPixel = scaleUtils.getResolutionForScale(view.scale, view.spatialReference);
        var averagePolygonSizePixels = (averagePolygonSize / sizePerPixel) * 0.8;
        return averagePolygonSizePixels;
    }
    function calculateDotValue(params) {
        var avgFieldValue = params.avgFieldValue, numPixels = params.numPixels;
        var suggestedDotValue = Math.round(avgFieldValue / numPixels);
        return suggestedDotValue; // < 1 ? 1 : suggestedDotValue;
    }
    function getAverageFieldValue(params) {
        return __awaiter(this, void 0, void 0, function () {
            var layer, fields, statsQuery, statsResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layer = params.layer, fields = params.fields;
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
    function calculateSuggestedDotValue(params) {
        return __awaiter(this, void 0, void 0, function () {
            var view, layer, fields, averagePolygonSize, numPixels, avgFieldValue, suggestedDotValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = params.view, layer = params.layer, fields = params.fields;
                        return [4 /*yield*/, getAveragePolygonSize(params)];
                    case 1:
                        averagePolygonSize = _a.sent();
                        numPixels = getPixelCountByAverage({
                            averagePolygonSize: averagePolygonSize,
                            view: view
                        });
                        return [4 /*yield*/, getAverageFieldValue({
                                layer: layer, fields: fields
                            })];
                    case 2:
                        avgFieldValue = _a.sent();
                        suggestedDotValue = calculateDotValue({ avgFieldValue: avgFieldValue, numPixels: numPixels });
                        return [2 /*return*/, snapNumber(suggestedDotValue)];
                }
            });
        });
    }
    exports.calculateSuggestedDotValue = calculateSuggestedDotValue;
    function snapNumber(value) {
        var inputValue = Math.round(value);
        var numDigits = inputValue.toString().length;
        var factor = Math.pow(10, (numDigits - 2));
        var snappedValue = Math.round(inputValue / factor) * factor;
        return snappedValue < 1 ? 1 : snappedValue;
    }
});
//# sourceMappingURL=DotDensityUtils.js.map