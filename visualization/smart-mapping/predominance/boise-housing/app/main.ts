import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import FeatureLayer = require("esri/layers/FeatureLayer");

import predominanceRendererCreator = require("esri/renderers/smartMapping/creators/predominance");
import predominanceSchemes = require("esri/renderers/smartMapping/symbology/predominance");
import sizeRendererCreator = require("esri/renderers/smartMapping/creators/size");

( async () => {

  const layer = new FeatureLayer({
    portalItem: {
      id: "e1f194d5f3184402a8a39b60b44693f4"
    },
    outFields: ["*"],
    title: "Boise Block Groups",
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
      applyRenderer(predominanceResponse);
    });
  });

  const schemes = predominanceSchemes.getSchemes({
    basemap: map.basemap,
    geometryType: "polygon",
    numColors: 10
  });

  const predominanceResponse = await createPredominanceRenderer();
  applyRenderer(predominanceResponse);

  function createPredominanceRenderer(){

    const selectedOptions = [].slice.call(fieldList.selectedOptions);

    if (selectedOptions.length === 1){
      return createSizeRenderer(selectedOptions[0].value);
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

  async function createSizeRenderer(field: string): Promise <esri.sizeContinuousRendererResult> {
    return sizeRendererCreator.createContinuousRenderer({
      layer,
      basemap: map.basemap,
      field,
      legendOptions: {
        title: "Number of homes built"
      }
    });
  }

  function applyRenderer(response: any){
    layer.renderer = response.renderer;
  }

  // Add popup template listing the values of each field in order
  // of highest to lowest
  
  const popupArcade = `
    var numTopValues = 10;

    var groups = [
      {
        value: $feature.ACSBLT1939,
        alias: "Before 1940"
      }, {
        value: $feature.ACSBLT1940,
        alias: "1940s"
      }, {
        value: $feature.ACSBLT1950,
        alias: "1950s"
      }, {
        value: $feature.ACSBLT1960,
        alias: "1960s"
      }, {
        value: $feature.ACSBLT1970,
        alias: "1970s"
      }, {
        value: $feature.ACSBLT1980,
        alias: "1980s"
      }, {
        value: $feature.ACSBLT1990,
        alias: "1990s"
      }, {
        value: $feature.ACSBLT2000,
        alias: "2000s"
      }, {
        value: $feature.ACSBLT2010,
        alias: "2010-2014"
      }, {
        value: $feature.ACSBLT2014,
        alias: "After 2014"
      }
    ];

    function getValuesArray(a){
      var valuesArray = []
      for(var i in a){
        valuesArray[i] = a[i].value;
      }
      return valuesArray;
    }

    function findAliases(top5a,fulla){
      var aliases = [];
      var found = "";
      for(var i in top5a){
        for(var k in fulla){
          if(top5a[i] == fulla[k].value && Find(fulla[k].alias, found) == -1){
            found += fulla[k].alias;
            aliases[Count(aliases)] = {
              alias: fulla[k].alias,
              value: top5a[i]
            };
          }
        }
      }
      return aliases;
    }
    
    function getTopGroups(groupsArray){
        
      var values = getValuesArray(groupsArray);
      var top5Values = IIF(Max(values) > 0, Top(Reverse(Sort(values)),numTopValues), "no data");
      var top5Aliases = findAliases(top5Values,groupsArray);
        
      if(TypeOf(top5Values) == "String"){
        return top5Values;
      } else {
        var content = "";
        for(var i in top5Aliases){
          if(top5Aliases[i].value > 0){
            content += (i+1) + ". " + top5Aliases[i].alias + " (" + Text(top5Aliases[i].value, "#,###") + ")";
            content += IIF(i < numTopValues-1, TextFormatting.NewLine, "");
          }
        }
      }
        
      return content;
    }
    
    getTopGroups(groups);
  `;

  layer.popupTemplate = {
    title: "Number of homes built by decade",
    content: "{expression/ordered-list-arcade}",
    expressionInfos: [{
      name: "ordered-list-arcade",
      title: "Top 10",
      expression: popupArcade
    }]
  } as esri.PopupTemplate;

})();