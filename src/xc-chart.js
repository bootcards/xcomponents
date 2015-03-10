
var app = angular.module('xcomponents');

app.directive('xcChart', function() {

	return {

		scope : {
			title : '@',
			chartId : '@',
			chartType : '@',
			valuePrefix : '@'
		},

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-chart.html',

		controller : function($scope, $rootScope, $window, $timeout, xcUtils) {

			var charts = xcUtils.getConfig('charts');

			if (typeof $scope.chartId == "undefined") {
				console.error("Chart: missing chart id, e.g. chart-id=\"closed-sales\";");
			}

			$scope.chartData = charts[$scope.chartId];

			$scope.chartTotal = 0;
			for (var i=0; i<$scope.chartData.length; i++) {
				$scope.chartTotal += $scope.chartData[i].value;
			}

			angular.element($window).bind( 'resize', function() {
				if ($scope.chart) { $scope.chart.redraw(); }
			} );

			$scope.toggleChartData = function(event) {
				/* toggle between the chart and data */

				var $ev = $(event.target);
				var $chart = $ev.parents('.bootcards-chart');

				if ($chart.length>0) {
					$chart.fadeOut( 'fast', function()  {
						$chart
							.siblings('.bootcards-table')
								.fadeIn('fast');
					});
				} else {
				
					var $data = $ev.parents('.bootcards-table');
					$data.fadeOut( 'fast', function()  {
						$data
							.siblings('.bootcards-chart')
								.fadeIn('fast', function() {
									if (typeof chart != 'undefined' && chart != null) { chart.redraw();}
								});
					});

				}

			};

			//initial redraw (to make the chart fit the container)
			$timeout( function() {
				if ($scope.chart) { $scope.chart.redraw(); }
			}, 150);
			
		},

		link : function(scope, el, attrs) {

			var canvas = $(".js-chart-canvas", $(el));
			canvas.empty();

			//first property is the x key, other keys are the y keys
			var xkey = null;
			var ykeys = [];
			var ylabels = [];

			angular.forEach( scope.chartData[0], function(value, key) {
				if (!xkey) { 
					xkey = key;
				} else {
					ykeys.push( key);
					ylabels.push( key.substring(0,1).toUpperCase() + key.substring(1) );
				}
			});

			//draw the chart
			if (attrs.chartType === 'donut') {

				var drawDonutChart = function(el, chartData, valuePrefix) {

					//create custom Donut function with click event on the segments
					var myDonut = Morris.Donut;

					myDonut.prototype.redraw = function() {

						var C, cx, cy, i, idx, last, max_value, min, next, seg, total, value, w, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
				      this.raphael.clear();
				      cx = this.el.width() / 2;
				      cy = this.el.height() / 2;
				      w = (Math.min(cx, cy) - 10) / 3;
				      total = 0;
				      _ref = this.values;
				      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				        value = _ref[_i];
				        total += value;
				      }
				      min = 5 / (2 * w);
				      C = 1.9999 * Math.PI - min * this.data.length;
				      last = 0;
				      idx = 0;
				      this.segments = [];
				      _ref1 = this.values;
				      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
				        value = _ref1[i];
				        next = last + min + C * (value / total);
				        seg = new Morris.DonutSegment(cx, cy, w * 2, w, last, next, this.data[i].color || this.options.colors[idx % this.options.colors.length], this.options.backgroundColor, idx, this.raphael);
				        seg.render();
				        this.segments.push(seg);
				        seg.on('hover', this.select);
				        seg.on('click', this.select);
				        last = next;
				        idx += 1;
				      }
				      this.text1 = this.drawEmptyDonutLabel(cx, cy - 10, this.options.labelColor, 15, 800);
				      this.text2 = this.drawEmptyDonutLabel(cx, cy + 10, this.options.labelColor, 14);
				      max_value = Math.max.apply(Math, this.values);
				      idx = 0;
				      _ref2 = this.values;
				      _results = [];
				      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				        value = _ref2[_k];
				        if (value === max_value) {
				          this.select(idx);
				          break;
				        }
				        _results.push(idx += 1);
				      }
				      return _results;
					};

					return myDonut({
					    element: el,
					    data: chartData,
					    formatter: function (y, data) { 
					    	//prefixes the values by an $ sign, adds thousands seperators
							nStr = y + '';
							x = nStr.split('.');
							x1 = x[0];
							x2 = x.length > 1 ? '.' + x[1] : '';
							var rgx = /(\d+)(\d{3})/;
							while (rgx.test(x1)) {
								x1 = x1.replace(rgx, '$1' + ',' + '$2');
							}
							return valuePrefix + ' ' + x1 + x2;
					    }
					  });

				};

				scope.chart = drawDonutChart(canvas[0], scope.chartData, scope.valuePrefix);



			} else if (attrs.chartType === 'area') {

				scope.chart = Morris.Area({
				    element: canvas[0],
				    data: scope.chartData,
				    xkey: xkey,
				    ykeys: ykeys,
				    labels: ylabels,
				    pointSize: 2,
				    hideHover: 'auto'
				});

			} else if (attrs.chartType === 'line') {
					
				scope.chart = Morris.Line({
				    element: canvas[0],
				    data: scope.chartData,
				    xkey: xkey,
				    ykeys: ykeys,
				    labels: ylabels
				});

			} else if (attrs.chartType === 'bar') {

				scope.chart = Morris.Bar({
				    element: canvas[0],
				    data: scope.chartData,
				    xkey: xkey,
				    ykeys: ykeys,
				    labels: ylabels,
				    xLabelAngle: 20,
				    hideHover: 'auto'
				});
			}



		}

	};

});
