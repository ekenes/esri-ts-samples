import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import { UniqueValueRenderer } from "esri/renderers";
import { SimpleFillSymbol } from "esri/symbols";

import Legend = require("esri/widgets/Legend");

( async () => {

  const visualizationField = "EDUC01_CY";
  const allFields = [
    "EDUC01_CY",  // no education
    "EDUC02_CY",  // Primary School
    "EDUC03_CY",  // Junior Middle School
    "EDUC04_CY",  // Senior High School
    "EDUC05_CY",  // Junior College
    "EDUC06_CY"  // University and Above
  ];
  const description = "Education in mainland China";
  let value = 5;

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
      color: [ 0, 0, 0 ],
      fillOpacity: 0
    }
  });
  view.ui.add(new Legend({ view }), "bottom-left");

  await view.when();

  const chinaLayer = map.layers.getItemAt(0) as esri.FeatureLayer;
  chinaLayer.popupEnabled = false;
  chinaLayer.when();

  chinaLayer.title = `${description}`;
  chinaLayer.renderer = new UniqueValueRenderer({
    field: valueFunction,
    legendOptions: {
      title: "% population without formal education"
    },
    uniqueValueInfos: [{ 
      value: "Above",
      symbol: createSymbol("#b30000"),
      label: `Above ${value}%`
    }, {
      value: "Similar",
      symbol: createSymbol("gray"),
      label: `Similar (within +/- 1%)`
    }, {
      value: "Below",
      symbol: createSymbol("orange"),
      label: `Below ${value}%`
    }],
    defaultLabel: "No data",
    defaultSymbol: createSymbol("black", "backward-diagonal")
  })

  view.on("click", async (event) => {
    const hitTestResponse = await view.hitTest(event);
    const result = hitTestResponse.results && hitTestResponse.results.filter( result => {
      return result.graphic.layer.type === "feature";
    })[0];

    if(!result){
      return null;
    }

    const attributes = result.graphic.attributes;
    const newValue = attributes[visualizationField];
    let totalValue = 0;
    
    allFields.forEach( fieldName => {
      totalValue += attributes[fieldName];
    });

    value = Math.round(( newValue / totalValue ) * 100);
    const name = attributes.NAME;
    updateRenderer( name );
  });

  function updateRenderer (name: string) {
    const oldRenderer = chinaLayer.renderer as UniqueValueRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.uniqueValueInfos.forEach( (info, i) => {
      info.label = ( i !== 1 ) ? `${info.label.substring(0,5)} ${value}%` : `Within +/- 1% of ${name} (${value}%)`;
    });
    newRenderer.legendOptions = {
      title: `% population without formal education relative to ${name}`
    };
    chinaLayer.renderer = newRenderer;
  }

  function valueFunction(graphic: esri.Graphic): string {
    const attributes = graphic.attributes;
    const total = attributes.EDUC01_CY + attributes.EDUC02_CY + attributes.EDUC03_CY 
      + attributes.EDUC04_CY + attributes.EDUC05_CY + attributes.EDUC06_CY;

    const percentTotalFeature = Math.round( ( attributes[visualizationField] / total) * 100);
    let category = "";
    if (percentTotalFeature <= value + 1 && percentTotalFeature >= value - 1){
      category = "Similar";
    }
    else if (percentTotalFeature > value){
      category = "Above";
    }
    else {
      category = "Below";
    }
    return category;
  }

  function createSymbol (color: any, style?: string): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color,
      outline: {
        color: "white",
        width: 0.75
      },
      style: style ? style : "solid"
    });
  }

})();
