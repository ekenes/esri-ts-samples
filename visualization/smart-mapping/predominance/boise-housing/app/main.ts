import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import FeatureLayer = require("esri/layers/FeatureLayer");

import predominanceRendererCreator = require("esri/renderers/smartMapping/creators/predominance");
import predominanceSchemes = require("esri/renderers/smartMapping/symbology/predominance");
import sizeRendererCreator = require("esri/renderers/smartMapping/creators/size");

import { top10Arcade, totalArcade } from "app/ArcadeExpressions";

( async () => {

  const layer = new FeatureLayer({
    portalItem: {
      id: "453a70e1e36b4318a5af017d7d0188de"
    },
    outFields: ["*"],
    title: "Boise Block Groups",
    opacity: 1
  });

  const map = new EsriMap({
    basemap: {
      portalItem: {
        id: "75a3ce8990674a5ebd5b9ab66bdab893"
      }
    },
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [ -116.3126, 43.60703 ],
    zoom: 11,
    constraints: {
      minScale: 600000
    }
  });
  view.ui.add(new Legend({ view }), "bottom-left");

  await view.when();

  const fieldList = document.getElementById("fieldList") as HTMLSelectElement;
  const includeSizeCheckbox = document.getElementById("includeSize") as HTMLInputElement;
  const includeOpacityCheckbox = document.getElementById("includeOpacity") as HTMLInputElement;

  const elements = [ fieldList, includeOpacityCheckbox, includeSizeCheckbox ];

  // Each time the user changes the value of one of the DOM elements
  // (list box and two checkboxes), then generate a new predominance visualization

  elements.forEach(function(element){
    element.addEventListener("change", async () => {
      const predominanceResponse = await createPredominanceRenderer();
      layer.renderer = predominanceResponse.renderer;
    });
  });

  // Gets all the predominance schemes available in the JS API

  const schemes = predominanceSchemes.getSchemes({
    basemap: map.basemap,
    geometryType: "polygon",
    numColors: 10
  });

  // create a predominance renderer once the app loads

  const predominanceResponse = await createPredominanceRenderer();
  layer.renderer = predominanceResponse.renderer;

  /**
   * Creates a predominance renderer if 2 or more fields are selected,
   * or a continuous size renderer if 1 field is selected
   */
  function createPredominanceRenderer() {

    const selectedOptions = [].slice.call(fieldList.selectedOptions);

    if (selectedOptions.length === 1){
      return createSizeRenderer(selectedOptions[0]);
    }

    const fields = selectedOptions.map(function(option: HTMLOptionElement){
      return {
        name: option.value,
        label: option.text
      };
    });

    const params = {
      view,
      layer,
      fields,
      predominanceScheme: schemes.secondarySchemes[6],
      sortBy: "value",
      basemap: view.map.basemap,
      includeSizeVariable: includeSizeCheckbox.checked,
      includeOpacityVariable: includeOpacityCheckbox.checked,
      legendOptions: {
        title: "Most common decade in which homes were built"
      }
    };

    return predominanceRendererCreator.createRenderer(params);
  }

  async function createSizeRenderer(option: HTMLOptionElement): Promise <esri.sizeContinuousRendererResult> {
    return sizeRendererCreator.createContinuousRenderer({
      layer,
      basemap: map.basemap,
      field: option.value,
      legendOptions: {
        title: `Number of homes built (${option.text})`
      }
    });
  }

  // Add popup template listing the values of each field in order
  // of highest to lowest
  
  layer.popupTemplate = {
    title: `{expression/total-arcade} total homes built`,
    content: `{expression/ordered-list-arcade}`,
    expressionInfos: [{
      name: "ordered-list-arcade",
      title: "Top 10",
      expression: top10Arcade
    }, {
      name: "total-arcade",
      title: "Total homes",
      expression: totalArcade
    }]
  } as esri.PopupTemplate;

})();