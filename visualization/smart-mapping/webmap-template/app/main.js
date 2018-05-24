define(["require", "exports", "esri/WebMap", "esri/views/MapView"], function (require, exports, WebMap, MapView) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var map = new WebMap({
        portalItem: {
            id: "1f1506c2c5314668b74920c353e5c0ff"
        }
    });
    var view = new MapView({
        map: map,
        container: "viewDiv"
    });
    var themeSelect, fieldSelect, normalizationFieldSelect;
    view.when()
        .then(function () {
        var layer = getVisibleLayer(view);
        return layer.when();
    })
        .then(createDomElements);
    // field select
    // normalization field select (none by default)
    // sliders
    // themes select
    // filter widget based on:
    //   - field values (unique types)
    //   - field names
    function createDomElements() {
        view.ui.add("controlsDiv", "bottom-left");
        themeSelect = document.getElementById("themeSelect");
        var layer = getVisibleLayer(view);
        // fieldSelect = document.getElementById("fieldSelect");
        var selectList = document.getElementsByTagName("select");
        var fieldSelect = selectList[0];
        var normalizationFieldSelect = selectList[1];
        addOptionsToSelectFromFields(fieldSelect, layer.fields);
        addOptionsToSelectFromFields(normalizationFieldSelect, layer.fields);
    }
    // helper function for returning a layer instance
    // based on a given layer title
    function findLayerByTitle(view, title) {
        return view.map.layers.find(function (layer) {
            return layer.title === title;
        });
    }
    // Gets the first visible layer in the view
    function getVisibleLayer(view) {
        return view.map.layers.find(function (layer) {
            return layer.visible;
        });
    }
    function addOptionsToSelectFromFields(select, fields) {
        var option = document.createElement("option");
        option.value = "";
        option.text = "";
        option.selected = true;
        select.appendChild(option);
        fields.forEach(function (field) {
            var option = document.createElement("option");
            option.value = field.name;
            option.text = field.alias;
            select.appendChild(option);
        });
    }
    // helper function for formatting number labels with commas
    function numberWithCommas(value) {
        value = value || 0;
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});
//# sourceMappingURL=main.js.map