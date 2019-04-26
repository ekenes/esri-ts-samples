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
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/widgets/Search", "esri/request", "esri/widgets/Search/SearchSource", "esri/geometry/projection", "esri/PopupTemplate", "esri/Graphic", "esri/geometry"], function (require, exports, EsriMap, MapView, Search, esriRequest, SearchSource, projection, PopupTemplate, Graphic, geometry_1) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    try {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            function searchPlaceNames(params) {
                return __awaiter(this, void 0, void 0, function () {
                    var propertyName, suggestMunicipality, suggestCounty, filterGeometry, searchUrl, searchResponse, xmlResponse, jsResponse, rawResults, searchResults;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                propertyName = params.propertyName, suggestMunicipality = params.suggestMunicipality, suggestCounty = params.suggestCounty, filterGeometry = params.filterGeometry;
                                searchUrl = "https://ws.geonorge.no/SKWS3Index/ssr/sok";
                                return [4 /*yield*/, esriRequest(searchUrl, {
                                        responseType: "xml",
                                        query: {
                                            navn: propertyName
                                        }
                                    })];
                            case 1:
                                searchResponse = _a.sent();
                                xmlResponse = searchResponse.data;
                                jsResponse = window.xmlToJSON.parseXML(xmlResponse);
                                console.log("js response", jsResponse);
                                rawResults = jsResponse.sokRes[0].stedsnavn;
                                if (rawResults.length < 1) {
                                    return [2 /*return*/, []];
                                }
                                searchResults = rawResults.map(function (item) {
                                    var x = item.aust[0]._text;
                                    var y = item.nord[0]._text;
                                    var name = item.stedsnavn[0]._text;
                                    var ssrId = item.ssrId[0]._text;
                                    var status = item.skrivemaatestatus[0]._text;
                                    var SpName = item.skrivemaatenavn[0]._text;
                                    var type = item.navnetype[0]._text;
                                    var municipality = item.kommunenavn[0]._text;
                                    var county = item.fylkesnavn[0]._text;
                                    var wkid = item.epsgKode[0]._text;
                                    var unprojectedGeometry = new geometry_1.Point({
                                        x: x, y: y, spatialReference: { wkid: wkid }
                                    });
                                    var geometry = projection.project(unprojectedGeometry, view.spatialReference);
                                    var attributes = { x: x, y: y, name: name, ssrId: ssrId, status: status, SpName: SpName, type: type, municipality: municipality, county: county, wkid: wkid };
                                    var popupTemplate = new PopupTemplate({
                                        title: "{name}, {municipality}, {county}",
                                        content: [{
                                                type: "fields",
                                                fieldInfos: [{
                                                        fieldName: "type",
                                                        label: "Property Type"
                                                    }, {
                                                        fieldName: "municipality",
                                                        label: "Municipality"
                                                    }, {
                                                        fieldName: "county",
                                                        label: "County"
                                                    }, {
                                                        fieldName: "status",
                                                        label: "Status"
                                                    }, {
                                                        fieldName: "y",
                                                        label: "latitude"
                                                    }, {
                                                        fieldName: "x",
                                                        label: "longitude"
                                                    }]
                                            }]
                                    });
                                    var feature = new Graphic({ geometry: geometry, attributes: attributes, popupTemplate: popupTemplate });
                                    var extent = new geometry_1.Extent({
                                        xmax: geometry.x + 1000,
                                        xmin: geometry.x - 1000,
                                        ymax: geometry.y + 1000,
                                        ymin: geometry.y - 1000,
                                        spatialReference: geometry.spatialReference.clone()
                                    });
                                    return {
                                        name: name + ", " + municipality + ", " + county,
                                        feature: feature,
                                        extent: extent
                                    };
                                });
                                console.log("results: ", searchResults);
                                if (filterGeometry) {
                                    searchResults = searchResults.filter(function (result) {
                                        return filterGeometry.contains(result.feature.geometry);
                                    });
                                }
                                if (suggestMunicipality) {
                                    searchResults = searchResults.filter(function (result) {
                                        return result.feature.attributes.municipality === suggestMunicipality;
                                    });
                                }
                                if (suggestCounty) {
                                    searchResults = searchResults.filter(function (result) {
                                        return result.feature.attributes.county === suggestCounty;
                                    });
                                }
                                return [2 /*return*/, searchResults];
                        }
                    });
                });
            }
            var map, view, norwayPlaceNameSearchLocator, search;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, projection.load()];
                    case 1:
                        _a.sent();
                        map = new EsriMap({
                            basemap: "streets"
                        });
                        view = new MapView({
                            map: map,
                            container: "viewDiv",
                            zoom: 4,
                            center: [15, 65],
                            popup: {
                                dockEnabled: true,
                                dockOptions: {
                                    position: "bottom-left",
                                    breakpoint: false,
                                    buttonEnabled: false
                                }
                            }
                        });
                        // const propertyName = "ekenes";
                        return [4 /*yield*/, view.when()];
                    case 2:
                        // const propertyName = "ekenes";
                        _a.sent();
                        norwayPlaceNameSearchLocator = new SearchSource({
                            placeholder: "example: Ekenes",
                            getSuggestions: function (params) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var suggestTerm, sourceIndex, searchResults;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                console.log("suggestions: ", params);
                                                suggestTerm = params.suggestTerm, sourceIndex = params.sourceIndex;
                                                console.log("term: ", suggestTerm);
                                                return [4 /*yield*/, searchPlaceNames({ propertyName: suggestTerm + "*" })];
                                            case 1:
                                                searchResults = _a.sent();
                                                // searchTerm = suggestTerm;
                                                return [2 /*return*/, searchResults.map(function (result) {
                                                        var _a = result.feature.attributes, name = _a.name, municipality = _a.municipality, county = _a.county;
                                                        return {
                                                            key: name,
                                                            text: name + ", " + municipality + ", " + county,
                                                            sourceIndex: sourceIndex
                                                        };
                                                    })];
                                        }
                                    });
                                });
                            },
                            getResults: function (params) { return __awaiter(_this, void 0, void 0, function () {
                                var terms, municipality, county, propertyName;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            console.log("results params", params);
                                            terms = params.suggestResult.text.split(",");
                                            municipality = null;
                                            county = null;
                                            if (terms.length > 1) {
                                                municipality = terms[1].trim();
                                                county = terms[2].trim();
                                            }
                                            propertyName = params.suggestResult.key || terms[0].trim();
                                            console.log(terms);
                                            return [4 /*yield*/, searchPlaceNames({
                                                    propertyName: propertyName,
                                                    suggestMunicipality: municipality,
                                                    suggestCounty: county
                                                })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); },
                            popupTemplate: new PopupTemplate({
                                title: "{name}, {municipality}, {county}",
                                content: [{
                                        type: "fields",
                                        fieldInfos: [{
                                                fieldName: "type",
                                                label: "Property Type"
                                            }, {
                                                fieldName: "municipality",
                                                label: "Municipality"
                                            }, {
                                                fieldName: "county",
                                                label: "County"
                                            }, {
                                                fieldName: "status",
                                                label: "Status"
                                            }, {
                                                fieldName: "y",
                                                label: "latitude"
                                            }, {
                                                fieldName: "x",
                                                label: "longitude"
                                            }]
                                    }]
                            })
                        });
                        search = new Search({
                            view: view,
                            includeDefaultSources: false,
                            sources: [norwayPlaceNameSearchLocator],
                            maxSuggestions: 50,
                        });
                        search.viewModel.on("select-result", function (e) {
                            console.log(e);
                        });
                        view.ui.add(search, "top-right");
                        return [2 /*return*/];
                }
            });
        }); })();
    }
    catch (error) {
        console.error(error);
    }
});
//# sourceMappingURL=main.js.map