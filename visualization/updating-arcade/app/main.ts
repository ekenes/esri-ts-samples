import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import { SimpleRenderer, UniqueValueRenderer } from "esri/renderers";
import { SimpleFillSymbol } from "esri/symbols";

import Legend = require("esri/widgets/Legend");

( async () => {

  const visualizationField = "EDUC02_CY";
  const allFields = [
    "EDUC01_CY",  // no education
    "EDUC02_CY",  // Primary School
    "EDUC03_CY",  // Junior Middle School
    "EDUC04_CY",  // Senior High School
    "EDUC05_CY",  // Junior College
    "EDUC06_CY"  // University and Above
  ];
  const description = "% population completed college";
  const startValue = 5;

  const map = new WebMap({
    portalItem: {
      id: "b8f443e2378344e79566fa64430a3c25"
    }
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: "top-right",
        breakpoint: false
      }
    },
    highlightOptions: {
      color: "green"
    }
  });
  view.ui.add(new Legend({ view }), "bottom-left");

  await view.when();

  const chinaLayer = map.layers.getItemAt(0) as esri.FeatureLayer;
  chinaLayer.when();
  chinaLayer.title = `${description}`;
  chinaLayer.renderer = new UniqueValueRenderer({
    valueExpression: createArcade( startValue ),
    uniqueValueInfos: [{
      value: "Above",
      symbol: createSymbol("purple"),
      label: `Above ${startValue}%`
    }, {
      value: "Below",
      symbol: createSymbol("orange"),
      label: `Below ${startValue}%`
    }],
    defaultLabel: "No data",
    defaultSymbol: createSymbol("gray")
  })

  view.on("click", async (event) => {
    const hitTestResponse = await view.hitTest(event);
    const result = hitTestResponse.results && hitTestResponse.results.filter( result => {
      return result.graphic.layer.type === "feature";
    })[0];

    const attributes = result.graphic.attributes;
    const newValue = attributes[visualizationField];
    let totalValue = 0;
    
    allFields.forEach( fieldName => {
      totalValue += attributes[fieldName];
    });

    const midPoint = Math.round(( newValue / totalValue ) * 100);
    updateRenderer( midPoint );

    console.log("total value: ", totalValue);
  });

  function updateRenderer (newValue: number) {
    const oldRenderer = chinaLayer.renderer as UniqueValueRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.valueExpression = createArcade(newValue);
    newRenderer.uniqueValueInfos.forEach( info => {
      info.label = `${info.label.substring(0,5)} ${newValue}%`;
    })
    chinaLayer.renderer = newRenderer;
  }

  function createArcade(value: number): string {
    return `
      var value = ${value};
      var total = Sum( $feature.EDUC01_CY, $feature.EDUC02_CY, $feature.EDUC03_CY, 
        $feature.EDUC04_CY, $feature.EDUC05_CY, $feature.EDUC06_CY );

      var percentTotalFeature = Round( ($feature.${visualizationField} / total) * 100);
      console(value);
      IIF( percentTotalFeature > value, "Above", "Below" );
    `;
  }

  function createSymbol (color: any): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color,
      outline: {
        color: "white",
        width: 0.75
      }
    });
  }

})();
