
      var raster = new ol.layer.Tile({
        source: new ol.source.Stamen({
          layer: 'toner'
        })
      });

      var map = new ol.Map({
        layers: [raster, vector],
        target: 'map',
        view: new ol.View({
          center: ol.proj.fromLonLat([-97, 38]),
          zoom: 5
        })
      });


      blur.addEventListener('input', function() {
        vector.setBlur(parseInt(blur.value, 10));
      });

      radius.addEventListener('input', function() {
        vector.setRadius(parseInt(radius.value, 10));
      });
	var info = $('#info');
      info.tooltip({
        animation: false,
        trigger: 'manual'
      });

      var displayFeatureInfo = function(pixel) {
        info.css({
          left: pixel[0] + 'px',
          top: (pixel[1] - 15) + 'px'
        });
        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature) {
          info.tooltip('hide')
              .attr('data-original-title', feature.get('name'))
              .tooltip('fixTitle')
              .tooltip('show');
        } else {
          info.tooltip('hide');
        }
      };

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          info.tooltip('hide');
          return;
        }
        displayFeatureInfo(map.getEventPixel(evt.originalEvent));
      });

      map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
	});

