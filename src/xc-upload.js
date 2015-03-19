
var app = angular.module('xcomponents');

app.directive('xcUpload', ['$http', 'xcDataFactory', function($http, xcDataFactory) {

	return {

		scope : {
			title : '@',
			url : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-upload.html',

		controller : function($scope) {

			$scope.targetWidth = 0;
			$scope.targetHeight = 0;
			$scope.doCrop = false;
			$scope.customSelect = null;
			$scope.orientation = 0;
			$scope.uploadInProgress = false;
		
			$scope.init = function() {
				
				this.customSelect = $('.js-custom-select-var').text();
				
				if (this.customSelect != null && this.customSelect.length>0) {
				
					// move the 'photo select' button to a custom location
					var move = $('.js-photouploader-upload');
					var to = $(this.customSelect);
					
					if (move.length==1 && to.length==1) {
						move.appendTo(to);
						
						// hide the default photo select
						$('.js-photouploader .photoUpload').hide();

					}
				}
			};
	
			$scope.loadImage = function( file) {
				
				loadImage(
			        file,
			        function (canvas) {
			        	
			        	// clean up
			            $('.js-photouploader-preview img, .js-photouploader canvas').remove();
			            
			            canvas.id = 'photoUploadCanvas';
			     
			        	$('.js-photouploader-preview').append(canvas);
			        	$('.js-photouploader-rotate').removeClass('hidden');
			        	$('.js-photouploader-preview .fa').addClass('hidden');
			        },
			        {
			        	maxWidth : $scope.targetWidth,
			        	maxHeight : $scope.targetHeight,
			        	crop : $scope.doCrop,
			        	canvas : true,
			        	orientation : $scope.orientation
			        }
				);

			};
				
			$scope.rotateImage = function(clockWise) {
				
				var $resizeFileUpload = $('.js-photouploader-upload');
				
				if ( $resizeFileUpload[0].files.length === 0) {
					return;
				}
				var file = $resizeFileUpload[0].files[0];

				if ($scope.orientation == 0) {
					$scope.orientation = (clockWise ? 6 : 8);
				} else if ($scope.orientation == 6) {
					$scope.orientation = (clockWise ? 3 : 0);
				} else if ($scope.orientation == 3) {
					$scope.orientation = (clockWise ? 8 : 6);
				} else if ($scope.orientation == 8) {
					$scope.orientation = (clockWise ? 0 : 3);
				}
				
				$scope.loadImage(file);
			};

			$scope.savePhoto = function() {

				//get the file input
				var $resizeFileUpload = $('.js-photouploader-upload');
				var files = $resizeFileUpload[0].files;
				if (typeof files == 'undefined' || files.length === 0 ) {
					return;
				}
						
				//show a spinner icon in the upload button
				$scope.uploadInProgress = true;
				
				var _resizedFile = files[0];

				//create FormData object to send all form data to Unplugged
				var fd = new FormData();
				                            
				//now add the resized image to the FormData object and send it
				var canvas = document.getElementById('photoUploadCanvas');
			     
			    if (canvas.toBlob) {

				    canvas.toBlob(
				        function (blob) {

				        	blob.name = _resizedFile.name;

				            fd.append( 'file', blob, _resizedFile.name );
				            
				            $http.post( $scope.url, fd, {
								transformRequest: angular.identity,
								headers: {'Content-Type': undefined}
				            }).then( function(res) {
				            	alert('Photo Saved');
				            	$scope.uploadInProgress = false;
				            });
				            
				        },
				        'image/jpeg'
				    );
				}

			};

		}

	};

}]);