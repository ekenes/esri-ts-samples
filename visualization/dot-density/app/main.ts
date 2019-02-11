import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import BasemapToggle = require("esri/widgets/BasemapToggle");
import Search = require("esri/widgets/Search");
import Expand = require("esri/widgets/Expand");

import FeatureLayer = require("esri/layers/FeatureLayer");
import PopupTemplate = require("esri/PopupTemplate");

import predominanceSchemes = require("esri/renderers/smartMapping/symbology/predominance");
import typeSchemes = require("esri/renderers/smartMapping/symbology/type");
import { DotDensityRenderer } from "esri/renderers";

( async () => {

  // function to retrieve query parameters (in this case only id)
  function getUrlParam(): string {
    const queryParams = document.location.search.substr(1);
    let result: any = {};

    queryParams.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });

    return result.url;
  }

  // function to set an id as a url param
  function setUrlParam(url: string) {
    window.history.pushState("", "", `${window.location.pathname}?url=${url}`);
  }

  let url = getUrlParam();
  if(!url){
    url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Boise_housing/FeatureServer/0";
    setUrlParam(url);
  }

  let layer = new FeatureLayer({
    url,
    outFields: ["*"],
    opacity: 0.9
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
    zoom: 11
  });
  view.ui.add([ new Expand({
    content: new Legend({ view }),
    view,
    group: "top-left"
  }), new Expand({
    content: new Search({ view }),
    view,
    group: "top-left"
  }), new Expand({
    content: new BasemapToggle({
      view,
      nextBasemap: "dark-gray"
    }),
    view,
    expandIconClass: "esri-icon-basemap",
    group: "top-left"
  })], "top-left");

  await view.when();

  const dotValueInput = document.getElementById("dot-value-input") as HTMLInputElement;
  const dotValueDisplay = document.getElementById("dot-value-display") as HTMLSpanElement;
  const dotValueScaleInput = document.getElementById("dot-value-scale-input") as HTMLInputElement;
  const blendDotsInput = document.getElementById("blend-dots-input") as HTMLInputElement;
  const outlineInput = document.getElementById("outline-input") as HTMLInputElement;
  const unitValueInput = document.getElementById("unit-value-input") as HTMLInputElement;
  const refreshDotPlacement = document.getElementById("refresh-dot-placement") as HTMLSpanElement;

  let seed = 1000;

  refreshDotPlacement.addEventListener("click", () => {
    seed = Math.round(Math.random()*100000);
    const oldRenderer = layer.renderer as DotDensityRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.seed = seed;
    layer.renderer = newRenderer;
    console.log(newRenderer.seed);
  });

  const availableTypeSchemes = typeSchemes.getSchemes({
    basemap: view.map.basemap,
    geometryType: "polygon"
  });

  const fieldList = document.getElementById("fieldList") as HTMLSelectElement;

  async function createFieldOptions (): Promise<any> {
    await layer.load();
    const validFieldTypes = [ "small-integer", "integer", "single", "double", "long" ];
    const excludedFieldNames = [ "HasData", "ENRICH_FID" ];

    layer.fields.filter( field => {
      return ( validFieldTypes.indexOf( field.type ) > -1 ) && 
             ( excludedFieldNames.indexOf(field.name) === -1 );
    }).forEach( (field, i) => {
      const option = document.createElement("option");
      option.value = field.name;
      option.text = field.alias;
      option.title = field.alias;
      option.selected = i < 1;
      fieldList.appendChild(option);
    });
  }

  // Each time the user changes the value of one of the DOM elements
  // (list box and two checkboxes), then generate a new predominance visualization
  fieldList.addEventListener("change", updateRenderer);
  dotValueInput.addEventListener("input", () => {
    updateRenderer();
    dotValueDisplay.innerText = dotValueInput.value;
  });
  dotValueScaleInput.addEventListener("change", updateRenderer);
  blendDotsInput.addEventListener("change", updateRenderer);
  outlineInput.addEventListener("change", updateRenderer);
  unitValueInput.addEventListener("change", updateRenderer);

  function updateRenderer(){
    layer.renderer = createDotDensityRenderer();
  }

  // Gets all the predominance schemes available in the JS API

  const schemes = predominanceSchemes.getSchemes({
    basemap: map.basemap,
    geometryType: "polygon",
    numColors: 10
  });

  // create a predominance renderer once the app loads
  const supportedLayer = await supportsDotDensity(layer);

  if(!supportedLayer){
    alert(`Invalid layer. Please provide a valid polygon layer.`)
  } else {
    await createFieldOptions();
    zoomToLayer(layer);
    updateRenderer();
  }

  /**
   * Creates a predominance renderer if 2 or more fields are selected,
   * or a continuous size renderer if 1 field is selected
   */
  function createDotDensityRenderer(): DotDensityRenderer {

    const selectedOptions = [].slice.call(fieldList.selectedOptions);
    const availablePredominanceSchemes = predominanceSchemes.getSchemes({
      basemap: view.map.basemap,
      geometryType: "polygon",
      numColors: selectedOptions.length
    });

    let attributes = selectedOptions.map( (option: HTMLOptionElement, i:number) => {
      return {
        field: option.value,
        label: option.text,
        color: availableTypeSchemes.primaryScheme.colors[i]
      };
    });

    const unit = unitValueInput.value;
    const outline = outlineInput.checked ? { width: "0.4px", color: [ 128,128,128,0.8 ] } : null;
    const blendDots = blendDotsInput.checked;
    const dotSize = 1;
    const referenceDotValue = parseInt(dotValueInput.value);
    const referenceScale = dotValueScaleInput.checked ? view.scale : null;

    const params = {
      attributes,
      blendDots,
      legendOptions: {
        unit
      },
      outline,
      dotSize,
      referenceDotValue,
      referenceScale,
      // seed
    };

    return new DotDensityRenderer(params);
  }

  async function supportsDotDensity(layer: FeatureLayer): Promise<boolean> {
    await layer.load();
    return layer.geometryType === "polygon";
  }

  async function zoomToLayer(layer: FeatureLayer) {
    await layer.load();
    const extentResponse = await layer.queryExtent();
    view.goTo(extentResponse.extent);
  }

})();