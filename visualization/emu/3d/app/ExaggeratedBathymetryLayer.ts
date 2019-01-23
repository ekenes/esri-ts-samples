import BaseElevationLayer = require("esri/layers/BaseElevationLayer");
import ElevationLayer = require("esri/layers/ElevationLayer");

export function createBathymetryLayer(exaggeration?: number){
  return new ExaggeratedBathymetryLayer({exaggeration});
}

const ExaggeratedBathymetryLayer = (BaseElevationLayer as any).createSubclass({

  properties: {
    exaggeration: 1
  },

  load: function() {
    this._elevation = new ElevationLayer({
      portalItem: {
        id: "0c69ba5a5d254118841d43f03aa3e97d"
      }
    });
    this.addResolvingPromise(this._elevation.load());
  },

  fetchTile: function(level: number, row: number, col: number) {
    return this._elevation.fetchTile(level, row, col)
      .then(function(data: any) {

        const exaggeration = this.exaggeration;
        data.values.forEach(function(value: number, index: number, values: number[]) {
          values[index] = value * exaggeration;
        });

        return data;
      }.bind(this));
  }
});