import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import CSVLayer = require("esri/layers/CSVLayer");

import DropTarget from "../app/DropTarget";

( async() => {

  const map = new EsriMap({
    basemap: "streets"
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [ -118.244, 34.052],
    zoom: 12
  });


  const dropTarget = new DropTarget<CSVLayer>({ view });

  dropTarget.on("drop", () => {
    console.log("it worked");
  });

});