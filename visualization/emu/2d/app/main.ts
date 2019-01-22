import esri = __esri;
import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");

( async () => {

  const url = "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/EMU_master_3857_2/FeatureServer/0";

  const layer = new FeatureLayer({
    url
  });
  const map = new EsriMap({
    basemap: "dark-gray-vector",
    layers: [ layer ]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    extent: {
      "spatialReference": {
        "wkid": 3857
      },
      "xmin": -32607543,
      "ymin": -148400,
      "xmax": -31196210,
      "ymax": 952292
    }
  });

  await view.when();

  const depthSlider = document.getElementById("depth-slider") as HTMLInputElement;
  view.ui.add("slider-div", "top-right");

  const sliderValueText = document.getElementById("slider-value-text");

 

  const query = layer.createQuery();
  query.outFields = [ "UnitTop" ];
  query.returnDistinctValues = true;
  query.returnGeometry = false;
  console.log(query);

  const uniqueDepthValues = await layer.queryFeatures(query).then( response => {
    return response.features.map( feature => feature.attributes.UnitTop );
  });

  console.log("unique values: ", uniqueDepthValues);

  const layerView = await view.whenLayerView(layer);
  layerView.filter = {
    where: `UnitTop = -10`
  };

  depthSlider.addEventListener("input", event => {
    const sliderValue = parseInt(depthSlider.value);
    sliderValueText.innerHTML = depthSlider.value;

    const filterIndex = uniqueDepthValues.indexOf(sliderValue);

    if(filterIndex > -1){
      layerView.filter = {
        where: `UnitTop = ${uniqueDepthValues[filterIndex]}`
      };
    }
  });
 

  
})();