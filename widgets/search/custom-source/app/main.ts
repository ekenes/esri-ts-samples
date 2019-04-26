import esri = __esri;

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");

import Search = require("esri/widgets/Search");
import esriRequest = require("esri/request");
import SearchSource = require("esri/widgets/Search/SearchSource");
import geometryEngine = require("esri/geometry/geometryEngine");
import projection = require("esri/geometry/projection");

import PopupTemplate = require("esri/PopupTemplate");

import Graphic = require("esri/Graphic");

import { Point, Extent, Polygon } from "esri/geometry";

try {
  ( async () => {

    await projection.load();

    const map = new EsriMap({
      basemap: "streets"
    });

    const view = new MapView({
      map: map,
      container: "viewDiv",
      zoom: 4,
      center: [15, 65],
      popup: {
        dockEnabled: true,
        dockOptions: {
          position: "bottom-left",
          breakpoint: false,
          buttonEnabled: false
        }
      }
    });

    // const propertyName = "ekenes";

    await view.when();

    const norwayPlaceNameSearchLocator = new SearchSource({
      placeholder: "example: Ekenes",

      getSuggestions: async function (params: esri.GetSuggestionsParameters): Promise<esri.SuggestResult[]> {
        console.log("suggestions: ", params);
        const { suggestTerm, sourceIndex } = params;
        console.log("term: ", suggestTerm);
        const searchResults = await searchPlaceNames({ propertyName: suggestTerm });

        // searchTerm = suggestTerm;

        return searchResults.map( result => {
          const { name, municipality, county } = result.feature.attributes;

          return {
            key: name,
            text: `${name}, ${municipality}, ${county}`,
            sourceIndex
          }
        });
      },

      getResults: async (params: esri.GetResultsParameters) => {
        console.log("results params", params);
        const terms = params.suggestResult.text.split(",");

        let municipality:string = null;
        let county:string = null;
        if(terms.length > 1){
          municipality = terms[1].trim();
          county = terms[2].trim();
        }

        const propertyName = params.suggestResult.key || terms[0].trim();
        
        console.log(terms);
        return await searchPlaceNames({ 
          propertyName, 
          suggestMunicipality: municipality, 
          suggestCounty: county 
        });
      },

      popupTemplate: new PopupTemplate({
        title: "{name}, {municipality}, {county}",
        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "type",
            label: "Property Type"
          }, {
            fieldName: "municipality",
            label: "Municipality"
          }, {
            fieldName: "county",
            label: "County"
          }, {
            fieldName: "status",
            label: "Status"
          }, {
            fieldName: "y",
            label: "latitude"
          }, {
            fieldName: "x",
            label: "longitude"
          }]
        }]
      })
    } as any);

    interface SearchPlaceNamesParams {
      propertyName: string,
      suggestMunicipality?: string,
      suggestCounty?: string,
      filterGeometry?: Polygon
    }

    async function searchPlaceNames (params: SearchPlaceNamesParams): Promise<esri.SearchResult[]> {
      const { propertyName, suggestMunicipality, suggestCounty, filterGeometry } = params;

      const searchUrl = `https://ws.geonorge.no/SKWS3Index/ssr/sok`;

      const searchResponse = await esriRequest(searchUrl, {
        responseType: "xml",
        query: {
          navn: propertyName
        }
      });

      // console.log(searchResponse);

      const xmlResponse = searchResponse.data;
      const jsResponse = window.xmlToJSON.parseXML(xmlResponse);
      console.log("js response", jsResponse);

      const rawResults = jsResponse.sokRes[0].stedsnavn;

      let searchResults: esri.SearchResult[] = rawResults.map( (item: any) => {
        const x = item.aust[0]._text;
        const y = item.nord[0]._text;
        const name = item.stedsnavn[0]._text;
        const ssrId = item.ssrId[0]._text;
        const status = item.skrivemaatestatus[0]._text;
        const SpName = item.skrivemaatenavn[0]._text;
        const type = item.navnetype[0]._text;
        const municipality = item.kommunenavn[0]._text;
        const county = item.fylkesnavn[0]._text;
        const wkid = item.epsgKode[0]._text;
        
        const unprojectedGeometry = new Point({
          x, y, spatialReference: { wkid }
        });

        const geometry = projection.project(unprojectedGeometry, view.spatialReference) as esri.Point;

        const attributes = { x, y, name, ssrId, status, SpName, type, municipality, county, wkid };
        const popupTemplate = new PopupTemplate({
          title: "{name}, {municipality}, {county}",
          content: [{
            type: "fields",
            fieldInfos: [{
              fieldName: "type",
              label: "Property Type"
            }, {
              fieldName: "municipality",
              label: "Municipality"
            }, {
              fieldName: "county",
              label: "County"
            }, {
              fieldName: "status",
              label: "Status"
            }, {
              fieldName: "y",
              label: "latitude"
            }, {
              fieldName: "x",
              label: "longitude"
            }]
          }]
        });
        const feature = new Graphic({ geometry, attributes, popupTemplate });
        const extent = new Extent({
          xmax: geometry.x + 1000,
          xmin: geometry.x - 1000,
          ymax: geometry.y + 1000,
          ymin: geometry.y - 1000,
          spatialReference: geometry.spatialReference.clone()
        });

        return { 
          name: `${name}, ${municipality}, ${county}`,
          feature, 
          extent 
        };
         
      });

      console.log("results: ", searchResults);

      if(filterGeometry){
        searchResults = searchResults.filter( result => {
          return filterGeometry.contains(result.feature.geometry as Point);
        });
      }

      if(suggestMunicipality){
        searchResults = searchResults.filter( result => {
          return result.feature.attributes.municipality === suggestMunicipality;
        });
      }

      if(suggestCounty){
        searchResults = searchResults.filter( result => {
          return result.feature.attributes.county === suggestCounty;
        });
      }

      return searchResults;
    }

    const search = new Search({
      view,
      includeDefaultSources: false,
      sources: [ norwayPlaceNameSearchLocator ],
      maxSuggestions: 50,
    });

    search.viewModel.on("select-result", (e) => {
      console.log(e);
    })

    view.ui.add(search, "top-right");

  })();
} catch (error){ 
  console.error(error);
}
