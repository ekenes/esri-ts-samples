define(["require", "exports", "esri/PopupTemplate"], function (require, exports, PopupTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createArcadeFields(fieldNames) {
        return fieldNames.map(function (fieldName) { return "$feature[\"" + fieldName + "\"]"; });
    }
    function generatePredominantValueArcade(fieldInfos) {
        var arcadeFields = createArcadeFields(fieldInfos.map(function (field) { return field.field; }));
        return "\n    " + arcadeFields.join("\n") + "\n    var fieldNames = [ " + arcadeFields + " ]; \n    var numFields = " + arcadeFields.length + ";\n    var maxValueField = null;\n    var maxValue = -Infinity;\n    var value, i;\n\n    for(i = 0; i < numFields; i++) {\n      value = fieldNames[i];\n\n      if(value > 0) {\n        if(value > maxValue) {\n          maxValue = value;\n          maxValueField = fieldNames[i];\n        }\n        else if (value == maxValue) {\n          maxValueField = null;\n        }\n      }\n      \n    }\n    \n    return maxValueField;\n  ";
    }
    function generatePredominantAliasArcade(fieldInfos) {
        var arcadeFields = createArcadeFields(fieldInfos.map(function (field) { return field.field; }));
        var fieldAliases = fieldInfos.map(function (field) {
            return field.label ? "\"" + field.label + "\"" : "\"" + field.field + "\"";
        });
        return "\n    " + arcadeFields.join("\n") + "\n    var fieldNames = [ " + arcadeFields + " ]; \n    var fieldAliases = [ " + fieldAliases + " ];\n    var numFields = " + arcadeFields.length + ";\n    var maxFieldAlias = null;\n    var maxValue = -Infinity;\n    var value, i;\n\n    for(i = 0; i < numFields; i++) {\n      value = fieldNames[i];\n\n      if(value > 0) {\n        if(value > maxValue) {\n          maxValue = value;\n          maxFieldAlias = fieldAliases[i];\n        }\n        else if (value == maxValue) {\n          maxFieldAlias = \"Tie\";\n        }\n      }\n      \n    }\n    return maxFieldAlias;\n  ";
    }
    function generatePredominantTotalArcade(fieldInfos) {
        var arcadeFields = createArcadeFields(fieldInfos.map(function (field) { return field.field; }));
        return "\n    " + arcadeFields.join("\n") + "\n    var fieldNames = [ " + arcadeFields + " ];\n    var numFields = " + arcadeFields.length + ";\n    var value, i, totalValue;\n\n    for(i = 0; i < numFields; i++) {\n      value = fieldNames[i];\n\n      if(value != null && value >= 0) {\n        if (totalValue == null) { totalValue = 0; }\n        totalValue = totalValue + value;\n      }\n    }\n    return totalValue;\n  ";
    }
    function generateOrderedFieldList(fieldInfos) {
        var arcadeFields = createArcadeFields(fieldInfos.map(function (field) { return field.field; }));
        var arcadeGroups = fieldInfos.map(function (fieldInfo) {
            return "{\n      value: $feature[\"" + fieldInfo.field + "\"],\n      alias: \"" + fieldInfo.label + "\"\n    }";
        });
        return "\n    " + arcadeFields.join("\n") + ";\n    var groups = [ " + arcadeGroups + " ];\n    var numTopValues = Count(groups);\n\n    function getValuesArray(a){\n      var valuesArray = []\n      for(var i in a){\n        valuesArray[i] = a[i].value;\n      }\n      return valuesArray;\n    }\n\n    function findAliases(top5a,fulla){\n      var aliases = [];\n      var found = \"\";\n      for(var i in top5a){\n        for(var k in fulla){\n          if(top5a[i] == fulla[k].value && Find(fulla[k].alias, found) == -1){\n            found += fulla[k].alias;\n            aliases[Count(aliases)] = {\n              alias: fulla[k].alias,\n              value: top5a[i]\n            };\n          }\n        }\n      }\n      return aliases;\n    }\n    \n    function getTopGroups(groupsArray){\n        \n      var values = getValuesArray(groupsArray);\n      var top5Values = IIF(Max(values) > 0, Top(Reverse(Sort(values)),numTopValues), \"no data\");\n      var top5Aliases = findAliases(top5Values,groupsArray);\n        \n      if(TypeOf(top5Values) == \"String\"){\n        return top5Values;\n      } else {\n        var content = \"\";\n        for(var i in top5Aliases){\n          if(top5Aliases[i].value > 0){\n            content += (i+1) + \". \" + top5Aliases[i].alias + \" (\" + Text(top5Aliases[i].value, \"#,###\") + \")\";\n            content += IIF(i < numTopValues-1, TextFormatting.NewLine, \"\");\n          }\n        }\n      }\n        \n      return content;\n    }\n    \n    getTopGroups(groups);\n  ";
    }
    function generateTopListPopupTemplate(fieldInfos) {
        return new PopupTemplate({
            expressionInfos: [{
                    name: "ordered-values",
                    title: "List of values",
                    expression: generateOrderedFieldList(fieldInfos)
                }],
            content: "{expression/ordered-values}"
        });
    }
    exports.generateTopListPopupTemplate = generateTopListPopupTemplate;
    function generateChartPopupTemplate(fieldInfos) {
        return new PopupTemplate({
            expressionInfos: [{
                    name: "predominant-value",
                    title: "Predominant Value",
                    expression: generatePredominantValueArcade(fieldInfos)
                }, {
                    name: "predominant-category",
                    title: "Predominant Category",
                    expression: generatePredominantAliasArcade(fieldInfos)
                }, {
                    name: "total",
                    title: "Sum all categories",
                    expression: generatePredominantTotalArcade(fieldInfos)
                }],
            fieldInfos: [{
                    fieldName: "expression/predominant-value",
                    format: {
                        digitSeparator: true,
                        places: 1
                    }
                }, {
                    fieldName: "expression/predominant-category"
                }, {
                    fieldName: "expression/total",
                    format: {
                        digitSeparator: true,
                        places: 0
                    }
                }],
            content: [{
                    type: "text",
                    text: "\n        <div style=\"text-align: center;\">\n        <b><font size=\"3\">{expression/predominant-category}</font></b>\n        </div>\n      "
                }, {
                    type: "media",
                    mediaInfos: {
                        type: "pie-chart",
                        value: {
                            fields: fieldInfos.map(function (info) { return info.label; })
                        }
                    }
                }]
        });
    }
    exports.generateChartPopupTemplate = generateChartPopupTemplate;
});
//# sourceMappingURL=ArcadeExpressions.js.map