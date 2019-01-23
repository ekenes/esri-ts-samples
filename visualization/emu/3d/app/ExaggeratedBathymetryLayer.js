define(["require", "exports", "esri/layers/BaseElevationLayer", "esri/layers/ElevationLayer"], function (require, exports, BaseElevationLayer, ElevationLayer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createBathymetryLayer(exaggeration) {
        return new ExaggeratedBathymetryLayer({ exaggeration: exaggeration });
    }
    exports.createBathymetryLayer = createBathymetryLayer;
    var ExaggeratedBathymetryLayer = BaseElevationLayer.createSubclass({
        properties: {
            exaggeration: 1
        },
        load: function () {
            this._elevation = new ElevationLayer({
                portalItem: {
                    id: "0c69ba5a5d254118841d43f03aa3e97d"
                }
            });
            this.addResolvingPromise(this._elevation.load());
        },
        fetchTile: function (level, row, col) {
            return this._elevation.fetchTile(level, row, col)
                .then(function (data) {
                var exaggeration = this.exaggeration;
                data.values.forEach(function (value, index, values) {
                    values[index] = value * exaggeration;
                });
                return data;
            }.bind(this));
        }
    });
});
//# sourceMappingURL=ExaggeratedBathymetryLayer.js.map