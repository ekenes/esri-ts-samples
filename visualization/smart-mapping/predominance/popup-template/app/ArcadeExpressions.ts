import esri = __esri;
import PopupTemplate = require("esri/PopupTemplate");

export function getSuggestedTemplateIndex(hasSize: boolean, hasOpacity: boolean): number {
  let index = 0;

  if (hasSize && hasOpacity){
    index = 7;
  }
  if (hasSize && !hasOpacity){
    index = 6;
  }
  if (!hasSize && hasOpacity){
    index = 3;
  }

  return index;
}

export function getPopupTemplateTypes(): Array<string> {
  return [
    "Predominant category",
    "Predominant value",
    "Margin of victory",
    "Strength of predominance",
    "Ordered list of values",
    "Basic summary",
    "Predominant category with total",
    "Predominant category with total and strength"
  ];
}

export function generatePopupTemplates(params: esri.predominanceCreateRendererParams): PopupTemplate[] {
  return [
    generateCategoryPopupTemplate(params),
    generateValuePopupTemplate(params),
    generateGapPopupTemplate(params),
    generateStrengthPopupTemplate(params),
    generateTopListPopupTemplate(params),
    generateBasicSummaryPopupTemplate(params),
    generateSizeSummaryPopupTemplate(params),
    generateSizeStrengthSummaryPopupTemplate(params)
  ]
}

interface predominanceFields {
  name: string,
  label?: string
}

function createArcadeFields (fieldNames: string[]): string[] {
  return fieldNames.map( fieldName => `$feature["${fieldName}"]`);
}

function generatePredominantValueArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ]; 
    var numFields = ${arcadeFields.length};
    var maxValueField = null;
    var maxValue = -Infinity;
    var value, i;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];

      if(value > 0) {
        if(value > maxValue) {
          maxValue = value;
          maxValueField = fieldNames[i];
        }
        else if (value == maxValue) {
          maxValueField = null;
        }
      }
      
    }
    
    return maxValueField;
  `;
}

function generatePredominantAliasArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));
  const fieldAliases = fieldInfos.map( field => {
    return field.label ? `"${field.label}"` : `"${field.name}"`;
  });

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ]; 
    var fieldAliases = [ ${fieldAliases} ];
    var numFields = ${arcadeFields.length};
    var maxFieldAlias = null;
    var maxValue = -Infinity;
    var value, i;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];

      if(value > 0) {
        if(value > maxValue) {
          maxValue = value;
          maxFieldAlias = fieldAliases[i];
        }
        else if (value == maxValue) {
          maxFieldAlias = "Tie";
        }
      }
      
    }
    return maxFieldAlias;
  `;
}

function generatePredominantTotalArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ];
    var numFields = ${arcadeFields.length};
    var value, i, totalValue;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];

      if(value != null && value >= 0) {
        if (totalValue == null) { totalValue = 0; }
        totalValue = totalValue + value;
      }
    }
    return totalValue;
  `;
}

function generatePredominantStrengthArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));
  const fieldAliases = fieldInfos.map( field => {
    return field.label ? `"${field.label}"` : `"${field.name}"`;
  });

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ];
    var fieldAliases = [ ${fieldAliases} ];
    var numFields = ${arcadeFields.length};
    var maxFieldAlias = null;
    var maxValue = -Infinity;
    var value, i, totalValue;

    for(i = 0; i < numFields; i++) {
      value = fieldNames[i];
      if(value > 0) {
        if(value > maxValue) {
          maxValue = value;
          maxFieldAlias = fieldAliases[i];
        }
        else if (value == maxValue) {
          maxFieldAlias = "Tie";
        }
      }
      if(value != null && value >= 0) {
        if (totalValue == null) { totalValue = 0; }
        totalValue = totalValue + value;
      }
    }
    
    var strength = null;
  
    if (maxFieldAlias != "Tie" && totalValue > 0) {
      strength = (maxValue / totalValue) * 100;
    }
  
    return strength;
  `;
}

function generatePredominantGapArcade(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

  return `
    ${arcadeFields.join(`\n`)}
    var fieldNames = [ ${arcadeFields} ];
    var totalValue = Sum(fieldNames);
    var order = Reverse(Sort(fieldNames));
  
    return IIF(totalValue > 0, Round(((order[0] - order[1]) / totalValue) * 100, 2), null);
  `;
}

function generateOrderedFieldList(fieldInfos: predominanceFields[]): string {
  const arcadeFields = createArcadeFields(fieldInfos.map( field => field.name ));

  const arcadeGroups = fieldInfos.map( fieldInfo => {
    return `{
      value: $feature["${fieldInfo.name}"],
      alias: "${fieldInfo.label}"
    }`;
  });

  return `
    ${arcadeFields.join(`\n`)};
    var groups = [ ${arcadeGroups} ];
    var numTopValues = Count(groups);

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
}

export function generateCategoryPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }],
    content: `
      The most common category in this area is 
      <b>{expression/predominant-category}</b>.
    `
  });
}

export function generateStrengthPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-value`,
      title: `Predominant Value`,
      expression: generatePredominantValueArcade(fieldInfos)
    }, {
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }],
    fieldInfos: [{
      fieldName: `expression/predominant-value`,
      format: {
        digitSeparator: true,
        places: 1
      }
    }, {
      fieldName: `expression/predominant-category`
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    content: `
       With a value of {expression/predominant-value}, <b>{expression/predominant-category}</b> 
       is the most common category of ${predominanceTitle} in this area, 
       which is <b>{expression/predominant-strength}%</b> of all categories combined.
     `
  });
}

export function generateValuePopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-value`,
      title: `Predominant Value`,
      expression: generatePredominantValueArcade(fieldInfos)
    }, {
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }],
    fieldInfos: [{
      fieldName: `expression/predominant-value`,
      format: {
        digitSeparator: true,
        places: 1
      }
    }, {
      fieldName: `expression/predominant-category`
    }],
    content: `The most common category in this area is <b>{expression/predominant-category}</b>, 
      which has a value of <b>{expression/predominant-value}</b>.`
  });
}

export function generateTopListPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
    }],
    title: predominanceTitle,
    content: `{expression/ordered-values}`
  });
}

export function generateGapPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-value`,
      title: `Predominant Value`,
      expression: generatePredominantValueArcade(fieldInfos)
    }, {
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }, {
      name: `predominant-gap`,
      title: `Margin of Victory`,
      expression: generatePredominantGapArcade(fieldInfos)
    }],
    fieldInfos: [{
      fieldName: `expression/predominant-value`,
      format: {
        digitSeparator: true,
        places: 1
      }
    }, {
      fieldName: `expression/predominant-category`
    }, {
      fieldName: `expression/predominant-gap`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    title: `Most common {expression/predominant-category}`,
    content: `
      <b>{expression/predominant-category}</b> has a value of <b>{expression/predominant-value}</b>, 
      which beats all other <b>categories</b> by a margin of <b>{expression/predominant-gap}</b> percentage points.
    `
  });
}

export function generateBasicSummaryPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }, {
      name: `ordered-values`,
      title: `List of values`,
      expression: generateOrderedFieldList(fieldInfos)
    }],
    content: `
      <div style="text-align: center;">
        <b><font size="5">{expression/predominant-category}</font></b>
        <br><br>
      </div>
      {expression/ordered-values}
    `
  });
}

export function generateSizeSummaryPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-value`,
      title: `Predominant Value`,
      expression: generatePredominantValueArcade(fieldInfos)
    }, {
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }, {
      name: `total`,
      title: `Sum all categories`,
      expression: generatePredominantTotalArcade(fieldInfos)
    }],
    fieldInfos: [{
      fieldName: `expression/predominant-value`,
      format: {
        digitSeparator: true,
        places: 1
      }
    }, {
      fieldName: `expression/predominant-category`
    }, {
      fieldName: `expression/total`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    content: `
      With a value of {expression/predominant-value}, <b>{expression/predominant-category}</b> is the most 
      common category of all {expression/total} ${predominanceTitle} in this area.
    `
  });
}

export function generateSizeStrengthSummaryPopupTemplate(params: esri.predominanceCreateRendererParams): PopupTemplate {
  const fieldInfos = params.fields;
  const predominanceTitle = params.legendOptions && params.legendOptions.title ? params.legendOptions.title : `competing fields`;

  return new PopupTemplate({
    expressionInfos: [{
      name: `predominant-value`,
      title: `Predominant Value`,
      expression: generatePredominantValueArcade(fieldInfos)
    }, {
      name: `predominant-category`,
      title: `Predominant Category`,
      expression: generatePredominantAliasArcade(fieldInfos)
    }, {
      name: `total`,
      title: `Sum all categories`,
      expression: generatePredominantTotalArcade(fieldInfos)
    }, {
      name: `predominant-strength`,
      title: `Strength of Predominance`,
      expression: generatePredominantStrengthArcade(fieldInfos)
    }],
    fieldInfos: [{
      fieldName: `expression/predominant-value`,
      format: {
        digitSeparator: true,
        places: 1
      }
    }, {
      fieldName: `expression/predominant-category`
    }, {
      fieldName: `expression/total`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }, {
      fieldName: `expression/predominant-strength`,
      format: {
        digitSeparator: true,
        places: 0
      }
    }],
    content: `
      With a value of {expression/predominant-value}, <b>{expression/predominant-category}</b> is the most 
      common category in this area, which makes up <b>{expression/predominant-strength}%</b> 
      of all {expression/total} ${predominanceTitle}.
    `
  });
}

export function generateSizePopupTemplate(params: esri.sizeCreateContinuousRendererParams): PopupTemplate {
  const fieldName = params.field;
  const fieldDescription = params.legendOptions.title;
  return new PopupTemplate({
    fieldInfos: [{
      fieldName,
      format: {
        digitSeparator: true,
        places: 1
      }
    }],
    content: `
      <b>${fieldDescription}:</b> {${fieldName}}
    `
  });
}