import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import BasemapToggle = require("esri/widgets/BasemapToggle");
import Search = require("esri/widgets/Search");
import Expand = require("esri/widgets/Expand");

import FeatureLayer = require("esri/layers/FeatureLayer");

import predominanceSchemes = require("esri/renderers/smartMapping/symbology/predominance");
import typeSchemes = require("esri/renderers/smartMapping/symbology/type");
import { DotDensityRenderer } from "esri/renderers";
import { generateTopListPopupTemplate } from "app/ArcadeExpressions";

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
    url = "http://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/USA_County_Crops_2007/FeatureServer/0";
    setUrlParam(url);
  }

  let layer = new FeatureLayer({
    url,
    outFields: ["*"],
    opacity: 0.9,
    maxScale: 0,
    minScale: 0
  });

  const map = new EsriMap({
    basemap: {
      portalItem: {
        id: "9d5cf81cf8ce437584cedc8a2ee4ea4e"
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
      nextBasemap: "gray-vector"
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
  const schemeList = document.getElementById("scheme-list") as HTMLSelectElement;
  const seedInput = document.getElementById("seed-input") as HTMLInputElement;

  let seed = parseInt(seedInput.value);

  refreshDotPlacement.addEventListener("click", () => {
    seed = Math.round(Math.random()*100000);
    seedInput.value = seed.toString();
    const oldRenderer = layer.renderer as DotDensityRenderer;
    const newRenderer = oldRenderer.clone();
    newRenderer.seed = seed;
    layer.renderer = newRenderer;
  });

  const availableTypeSchemes = typeSchemes.getSchemes({
    basemap: view.map.basemap,
    geometryType: "polygon"
  });

  // Gets all the predominance schemes available in the JS API

  const availablePredominanceSchemes = predominanceSchemes.getSchemes({
    basemap: map.basemap,
    geometryType: "polygon",
    numColors: 10
  });

  const fieldList = document.getElementById("fieldList") as HTMLSelectElement;

  async function createFieldOptions () {
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

  let selectedSchemeIndex = 0;
  let allSchemes: Array<any>;

  function createSchemeOptions () {
    const typeSchemes = [ availableTypeSchemes.primaryScheme ].concat(availableTypeSchemes.secondarySchemes);
    const predominanceSchemes = [ availablePredominanceSchemes.primaryScheme ].concat(availablePredominanceSchemes.secondarySchemes);
    allSchemes = typeSchemes.concat(predominanceSchemes);

    allSchemes.forEach( (scheme, i) => {
      const option = document.createElement("option");
      option.value = i.toString();
      option.text = `Color scheme No. ${i}`;
      option.selected = selectedSchemeIndex === i;
      schemeList.appendChild(option);
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
  schemeList.addEventListener("change", (event: any) => {
    selectedSchemeIndex = parseInt(event.target.value);
    updateRenderer();
  });
  seedInput.addEventListener("change", updateRenderer);

  let attributes: esri.AttributeColorInfo[];

  function getAttibutes() {
    const selectedOptions = [].slice.call(fieldList.selectedOptions);
    return selectedOptions.map( (option: HTMLOptionElement, i:number) => {
      return {
        field: option.value,
        label: option.text,
        color: allSchemes[selectedSchemeIndex].colors[i]
      };
    });
  }

  function updateRenderer(){
    attributes = getAttibutes();
    layer.renderer = createDotDensityRenderer();
    layer.popupTemplate = generateTopListPopupTemplate(attributes);
  }

  // create a predominance renderer once the app loads
  const supportedLayer = await supportsDotDensity(layer);

  if(!supportedLayer){
    alert(`Invalid layer. Please provide a valid polygon layer.`)
  } else {
    createSchemeOptions();
    await createFieldOptions();
    zoomToLayer(layer);
    updateRenderer();
  }

  /**
   * Creates a predominance renderer if 2 or more fields are selected,
   * or a continuous size renderer if 1 field is selected
   */
  function createDotDensityRenderer(): DotDensityRenderer {

    const unit = unitValueInput.value;
    const outline = outlineInput.checked ? { width: "0.5px", color: [ 128,128,128,0.4 ] } : null;
    const blendDots = blendDotsInput.checked;
    const dotSize = 1;
    const referenceDotValue = parseInt(dotValueInput.value);
    const referenceScale = dotValueScaleInput.checked ? view.scale : null;
    seed = parseInt(seedInput.value);

    const params = {
      attributes,
      blendDots,
      legendOptions: {
        unit
      },
      outline,
      dotSize,
      referenceDotValue,
      referenceScale,  //
      seed,
      // visualVariables: [{
      //   type: "size",
      //   target: "outline",
      //   valueExpression: "$view.scale",
      //   stops: [
      //     { size: 3, value: 70000},
      //     { size: 2, value: 70000*2},
      //     { size: 1, value: 70000*4},
      //     { size: 0, value: 70000*8}
      //   ]
      // }]
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
    return view.goTo(extentResponse.extent);
  }

})();