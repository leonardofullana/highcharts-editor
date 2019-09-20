/******************************************************************************

Copyright (c) 2016-2019, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

// @format
/** Map selector
 */

highed.MapSelector = function(chartPreview) {
  var events = highed.events(),
      predefinedMaps = highed.dom.cr('div', ''),
      importContainer = highed.dom.cr('div', ''),
      container = highed.dom.cr('div', 'highed-table-dropzone-container'),
      mapSelectorContainer = highed.dom.cr('div'),
      mapSelectorMapContainer = highed.dom.cr('div', 'highed-map-selector-container'),
      mapSelectorGeojsonContainer = highed.dom.cr('div', 'highed-map-geojson-container'),
      mapSelectorGeojsonCodeContainer = highed.dom.cr('div', ''),
      mapSelectorGeojsonNameContainer =  highed.dom.cr('div', ''),
      mapSelectorGeojsonCodeDropdown = highed.DropDown(mapSelectorGeojsonCodeContainer, 'highed-map-import-dropdown'),
      mapSelectorGeojsonNameDropdown = highed.DropDown(mapSelectorGeojsonNameContainer, 'highed-map-import-dropdown'),
      mapTable = highed.MapTable(mapSelectorMapContainer, {
        selects: [],
        header: 'Link Values',
        skipOrdering: true,
        readOnly: true,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        extra: highed.dom.ap(
          highed.dom.cr('div', 'highed-map-select-geojson'),
          highed.dom.ap(
            highed.dom.cr('div', 'highed-map-geojson-label', 'Code:'),
            mapSelectorGeojsonCodeContainer
          ),
          highed.dom.ap(
            highed.dom.cr('div', 'highed-map-geojson-label', 'Name:'),
            mapSelectorGeojsonNameContainer
          )
        ),
      });

  function createMapDataSection(toNextPage, cb) {

    if (highed.chartType && highed.chartType === 'Map' && Highcharts) {

      var baseMapPath = "https://code.highcharts.com/mapdata/",
          mapCount = 0,
          mapOptions = highed.dom.cr('div', 'highed-map-selector');
          mapSelectorImages = highed.dom.cr('div', 'highed-map-selector-images-container');

      function getSearchResults(query) {
        mapOptions.innerHTML = '';
        mapSelectorImages.innerHTML = '';
        mapCount = 0;

        Object.keys(Highcharts.mapDataIndex).forEach(function (mapGroup, maps) {
            if (mapGroup !== "version") {
              var found = false;
              var mapSelectorOptions = highed.dom.cr('div', 'highed-map-selector-options');
              Object.keys(Highcharts.mapDataIndex[mapGroup]).forEach(function (desc, path) {
                var pos = (desc.toLowerCase()).search(query.toLowerCase());
                if (pos > -1) {
                  //mapOptions += '<option value="' + path + '">' + desc + '</option>';
                  const option = highed.dom.cr('div', 'highed-map-option', desc);
                  var options = [option];

                  highed.dom.ap(mapSelectorOptions, option);

                  if (mapCount < 25) {
                    var mapSelectorImage = highed.dom.cr('img', 'highed-map-selector-image'),
                        mapSelectorImageContainer = highed.dom.cr('div', 'highed-map-selector-image-container'),
                        mapSelectorImageTitle = highed.dom.cr('div', 'highed-map-selector-image-text', desc);

                    mapSelectorImage.src = baseMapPath + (Highcharts.mapDataIndex[mapGroup][desc]).replace('.js', '.svg');
                    highed.dom.ap(mapSelectorImageContainer,mapSelectorImageTitle, mapSelectorImage);
                    highed.dom.ap(mapSelectorImages, mapSelectorImageContainer);
                    options.push(mapSelectorImageContainer);
                  }

                  highed.dom.on(options, 'click', function() {

                    var mapKey = Highcharts.mapDataIndex[mapGroup][desc].slice(0, -3),
                    svgPath = baseMapPath + mapKey + '.svg',
                    geojsonPath = baseMapPath + mapKey + '.geo.json',
                    javascriptPath = baseMapPath + Highcharts.mapDataIndex[mapGroup][desc];
                    
                    chartPreview.options.updateMap(mapKey, javascriptPath, function() {
                      highed.ajax({
                        url: geojsonPath,
                        type: 'GET',
                        dataType: 'json',
                        success: function(data) {
                          events.emit('LoadMapData', data.features);
                          if (toNextPage) toNextPage();
                        },
                        error: function(e) {
                        }
                      })
                    });


                  });

                  mapCount += 1;
                  found = true;
                }
              });

              if (found) highed.dom.ap(mapOptions, highed.dom.cr('div', 'highed-map-option-header', mapGroup), mapSelectorOptions);
            }
        });
      }

      getSearchResults('');
      searchText = 'Search ' + mapCount + ' maps';

      var input = highed.dom.cr('input', 'highed-map-selector-input');
      input.placeholder = 'Search ' + mapCount + ' maps';

      highed.dom.on(input, 'keyup', function(ev) {
        if (ev.target.value === '') { 
          mapOptions.classList.remove("active");
          return;
        }
        //if (!mapOptions.classList.contains('active')) mapOptions.classList += " active";
        getSearchResults(ev.target.value); 
      });

      //mapOptions = '<option value="custom/world.js">' + searchText + '</option>' + mapOptions;
      var inputSelector = highed.dom.cr('div', 'highed-map-selector-arrow', '<i class="fa fa-chevron-down"/>');

      highed.dom.on(inputSelector, 'click', function() {
        if (mapOptions.classList.contains('active')) mapOptions.classList.remove('active');
        else mapOptions.classList += " active";
      });

      var importInput = highed.dom.cr('button', 'highed-ok-button highed-import-button', 'Select File');

      highed.dom.ap(importContainer, 
                    highed.dom.cr('hr'),
                    highed.dom.cr('div', 'highed-toolbox-body-title highed-map-import-geojson-header', 'Import GeoJSON Map'),
                    importInput);

      highed.dom.on(importInput, 'click', function() {
        highed.readLocalFile({
          type: 'text',
          accept: '.json',
          success: function(info) {
            var data = JSON.parse(info.data);
            chartPreview.data.updateMapData(data);
            if (data.features[0].properties.name && data.features[0].properties['hc-key']) {
              events.emit('LoadMapData', data.features);
              if (toNextPage) toNextPage();
            } else {
              // Dont have default keys, find out from user which they are and use them instead.
              var keys = Object.keys(data.features[0].properties);

              var dataArr = (data.features).slice(0,3).map(function(d) {
                return Object.keys(d.properties).map(function(key) {
                  return d.properties[key];
                })
              });

              (keys).forEach(function(option, i) {
                mapSelectorGeojsonCodeDropdown.addItem({
                  id: i,
                  title: option
                });
                mapSelectorGeojsonNameDropdown.addItem({
                  id: i,
                  title: option
                });
              });

              [{dropdown: mapSelectorGeojsonCodeDropdown, color: 'rgba(66, 200, 192, 0.2)'},
               {dropdown: mapSelectorGeojsonNameDropdown, color: 'rgba(145, 151, 229, 0.2)'}].forEach(function(option) {
                option.dropdown.on('Change', function(item) {
                  if (option.dropdown.previousValue) {
                    mapTable.removeHighlight(option.dropdown.previousValue.index());
                  }
                  mapTable.highlightColumns(item.index(), {
                    light: option.color
                  });
                  option.dropdown.previousValue = item;
                });
               });

              dataArr.unshift(keys);
              mapTable.createTable(dataArr, function(values) {
                if (mapSelectorGeojsonCodeDropdown.getSelectedItem() === false || mapSelectorGeojsonNameDropdown.getSelectedItem() === false) {
                  alert("Please assign the appropriate code/name pair from your dataset before continuing.");
                  return;
                }
                events.emit('LoadMapData', data.features, dataArr[0][mapSelectorGeojsonCodeDropdown.getSelectedItem().id()], dataArr[0][mapSelectorGeojsonNameDropdown.getSelectedItem().id()]);
                if (toNextPage) toNextPage();
              });
              
              mapSelectorGeojsonContainer.classList += ' active';
            }
          }
        });
      });

      highed.dom.ap(container, 
                    highed.dom.ap(
                      mapSelectorContainer,
                      highed.dom.ap(highed.dom.cr('div', ''), input, inputSelector), 
                      highed.dom.ap(highed.dom.cr('div', ''), mapOptions),
                      mapSelectorImages
                    ),
                    importContainer,
                    predefinedMaps,
                    highed.dom.ap(
                      mapSelectorGeojsonContainer,
                      mapSelectorMapContainer
                    ));
      return container
    }

  }

  function toggleVisible(element, style) {
    highed.dom.style(element, {
      display: style
    });
  }

  function showMaps(type, toNextPage) {
    if (!type || (type && (type.templateTitle !== 'Honeycomb' && type.templateTitle !== 'Tilemap Circle'))) {
      toggleVisible(mapSelectorContainer, 'block');
      toggleVisible(predefinedMaps, 'none');
      toggleVisible(importContainer, 'block');
    } else {
      const samples = highed.samples.getMap('Tilemap');
      
      predefinedMaps.innerHTML = '';

      Object.keys(samples).forEach(function(key) {
        var sample = samples[key];
        
        var container = highed.dom.cr('div', 'highed-chart-template-container highed-map-container'),
            thumbnail = highed.dom.cr('div', 'highed-chart-template-thumbnail'),
            title = highed.dom.cr('div', 'highed-map-text', sample.title);
            
        var mapType = type.templateTitle === 'Honeycomb' ? 'honeycomb' : 'circle';

        highed.dom.style(thumbnail, {
          'background-image': 'url(' + highed.option('thumbnailURL') + sample.thumbnail[mapType] + ')'
        });

        highed.dom.on(container, 'click', function() {
          events.emit('LoadDataSet', sample.dataset.join('\n'));
          if (sample.inverted) chartPreview.options.set('chart--inverted', sample.inverted);
          if (toNextPage) toNextPage();
        });
        
        highed.dom.ap(predefinedMaps, highed.dom.ap(container, thumbnail, title));
      });

      toggleVisible(predefinedMaps, 'block');
      toggleVisible(mapSelectorContainer, 'none');
      toggleVisible(importContainer, 'none');
    }
  }


  //////////////////////////////////////////////////////////////////////////////

  return {
    on: events.on,
    createMapDataSection: createMapDataSection,
    showMaps: showMaps
  };
};