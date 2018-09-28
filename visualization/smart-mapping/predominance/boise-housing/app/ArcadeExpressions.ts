export const top10Arcade = `
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

export const totalArcade = `
  Text( Sum( $feature.ACSBLT1939,
        $feature.ACSBLT1940,
        $feature.ACSBLT1950,
        $feature.ACSBLT1960,
        $feature.ACSBLT1970,
        $feature.ACSBLT1980,
        $feature.ACSBLT1990,
        $feature.ACSBLT2000,
        $feature.ACSBLT2010,
        $feature.ACSBLT2014),
  "#,###");
`;