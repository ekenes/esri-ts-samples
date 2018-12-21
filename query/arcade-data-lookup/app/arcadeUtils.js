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
define(["require", "exports", "esri/request"], function (require, exports, esriRequest) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function fetchData() {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/us_counties_crops_256_colors/FeatureServer/0/query";
                return [2 /*return*/, esriRequest(url, {
                        query: {
                            f: "json",
                            where: "1=1",
                            outFields: ["OBJECTID_1", "CORN_PER_ACRES_2012"],
                            // outFields: [ "ALAND", "OBJECTID", "GEOID" ],
                            returnGeometry: false,
                            maxRecordCountFactor: 3
                        }
                    })
                        .then(function (response) {
                        var data = response.data;
                        var jsonForArcade = {};
                        data.features.forEach(function (feature) {
                            jsonForArcade[feature.attributes.OBJECTID_1.toString()] = feature.attributes.CORN_PER_ACRES_2012;
                        });
                        return jsonForArcade;
                    })
                        .catch(function (error) {
                        console.error("An error occurred fetching data: ", error);
                    })];
            });
        });
    }
    function getArcade() {
        return __awaiter(this, void 0, void 0, function () {
            var data, arcade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchData()];
                    case 1:
                        data = _a.sent();
                        arcade = "\n    var data = " + JSON.stringify(data) + ";\n    var cornAcres = data[Text($feature.OBJECTID_1)];\n    var totalArea = $feature.Shape__Area;\n    Round( cornAcres );\n  ";
                        return [2 /*return*/, arcade];
                }
            });
        });
    }
    exports.getArcade = getArcade;
});
// var data = ${JSON.stringify(data)};
// var landArea = data[$feature.GEOID];
// var waterArea = $feature.AWATER;
// //var waterArea = $feature.AWATER;
// var totalArea = waterArea + landArea;
// Round( ( waterArea / totalArea ) * 100 );
//# sourceMappingURL=arcadeUtils.js.map