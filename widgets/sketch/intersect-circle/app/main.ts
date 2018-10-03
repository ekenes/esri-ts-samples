import esri = __esri;
import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");

import FeatureLayer = require("esri/layers/FeatureLayer");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import Graphic = require("esri/Graphic");
import PopupTemplate = require("esri/PopupTemplate");

import { Polygon } from "esri/geometry";
import { SimpleFillSymbol } from "esri/symbols";

( async () => {

  

  const layer = new FeatureLayer({
    portalItem: {
      id: "2bd5af2e50484ea483d5ff1a2c24d605"
    }
  });

  const map = new EsriMap({
    basemap: "streets",
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    extent: {
      spatialReference: {
        wkid: 3857
      },
      xmin: -29633185,
      ymin: 3308563,
      xmax: -27145618,
      ymax: 5226215
    }
  });

  const polygonSymbol = new SimpleFillSymbol({
    color: "rgba(138,43,226, 0.8)",
    style: "solid",
    outline: {
      color: "white",
      width: 1
    }
  });

  const sketchViewModel = new SketchViewModel({
    view,
    polygonSymbol
  });

  sketchViewModel.on("create-complete", addGraphic);

  function addGraphic(event: any) {
    // Create a new graphic and set its geometry to
    // `create-complete` event geometry.
    const graphic = new Graphic({
      geometry: event.geometry,
      symbol: sketchViewModel.graphic.symbol
    });
    view.graphics.add(graphic);

    // createArcade(event.geometry);

    layer.popupTemplate = createPopupTemplate(event.geometry);
    console.log(layer.popupTemplate);
  }

  function createPopupTemplate (geometry: Polygon): PopupTemplate {
    return new PopupTemplate({
      expressionInfos: [{
        expression: createArcade(geometry),
        name: "circle"
      }],
      content: "{expression/circle}"
    });
  }

  function createArcade(geometry: Polygon): string {
    const geometryJson = JSON.stringify(geometry.toJSON());
    return `
      var circle = Polygon(${geometryJson});
      var featureArea = GeodesicArea( $feature, "square-kilometers" );
      var intersectedArea = IIF( Intersects( $feature, circle ), 
        GeodesicArea( Intersection( $feature, circle ) , "square-kilometers" ), 
        featureArea 
      );

      return ( intersectedArea / featureArea );
    `;
  }

  const drawCircleButton = document.getElementById("circleButton");
  drawCircleButton.addEventListener("click", () => {
    sketchViewModel.create("circle");
    setActiveButton(this);
  });

  function setActiveButton(selectedButton: HTMLButtonElement) {
    // focus the view to activate keyboard shortcuts for sketching
    view.focus();
    const elements = document.getElementsByClassName("active");
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("active");
    }
    if (selectedButton) {
      selectedButton.classList.add("active");
    }
  }

})();
