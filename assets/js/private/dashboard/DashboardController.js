angular.module('DashboardModule').controller('DashboardController', ['$scope','$window', '$http','$timeout' ,'toastr', function($scope, $window, $http,$timeout, toastr){
	// set-up loginForm loading state
	//$scope.gameForm = {
	//	loading: false
	//	//history:
	//}
	$scope.selectForm = function(){

		// // Set the loading state (i.e. show loading spinner)
		//$scope.gameForm.loading = true;
		
		// //$scope.gameForm.history = $window.myuser['name']+' '+$window.myuser['name']
		// //console.log($window.latest_diameters)
		// var tmp_sessions = $window.myuser['history']['sessions'];
		// var end_sessions="";
		// var latest_input = $window.latest_diameters;
		// for (var i=0;i<latest_input.length;i++){
			// if (i<latest_input.length-1){
				// end_sessions+=latest_input[i]+" ";
			// }
			// else{
				// end_sessions+=latest_input[i]
			// }
			
		// }
		// //if (tmp_sessions.length==1){
		// //	end_sessions = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0";
		// //}
		// //else{
		// //	console.log("new data!")
		// //	end_sessions = $window.myuser['history']['sessions'][tmp_sessions.length-2].slice(1, 22).join(" ");
		// //}
		// //console.log($window.myuser['name']+' '+end_sessions)
		// $scope.gameForm.history= $window.myuser['name']+' '+end_sessions;
		// // Submit request to Sails.
		// //console.log($scope.gameForm.name)
		// //console.log($scope.gameForm.history)
		// $http.put('/dashboard', {
			// history: $scope.gameForm.history,
			// //name: $scope.gameForm.name
			// //title: $scope.signupForm.title,
			// //history: '{"sessions":[0]}',
			// //email: $scope.signupForm.email,
			// //password: $scope.signupForm.password
		// })
		// .catch(function onError(sailsResponse){
			// toastr.error(sailsResponse+'', 'Error', {
			  // closeButton: true
			// });
			// return;
		// // Handle known error type(s).
		// // If using sails-disk adpater -- Handle Duplicate Key
		// })
		// .finally(function eitherWay(){
			// $scope.gameForm.loading = false;
		// })
	}
	
	
}
]);
