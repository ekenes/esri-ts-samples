import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import FeatureLayer = require("esri/layers/FeatureLayer");
import predominanceRendererCreator = require("esri/renderers/smartMapping/creators/predominance");

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
    }
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

  const fields = [{
    name: "ACSBLT1939",
    label: "Before 1940"
  }, {
    name: "ACSBLT1940",
    label: "1940s"
  }, {
    name: "ACSBLT1950",
    label: "1950s"
  }, {
    name: "ACSBLT1960",
    label: "1960s"
  }, {
    name: "ACSBLT1970",
    label: "1970s"
  }, {
    name: "ACSBLT1980",
    label: "1980s"
  }, {
    name: "ACSBLT1990",
    label: "1990s"
  }, {
    name: "ACSBLT2000",
    label: "2000s"
  }, {
    name: "ACSBLT2010",
    label: "2010-2014"
  }, {
    name: "ACSBLT2014",
    label: "After 2014"
  }];

  const params = {
    view,
    layer,
    fields,
    basemap: map.basemap,
    legendOptions: {
      title: "Most common decade in which homes were built"
    },
    includeOpacityVariable: true,
    includeSizeVariable: true
  };

  const predominanceResponse = await predominanceRendererCreator.createRenderer(params);
  layer.renderer = predominanceResponse.renderer;
  map.add(layer);

})();