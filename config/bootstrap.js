/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var hound = require('hound');
var fs = require('fs');
//var os = require('os');
//var sys = require('util');
var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');

// Instantiate the socket client (`io`)
// (for now, you must explicitly pass in the socket.io client when using this library from Node.js)
var io = sailsIOClient(socketIOClient);

// Set some options:
// (you have to specify the host and port of the Sails backend when using this library from Node.js)
io.sails.url = 'http://localhost:1337';

module.exports.bootstrap = function(cb) {

	var watcher = hound.watch('output');

	watcher.on('create', function(file, stats) {
	  var fn = file.split('\\').pop().split('/').pop();
		if (fn.endsWith('.out')){
			var fname= file.split('\\').pop().split('/').pop().split('.out')[0];
			console.log(fname+ ' was created');

			User.findOne({
				name:fname
			}).exec(function (err, myuser){
				if (err) {
					sails.log(err);
				}
				if (!myuser) {
					sails.log('Could not find user, sorry.');
				}
				else{
					//sails.log('Found "%s"', myuser);
					
					if (myuser.history){
					  //sails.log('Found "%s"', myuser.history);
					  fs.readFile(file, 'utf8', function (err, file_data) {
						  // Print the contents of the file as a string here
						  // and do whatever other string processing you want
						   var lines =file_data.split('\n');
						  
						   var initial_result = lines[lines.length-2].split(' ');
						   if (initial_result && initial_result.length>0){
							    var game_mode = initial_result[1];
								var gname=initial_result[2];
								var mjobid= initial_result[3];
								var commit_evaluate= initial_result[4];
								Game.findOne({
									name:gname
								}).exec(function (err, mygame){
									
											if (mygame.initial_solution.length==0 && (commit_evaluate=='c' || commit_evaluate=='C') ){
												Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
													if (game_mode=='modena'){
														var moverall_cost=parseFloat(initial_result[5]);
														var mleakage=parseFloat(initial_result[6]).toFixed(2);
														var mwater_age=parseFloat(initial_result[7]);
														var mpressure_diff=parseFloat(initial_result[8]);
														var mnb_deficit_nodes=0;
														var indp=11;
														var junctions_nb = Object.keys(mynet.junctions).length;
														for (var i =0; i<junctions_nb;i++){
															var jid= initial_result[indp]
															indp++;
															var pmin = parseFloat(initial_result[indp]);
															indp++;
															indp++;
															indp++;
															if (jid){
																if (pmin<0){
																	mnb_deficit_nodes++;
																}
															}
														}
														
														
														Game.update({name:mygame.name},{initial_solution:initial_result, initialScore:{overall_cost: moverall_cost, leakage: mleakage, water_age: mwater_age, pressure_diff: mpressure_diff, nb_deficit_nodes:mnb_deficit_nodes}}).exec(function afterwards(errg, updated){
															mygame=null;
															mynet=null;
															myuser=null;
														});
													}
													else if (game_mode=='aqualibrium'){
														var reservoir_1=parseFloat(initial_result[5]);
														var reservoir_2=parseFloat(initial_result[6]);
														var reservoir_3=parseFloat(initial_result[7]);
														var score=parseFloat(initial_result[8]);
														var valid_score = initial_result[9];
														// update game intitial solution
														Game.update({name:mygame.name},{initial_solution:initial_result, initialScore:{res1:reservoir_1, res2: reservoir_2, res3: reservoir_3, overall_score: score, is_valid: valid_score}}).exec(function afterwards(errg, updated){
															mygame=null;
															mynet=null;
															myuser=null;
														});
													}
												});	
											}
											else if (mygame.initial_solution.length==0 && (commit_evaluate=='d' || commit_evaluate=='D') ){
												Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
													if (game_mode=='modena'){
														var moverall_cost=parseFloat(initial_result[5]);
														var mleakage=parseFloat(initial_result[6]).toFixed(2);
														var mwater_age=parseFloat(initial_result[7]);
														var mpressure_diff=parseFloat(initial_result[8]);
														var mnb_deficit_nodes=0;
														var indp=11;
														var junctions_nb = Object.keys(mynet.junctions).length;
														for (var i =0; i<junctions_nb;i++){
															var jid= initial_result[indp]
															indp++;
															var pmin = parseFloat(initial_result[indp]);
															indp++;
															indp++;
															indp++;
															if (jid){
																if (pmin<0){
																	mnb_deficit_nodes++;
																}
															}
														}
														var dm_teams_updated= mygame.dm_teams_updated;
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= myuser.name;
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														dm_teams_updated[myteam]=true;
														
														Game.update({name:mygame.name},{initial_solution:initial_result, dm_teams_updated:dm_teams_updated,initialScore:{overall_cost: moverall_cost, leakage: mleakage, water_age: mwater_age, pressure_diff: mpressure_diff, nb_deficit_nodes:mnb_deficit_nodes}}).exec(function afterwards(errg, updated){
															mygame=null;
															mynet=null;
															myuser=null;
														});
													}
													else if (game_mode=='aqualibrium'){
														var reservoir_1=parseFloat(initial_result[5]);
														var reservoir_2=parseFloat(initial_result[6]);
														var reservoir_3=parseFloat(initial_result[7]);
														var score=parseFloat(initial_result[8]);
														var valid_score = initial_result[9];
														
														var dm_teams_updated= mygame.dm_teams_updated;
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= myuser.name;
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														dm_teams_updated[myteam]=true;
														// update game intitial solution
														Game.update({name:mygame.name},{initial_solution:initial_result, initialScore:{res1:reservoir_1, res2: reservoir_2, res3: reservoir_3, overall_score: score, is_valid: valid_score}}).exec(function afterwards(errg, updated){
															mygame=null;
															mynet=null;
															myuser=null;
														});
													}
												});	
											}
											else if (myuser.admin==true){
												// if (myuser.history.hasOwnProperty(mygame.name)){
													// myuser.history[mygame.name].push(initial_result);
												// }
												// else{
													// myuser.history[mygame.name]=[];
													// myuser.history[mygame.name].push(initial_result);
												// }
												// User.update({name:myuser.name},{history:myuser.history}).exec(function afterwards(erru, updated){
													// if (erru) {
													// sails.log(erru);
													// }
													// io.socket.put('/updatedm', {name: myuser.name, game:mygame.name, last_result: initial_result},function gotResponse(body, response) {
														// console.log('Server sending request ot server ');
													// })
												// });
											}
											else{
												if(commit_evaluate=='c' || commit_evaluate=='C'){
													Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
														if (game_mode=='modena'){
															var myteam= "";
															if ( mygame.team_size==1){
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															else{
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															
															// fill in last solution for corresponding team
															mygame.last_solution[myteam]=initial_result;
															
															var nb_pipes=Object.keys(mygame.pipes_roles).length;
															var compact_history_start=initial_result.slice(1, 11);
															var compact_history_end= {};
															for (var i=initial_result.length-1-(nb_pipes*3),j=initial_result.length-1;i<j;i+=3){
																if (initial_result[i+2]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																	compact_history_end[initial_result[i]]=initial_result[i+2];
																}
															}
															// fill in game state only with inputs ans corresponding results from the time
															if (mygame.game_state.hasOwnProperty(myteam)){
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															else{
																mygame.game_state[myteam]=[];
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															var newbest=false;
															var firstbest= '';
															if (mygame.overallBest.hasOwnProperty('team')){
																firstbest = mygame.overallBest['team'];
															}
															// get new score
															var moverall_cost=parseFloat(initial_result[5]);
															var mleakage=parseFloat(initial_result[6]).toFixed(2);
															var mwater_age=parseFloat(initial_result[7]);
															var mpressure_diff=parseFloat(initial_result[8]);
															var mnb_deficit_nodes=0;
															var indp=11;
															var junctions_nb = Object.keys(mynet.junctions).length;
															for (var i =0; i<junctions_nb;i++){
																var jid= initial_result[indp]
																indp++;
																var pmin = parseFloat(initial_result[indp]);
																indp++;
																indp++;
																indp++;
																if (jid){
																	if (pmin<0){
																		mnb_deficit_nodes++;
																	}
																}
															}
															// if score different than initial calibration score then do something
															// if score different than initial calibration score then do something
															if ((mygame.initialScore.overall_cost!= moverall_cost) ||
																(mygame.initialScore.leakage!= mleakage) ||
																(mygame.initialScore.water_age!= mwater_age) ||
																(mygame.initialScore.pressure_diff!= mpressure_diff) ||
																(mygame.initialScore.nb_deficit_nodes!= mnb_deficit_nodes)){
																// if there is no best score yet, update it and put this team as first in the ranking
																if (Object.keys(mygame.overallBest).length==0 && mnb_deficit_nodes==0){
																	mygame.overallBest['team']=myteam;
																	mygame.overallBest['overall_cost']=moverall_cost;
																	mygame.overallBest['leakage']=mleakage;
																	mygame.overallBest['water_age']=mwater_age;
																	mygame.overallBest['pressure_diff']=mpressure_diff;
																	mygame.overallBest['nb_deficit_nodes']=mnb_deficit_nodes;
																	mygame.sessionBests=[{team: myteam, overall_cost: moverall_cost,overall_cost_rk:1, leakage: mleakage,leakage_rk:1, water_age: mwater_age,water_age_rk:1, pressure_diff: mpressure_diff,pressure_diff_rk:1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:1}]
																	newbest = true;
																}
																else if (mnb_deficit_nodes==0){
																	
																	// if team already exists, replace score, otherwise,  push new team score into array of scores
																	var isIn=false;
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		if (mygame.sessionBests[s]['team']==myteam){
																			mygame.sessionBests[s]={team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1}
																			isIn=true;
																		}
																	}
																	if (isIn==false){
																		mygame.sessionBests.push({team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1})
																	}
																	
																	// reorder list by cost values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_cost'])- parseFloat(b['overall_cost'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['overall_cost_rk']=s+1;
																	}
																	
																	// reorder list by leakage values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['leakage'])- parseFloat(b['leakage'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['leakage_rk']=s+1;
																	}
																	
																	// reorder list by water age values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['water_age'])- parseFloat(b['water_age'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['water_age_rk']=s+1;
																	}
																																									
																	// finally, reorder list by sum of all rankings
																	mygame.sessionBests.sort(function(a, b){return (a['overall_cost_rk']+a['leakage_rk']+a['water_age_rk'])- (b['overall_cost_rk']+b['leakage_rk']+b['water_age_rk'])});
																	
																	// update overallBest
																	mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																	mygame.overallBest['overall_cost']=mygame.sessionBests[0]['overall_cost'];
																	mygame.overallBest['leakage']==mygame.sessionBests[0]['leakage'];
																	mygame.overallBest['water_age']==mygame.sessionBests[0]['water_age'];
																	mygame.overallBest['pressure_diff']==mygame.sessionBests[0]['pressure_diff'];
																	mygame.overallBest['nb_deficit_nodes']==mygame.sessionBests[0]['nb_deficit_nodes'];
																	
																	
															
																	if (firstbest!= mygame.overallBest['team']){
																		newbest=true;
																	}
															
																}
															}
																
															Game.update({name:mygame.name},{game_state:mygame.game_state , last_solution: mygame.last_solution, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
																io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																	//console.log('Server sending request ot server ');
																	mygame=null;
																	mynet=null;
																	myuser=null;
																})
															});
														}
														else if (game_mode=='aqualibrium'){
															var myteam= "";
															if ( mygame.team_size==1){
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															else{
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															
															// fill in last solution for corresponding team
															mygame.last_solution[myteam]=initial_result;
															
															var nb_pipes=Object.keys(mygame.pipes_roles).length;
															var compact_history_start=initial_result.slice(1, 10);
															var compact_history_end= {};
															for (var i=initial_result.length-1-(nb_pipes*2),j=initial_result.length-1;i<j;i+=2){
																if (initial_result[i+1]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																	compact_history_end[initial_result[i]]=initial_result[i+1];
																}
															}
															// fill in game state only with inputs ans corresponding results from the time
															if (mygame.game_state.hasOwnProperty(myteam)){
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															else{
																mygame.game_state[myteam]=[];
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															var newbest=false;
															var firstbest= '';
															if (mygame.overallBest.hasOwnProperty('team')){
																firstbest = mygame.overallBest['team'];
															}
															// get new score
															var reservoir_1=parseFloat(initial_result[5]);
															var reservoir_2=parseFloat(initial_result[6]);
															var reservoir_3=parseFloat(initial_result[7]);
															var score=parseFloat(initial_result[8]);
															var valid_score = initial_result[9];
															//{initial_solution:initial_result, initialScore:{res1:reservoir_1, res2: reservoir_2, res3: reservoir_3, overall_score: score, is_valid: valid_score}}
															if ((mygame.initialScore.overall_score!= score) ||
																(mygame.initialScore.res1!= reservoir_1) ||
																(mygame.initialScore.res2!= reservoir_2) ||
																(mygame.initialScore.res3!= reservoir_3) ){
																// if there is no best score yet, update it and put this team as first in the ranking
																if (Object.keys(mygame.overallBest).length==0 && (valid_score===true || valid_score==="true" || valid_score==='true')){
																	mygame.overallBest['team']=myteam;
																	mygame.overallBest['overall_score']=score;
																	mygame.overallBest['res1']=reservoir_1;
																	mygame.overallBest['res2']=reservoir_2;
																	mygame.overallBest['res3']=reservoir_3;
																	mygame.sessionBests=[{team: myteam, overall_score: score,overall_score_rk:1}]
																	newbest = true;
																}
																else if (valid_score===true || valid_score==="true" || valid_score==='true'){
																	
																	// if team already exists, replace score, otherwise,  push new team score into array of scores
																	var isIn=false;
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		if (mygame.sessionBests[s]['team']==myteam){
																			mygame.sessionBests[s]={team: myteam, overall_score: score,overall_score_rk:-1}
																			isIn=true;
																		}
																	}
																	if (isIn==false){
																		mygame.sessionBests.push({team: myteam, overall_score: score,overall_score_rk:-1})
																	}
																	
																	// reorder list by cost values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_score'])- parseFloat(b['overall_score'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['overall_score_rk']=s+1;
																	}
																	if (mygame.overallBest['overall_score']>mygame.sessionBests[0]['overall_score']){																						
																		// update overallBest
																		mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																		mygame.overallBest['overall_score']=mygame.sessionBests[0]['overall_score'];
																		mygame.overallBest['res1']==mygame.sessionBests[0]['res1'];
																		mygame.overallBest['res2']==mygame.sessionBests[0]['res2'];
																		mygame.overallBest['res3']==mygame.sessionBests[0]['res3'];
																		if (firstbest!= mygame.overallBest['team']){
																			newbest=true;
																		}
																	}
															
																}
															}
																
															Game.update({name:mygame.name},{game_state:mygame.game_state , last_solution: mygame.last_solution, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
																io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																	//console.log('Server sending request ot server ');
																	mygame=null;
																	mynet=null;
																	myuser=null;
																})
															});
														}
													});
												}
												else if(commit_evaluate=='d' || commit_evaluate=='D'){
													Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
														if (game_mode=='modena'){
															var myteam= "";
															if ( mygame.team_size==1){
																myteam= myuser.name;
															}
															else{
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															
															// fill in last solution for corresponding team
															mygame.last_solution[myteam]=initial_result;
															
															var nb_pipes=Object.keys(mygame.pipes_roles).length;
															var compact_history_start=initial_result.slice(1, 11);
															var compact_history_end= {};
															for (var i=initial_result.length-1-(nb_pipes*3),j=initial_result.length-1;i<j;i+=3){
																if (initial_result[i+2]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																	compact_history_end[initial_result[i]]=initial_result[i+2];
																}
															}
															// fill in game state only with inputs ans corresponding results from the time
															if (mygame.game_state.hasOwnProperty(myteam)){
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															else{
																mygame.game_state[myteam]=[];
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															var newbest=false;
															var firstbest= '';
															if (mygame.overallBest.hasOwnProperty('team')){
																firstbest = mygame.overallBest['team'];
															}
															// get new score
															var moverall_cost=parseFloat(initial_result[5]);
															var mleakage=parseFloat(initial_result[6]).toFixed(2);
															var mwater_age=parseFloat(initial_result[7]);
															var mpressure_diff=parseFloat(initial_result[8]);
															var mnb_deficit_nodes=0;
															var indp=11;
															var junctions_nb = Object.keys(mynet.junctions).length;
															for (var i =0; i<junctions_nb;i++){
																var jid= initial_result[indp]
																indp++;
																var pmin = parseFloat(initial_result[indp]);
																indp++;
																indp++;
																indp++;
																if (jid){
																	if (pmin<0){
																		mnb_deficit_nodes++;
																	}
																}
															}
															// if score different than initial calibration score then do something
															// if score different than initial calibration score then do something
															if ((mygame.initialScore.overall_cost!= moverall_cost) ||
																(mygame.initialScore.leakage!= mleakage) ||
																(mygame.initialScore.water_age!= mwater_age) ||
																(mygame.initialScore.pressure_diff!= mpressure_diff) ||
																(mygame.initialScore.nb_deficit_nodes!= mnb_deficit_nodes)){
																// if there is no best score yet, update it and put this team as first in the ranking
																if (Object.keys(mygame.overallBest).length==0 && mnb_deficit_nodes==0){
																	mygame.overallBest['team']=myteam;
																	mygame.overallBest['overall_cost']=moverall_cost;
																	mygame.overallBest['leakage']=mleakage;
																	mygame.overallBest['water_age']=mwater_age;
																	mygame.overallBest['pressure_diff']=mpressure_diff;
																	mygame.overallBest['nb_deficit_nodes']=mnb_deficit_nodes;
																	mygame.sessionBests=[{team: myteam, overall_cost: moverall_cost,overall_cost_rk:1, leakage: mleakage,leakage_rk:1, water_age: mwater_age,water_age_rk:1, pressure_diff: mpressure_diff,pressure_diff_rk:1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:1}]
																	newbest = true;
																}
																else if (mnb_deficit_nodes==0){
																	
																	// if team already exists, replace score, otherwise,  push new team score into array of scores
																	var isIn=false;
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		if (mygame.sessionBests[s]['team']==myteam){
																			mygame.sessionBests[s]={team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1}
																			isIn=true;
																		}
																	}
																	if (isIn==false){
																		mygame.sessionBests.push({team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1})
																	}
																	
																	// reorder list by cost values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_cost'])- parseFloat(b['overall_cost'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['overall_cost_rk']=s+1;
																	}
																	
																	// reorder list by leakage values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['leakage'])- parseFloat(b['leakage'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['leakage_rk']=s+1;
																	}
																	
																	// reorder list by water age values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['water_age'])- parseFloat(b['water_age'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['water_age_rk']=s+1;
																	}
																																									
																	// finally, reorder list by sum of all rankings
																	mygame.sessionBests.sort(function(a, b){return (a['overall_cost_rk']+a['leakage_rk']+a['water_age_rk'])- (b['overall_cost_rk']+b['leakage_rk']+b['water_age_rk'])});
																	
																	// update overallBest
																	mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																	mygame.overallBest['overall_cost']=mygame.sessionBests[0]['overall_cost'];
																	mygame.overallBest['leakage']==mygame.sessionBests[0]['leakage'];
																	mygame.overallBest['water_age']==mygame.sessionBests[0]['water_age'];
																	mygame.overallBest['pressure_diff']==mygame.sessionBests[0]['pressure_diff'];
																	mygame.overallBest['nb_deficit_nodes']==mygame.sessionBests[0]['nb_deficit_nodes'];
																	
																	
															
																	if (firstbest!= mygame.overallBest['team']){
																		newbest=true;
																	}
															
																}
															}
															var dm_teams_updated= mygame.dm_teams_updated;
															var myteam= "";
															if ( mygame.team_size==1){
																myteam= myuser.name;
															}
															else{
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															dm_teams_updated[myteam]=true;	
															Game.update({name:mygame.name},{game_state:mygame.game_state , last_solution: mygame.last_solution, dm_teams_updated:dm_teams_updated, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
																io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																	//console.log('Server sending request ot server ');
																	mygame=null;
																	mynet=null;
																	myuser=null;
																})
															});
														}
														else if (game_mode=='aqualibrium'){
															var myteam= "";
															if ( mygame.team_size==1){
																myteam= myuser.name;
															}
															else{
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															
															// fill in last solution for corresponding team
															mygame.last_solution[myteam]=initial_result;
															
															var nb_pipes=Object.keys(mygame.pipes_roles).length;
															var compact_history_start=initial_result.slice(1, 10);
															var compact_history_end= {};
															for (var i=initial_result.length-1-(nb_pipes*2),j=initial_result.length-1;i<j;i+=2){
																if (initial_result[i+1]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																	compact_history_end[initial_result[i]]=initial_result[i+1];
																}
															}
															// fill in game state only with inputs ans corresponding results from the time
															if (mygame.game_state.hasOwnProperty(myteam)){
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															else{
																mygame.game_state[myteam]=[];
																mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
															}
															var newbest=false;
															var firstbest= '';
															if (mygame.overallBest.hasOwnProperty('team')){
																firstbest = mygame.overallBest['team'];
															}
															// get new score
															var reservoir_1=parseFloat(initial_result[5]);
															var reservoir_2=parseFloat(initial_result[6]);
															var reservoir_3=parseFloat(initial_result[7]);
															var score=parseFloat(initial_result[8]);
															var valid_score = initial_result[9];
															
															// if score different than initial calibration score then do something
															// if score different than initial calibration score then do something
															if ((mygame.initialScore.overall_score!= score) ||
																(mygame.initialScore.res1!= reservoir_1) ||
																(mygame.initialScore.res2!= reservoir_2) ||
																(mygame.initialScore.res3!= reservoir_3) ){
																// if there is no best score yet, update it and put this team as first in the ranking											
																if (Object.keys(mygame.overallBest).length==0 && (valid_score===true || valid_score==="true" || valid_score==='true')){
																	mygame.overallBest['team']=myteam;
																	mygame.overallBest['overall_score']=score;
																	mygame.overallBest['res1']=reservoir_1;
																	mygame.overallBest['res2']=reservoir_2;
																	mygame.overallBest['res3']=reservoir_3;
																	mygame.sessionBests=[{team: myteam, overall_score: score,overall_score_rk:1}]
																	newbest = true;
																}
																else if (valid_score===true || valid_score==="true" || valid_score==='true'){
																	
																	// if team already exists, replace score, otherwise,  push new team score into array of scores
																	var isIn=false;
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		if (mygame.sessionBests[s]['team']==myteam){
																			mygame.sessionBests[s]={team: myteam, overall_score: score,overall_score_rk:-1}
																			isIn=true;
																		}
																	}
																	if (isIn==false){
																		mygame.sessionBests.push({team: myteam, overall_score: score,overall_score_rk:-1})
																	}
																	
																	// reorder list by cost values from smallest to biggest
																	mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_score'])- parseFloat(b['overall_score'])});
																	// take not of each team ranking and replace rank value in the lot
																	
																	for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																		mygame.sessionBests[s]['overall_score_rk']=s+1;
																	}
																	
																	// update overallBest
																	mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																	mygame.overallBest['overall_score']=mygame.sessionBests[0]['overall_score'];
																	mygame.overallBest['res1']==mygame.sessionBests[0]['res1'];
																	mygame.overallBest['res2']==mygame.sessionBests[0]['res2'];
																	mygame.overallBest['res3']==mygame.sessionBests[0]['res3'];
																	if (firstbest!= mygame.overallBest['team']){
																		newbest=true;
																	}
															
																}
															}
															var dm_teams_updated= mygame.dm_teams_updated;
															var myteam= "";
															if ( mygame.team_size==1){
																myteam= myuser.name;
															}
															else{
																myteam= mygame.players_teams[myuser.name]['team'];
															}
															dm_teams_updated[myteam]=true;	
															Game.update({name:mygame.name},{game_state:mygame.game_state , last_solution: mygame.last_solution, dm_teams_updated:dm_teams_updated, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
																io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																	//console.log('Server sending request ot server ');
																	mygame=null;
																	mynet=null;
																	myuser=null;
																})
															});
														}
													});
												}
												else{
													if (game_mode=='modena'){
														io.socket.put('/update', {name: myuser.name , game:mygame.name, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok']},function gotResponse(body, response) {
															mygame=null;
															myuser=null;
														})
													}
												}
											}
									
								});
						   }						  						  		
					  });
					}					
				}

			});
		}
	})

	watcher.on('change', function(file, stats) {
	  //console.log(file + ' was changed');
	 
	  var fn = file.split('\\').pop().split('/').pop();
		if (fn.endsWith('.out')){
			var fname= file.split('\\').pop().split('/').pop().split('.out')[0];
			console.log(fname+ ' was updated');

			User.findOne({
				name:fname
			}).exec(function (err, myuser){
				if (err) {
					sails.log(err);
				}
				if (!myuser) {
					sails.log('Could not find user, sorry.');
				}
				else{
					//sails.log('Found "%s"', myuser);
					if (myuser.history){
					  //sails.log('Found "%s"', myuser.history);
					  fs.readFile(file, 'utf8', function (err, file_data) {
						  // Print the contents of the file as a string here
						  // and do whatever other string processing you want
						  var lines =file_data.split('\n');
						  var initial_result = lines[lines.length-2].split(' ');
						   if (initial_result && initial_result.length>0){
							    var game_mode = initial_result[1];
								var gname=initial_result[2];
								var mjobid= initial_result[3];
								var commit_evaluate= initial_result[4];
								
								Game.findOne({
									name:gname
								}).exec(function (err, mygame){
									
								
										if (mygame.initial_solution.length==0 && (commit_evaluate=='c' || commit_evaluate=='C')){
											Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
												if (mygame.game_mode=='modena'){
													var moverall_cost=parseFloat(initial_result[5]);
													var mleakage=parseFloat(initial_result[6]).toFixed(2);
													var mwater_age=parseFloat(initial_result[7]);
													var mpressure_diff=parseFloat(initial_result[8]);
													var mnb_deficit_nodes=0;
													var indp=11;
													var junctions_nb = Object.keys(mynet.junctions).length;
													for (var i =0; i<junctions_nb;i++){
														var jid= initial_result[indp]
														indp++;
														var pmin = parseFloat(initial_result[indp]);
														indp++;
														indp++;
														indp++;
														if (jid){
															if (pmin<0){
																mnb_deficit_nodes++;
															}
														}
													}
													Game.update({name:mygame.name},{initial_solution:initial_result, initialScore:{overall_cost: moverall_cost, leakage: mleakage, water_age: mwater_age, pressure_diff: mpressure_diff, nb_deficit_nodes:mnb_deficit_nodes}}).exec(function afterwards(errg, updated){
														mygame=null;
														mynet=null;
														myuser=null;
													});
												}
												else if (mygame.game_mode=='aqualibrium'){
													var reservoir_1=parseFloat(initial_result[5]);
													var reservoir_2=parseFloat(initial_result[6]);
													var reservoir_3=parseFloat(initial_result[7]);
													var score=parseFloat(initial_result[8]);
													var valid_score = initial_result[9];
													// update game intitial solution
													Game.update({name:mygame.name},{initial_solution:initial_result, initialScore:{res1:reservoir_1, res2: reservoir_2, res3: reservoir_3, overall_score: score, is_valid: valid_score}}).exec(function afterwards(errg, updated){
														mygame=null;
														mynet=null;
														myuser=null;
													});
												}
											});
										}
										else if (myuser.admin==true){
											// if (myuser.history.hasOwnProperty(mygame.name)){
												// myuser.history[mygame.name].push(initial_result);
											// }
											// else{
												// myuser.history[mygame.name]=[];
												// myuser.history[mygame.name].push(initial_result);
											// }
											// User.update({name:myuser.name},{history:myuser.history}).exec(function afterwards(erru, updated){
												// if (erru) {
												// sails.log(erru);
												// }
												// io.socket.put('/updatedm', {name: myuser.name ,history: [lines.length-2, initial_result]},function gotResponse(body, response) {
													// console.log('Server sending request ot server ');
												// })
											// });
										}
										else{
											if(commit_evaluate=='c' || commit_evaluate=='C'){
												Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
													if (mygame.game_mode=='modena'){
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}										
														
														mygame.last_solution[myteam]=initial_result;
														var nb_pipes=Object.keys(mygame.pipes_roles).length;
														var compact_history_start=initial_result.slice(1, 11);
														var compact_history_end= {};
														for (var i=initial_result.length-1-(nb_pipes*3),j=initial_result.length-1;i<j;i+=3){
															if (initial_result[i+2]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																compact_history_end[initial_result[i]]=initial_result[i+2];
															}
														}
														
														// fill in game state only with inputs ans corresponding results from the time
														if (mygame.game_state.hasOwnProperty(myteam)){
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														else{
															mygame.game_state[myteam]=[];
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														// get new score
														var newbest=false;
														var firstbest= '';
														if (mygame.overallBest.hasOwnProperty('team')){
															firstbest = mygame.overallBest['team'];
														}
														var moverall_cost=parseFloat(initial_result[5]);
														var mleakage=parseFloat(initial_result[6]).toFixed(2);
														var mwater_age=parseFloat(initial_result[7]);
														var mpressure_diff=parseFloat(initial_result[8]);
														var mnb_deficit_nodes=0;
														var indp=11;
														var junctions_nb = Object.keys(mynet.junctions).length;
														for (var i =0; i<junctions_nb;i++){
															var jid= initial_result[indp]
															indp++;
															var pmin = parseFloat(initial_result[indp]);
															indp++;
															indp++;
															indp++;
															if (jid){
																if (pmin<0){
																	mnb_deficit_nodes++;
																}
															}
														}
														// if score different than initial calibration score then do something
														if ((mygame.initialScore.overall_cost!= moverall_cost) ||
															(mygame.initialScore.leakage!= mleakage) ||
															(mygame.initialScore.water_age!= mwater_age) ||
															(mygame.initialScore.pressure_diff!= mpressure_diff) ||
															(mygame.initialScore.nb_deficit_nodes!= mnb_deficit_nodes)){
															// if there is no best score yet, update it and put this team as first in the ranking
															if (Object.keys(mygame.overallBest).length==0 && mnb_deficit_nodes==0){
																mygame.overallBest['team']=myteam;
																mygame.overallBest['overall_cost']=moverall_cost;
																mygame.overallBest['leakage']=mleakage;
																mygame.overallBest['water_age']=mwater_age;
																mygame.overallBest['pressure_diff']=mpressure_diff;
																mygame.overallBest['nb_deficit_nodes']=mnb_deficit_nodes;
																mygame.sessionBests=[{team: myteam, overall_cost: moverall_cost,overall_cost_rk:1, leakage: mleakage,leakage_rk:1, water_age: mwater_age,water_age_rk:1, pressure_diff: mpressure_diff,pressure_diff_rk:1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:1}]
																newbest = true;
															}
															else if (mnb_deficit_nodes==0){
																
																// if team already exists, replace score, otherwise,  push new team score into array of scores
																var isIn=false;
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	if (mygame.sessionBests[s]['team']==myteam){
																		mygame.sessionBests[s]={team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1}
																		isIn=true;
																	}
																}
																if (isIn==false){
																	mygame.sessionBests.push({team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1})
																}
																
																// reorder list by cost values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_cost'])- parseFloat(b['overall_cost'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['overall_cost_rk']=s+1;
																}
																
																// reorder list by leakage values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['leakage'])- parseFloat(b['leakage'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['leakage_rk']=s+1;
																}
																
																// reorder list by water age values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['water_age'])- parseFloat(b['water_age'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['water_age_rk']=s+1;
																}
																																								
																// finally, reorder list by sum of all rankings
																mygame.sessionBests.sort(function(a, b){return (a['overall_cost_rk']+a['leakage_rk']+a['water_age_rk'])- (b['overall_cost_rk']+b['leakage_rk']+b['water_age_rk'])});
																
																// update overallBest
																mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																mygame.overallBest['overall_cost']=mygame.sessionBests[0]['overall_cost'];
																mygame.overallBest['leakage']==mygame.sessionBests[0]['leakage'];
																mygame.overallBest['water_age']==mygame.sessionBests[0]['water_age'];
																mygame.overallBest['pressure_diff']==mygame.sessionBests[0]['pressure_diff'];
																mygame.overallBest['nb_deficit_nodes']==mygame.sessionBests[0]['nb_deficit_nodes'];
														
																if (firstbest!= mygame.overallBest['team']){																							
																	newbest=true;
																}												
															}
														}
														// re-rank all existing teams scores
																											
														
														Game.update({name:mygame.name},{game_state:mygame.game_state, last_solution: mygame.last_solution, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
															io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																mygame=null;
																mynet=null;
																myuser=null;
															})
														});
													}
													else if (mygame.game_mode=='aqualibrium'){
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														
														// fill in last solution for corresponding team
														mygame.last_solution[myteam]=initial_result;
														
														var nb_pipes=Object.keys(mygame.pipes_roles).length;
														var compact_history_start=initial_result.slice(1, 10);
														var compact_history_end= {};
														for (var i=initial_result.length-1-(nb_pipes*2),j=initial_result.length-1;i<j;i+=2){
															if (initial_result[i+1]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																compact_history_end[initial_result[i]]=initial_result[i+1];
															}
														}
														// fill in game state only with inputs ans corresponding results from the time
														if (mygame.game_state.hasOwnProperty(myteam)){
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														else{
															mygame.game_state[myteam]=[];
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														var newbest=false;
														var firstbest= '';
														if (mygame.overallBest.hasOwnProperty('team')){
															firstbest = mygame.overallBest['team'];
														}
														// get new score
														var reservoir_1=parseFloat(initial_result[5]);
														var reservoir_2=parseFloat(initial_result[6]);
														var reservoir_3=parseFloat(initial_result[7]);
														var score=parseFloat(initial_result[8]);
														var valid_score = initial_result[9];
														//{initial_solution:initial_result, initialScore:{res1:reservoir_1, res2: reservoir_2, res3: reservoir_3, overall_score: score, is_valid: valid_score}}
														if ((mygame.initialScore.overall_score!= score) ||
															(mygame.initialScore.res1!= reservoir_1) ||
															(mygame.initialScore.res2!= reservoir_2) ||
															(mygame.initialScore.res3!= reservoir_3) ){
															// if there is no best score yet, update it and put this team as first in the ranking
															if (Object.keys(mygame.overallBest).length==0 && (valid_score===true || valid_score==="true" || valid_score==='true')){
																
																mygame.overallBest['team']=myteam;
																mygame.overallBest['overall_score']=score;
																mygame.overallBest['res1']=reservoir_1;
																mygame.overallBest['res2']=reservoir_2;
																mygame.overallBest['res3']=reservoir_3;
																mygame.sessionBests=[{team: myteam, overall_score: score,overall_score_rk:1}]
																newbest = true;
															}
															else if (valid_score===true || valid_score==="true" || valid_score==='true'){
																
																// if team already exists, replace score, otherwise,  push new team score into array of scores
																var isIn=false;
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	if (mygame.sessionBests[s]['team']==myteam){
																		mygame.sessionBests[s]={team: myteam, overall_score: score,overall_score_rk:-1}
																		isIn=true;
																	}
																}
																if (isIn==false){
																	mygame.sessionBests.push({team: myteam, overall_score: score,overall_score_rk:-1})
																}
																
																// reorder list by cost values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_score'])- parseFloat(b['overall_score'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['overall_score_rk']=s+1;
																}
																if (mygame.overallBest && mygame.overallBest.hasOwnProperty('overall_score')){
																	if (parseFloat(mygame.overallBest['overall_score'])>parseFloat(mygame.sessionBests[0]['overall_score'])){																						
																		// update overallBest
																		mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																		mygame.overallBest['overall_score']=mygame.sessionBests[0]['overall_score'];
																		mygame.overallBest['res1']==mygame.sessionBests[0]['res1'];
																		mygame.overallBest['res2']==mygame.sessionBests[0]['res2'];
																		mygame.overallBest['res3']==mygame.sessionBests[0]['res3'];
																		if (firstbest!= mygame.overallBest['team']){
																			newbest=true;
																		}
																	}
																}
														
															}
														}
														
														Game.update({name:mygame.name},{game_state:mygame.game_state , last_solution: mygame.last_solution, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
															io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest/*, state:mygame.game_state*/},function gotResponse(body, response) {
																//console.log('Server sending request ot server ');
																mygame=null;
																mynet=null;
																myuser=null;
															})
														});
													}
												
												});
												
											}
											else if(commit_evaluate=='d' || commit_evaluate=='D'){
												Network.findOne({ where: { name: mygame.network_name }, select: ['junctions'] }).exec(function (nerr, mynet){
													if (mygame.game_mode=='modena'){
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= myuser.name;
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}										
														
														mygame.last_solution[myteam]=initial_result;
														var nb_pipes=Object.keys(mygame.pipes_roles).length;
														var compact_history_start=initial_result.slice(1, 11);
														var compact_history_end= {};
														for (var i=initial_result.length-1-(nb_pipes*3),j=initial_result.length-1;i<j;i+=3){
															if (initial_result[i+2]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																compact_history_end[initial_result[i]]=initial_result[i+2];
															}
														}
														
														// fill in game state only with inputs ans corresponding results from the time
														if (mygame.game_state.hasOwnProperty(myteam)){
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														else{
															mygame.game_state[myteam]=[];
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														// get new score
														var newbest=false;
														var firstbest= '';
														if (mygame.overallBest.hasOwnProperty('team')){
															firstbest = mygame.overallBest['team'];
														}
														var moverall_cost=parseFloat(initial_result[5]);
														var mleakage=parseFloat(initial_result[6]).toFixed(2);
														var mwater_age=parseFloat(initial_result[7]);
														var mpressure_diff=parseFloat(initial_result[8]);
														var mnb_deficit_nodes=0;
														var indp=10;
														var junctions_nb = Object.keys(mynet.junctions).length;
														for (var i =0; i<junctions_nb;i++){
															var jid= initial_result[indp]
															indp++;
															var pmin = parseFloat(initial_result[indp]);
															indp++;
															indp++;
															indp++;
															if (jid){
																if (pmin<0){
																	mnb_deficit_nodes++;
																}
															}
														}
														// if score different than initial calibration score then do something
														if ((mygame.initialScore.overall_cost!= moverall_cost) ||
															(mygame.initialScore.leakage!= mleakage) ||
															(mygame.initialScore.water_age!= mwater_age) ||
															(mygame.initialScore.pressure_diff!= mpressure_diff) ||
															(mygame.initialScore.nb_deficit_nodes!= mnb_deficit_nodes)){
															// if there is no best score yet, update it and put this team as first in the ranking
															if (Object.keys(mygame.overallBest).length==0 && mnb_deficit_nodes==0){
																mygame.overallBest['team']=myteam;
																mygame.overallBest['overall_cost']=moverall_cost;
																mygame.overallBest['leakage']=mleakage;
																mygame.overallBest['water_age']=mwater_age;
																mygame.overallBest['pressure_diff']=mpressure_diff;
																mygame.overallBest['nb_deficit_nodes']=mnb_deficit_nodes;
																mygame.sessionBests=[{team: myteam, overall_cost: moverall_cost,overall_cost_rk:1, leakage: mleakage,leakage_rk:1, water_age: mwater_age,water_age_rk:1, pressure_diff: mpressure_diff,pressure_diff_rk:1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:1}]
																newbest = true;
															}
															else if (mnb_deficit_nodes==0){
																
																// if team already exists, replace score, otherwise,  push new team score into array of scores
																var isIn=false;
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	if (mygame.sessionBests[s]['team']==myteam){
																		mygame.sessionBests[s]={team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1}
																		isIn=true;
																	}
																}
																if (isIn==false){
																	mygame.sessionBests.push({team: myteam, overall_cost: moverall_cost,overall_cost_rk:-1, leakage: mleakage,leakage_rk:-1, water_age: mwater_age,water_age_rk:-1, pressure_diff: mpressure_diff,pressure_diff_rk:-1, nb_deficit_nodes:mnb_deficit_nodes, nb_deficit_nodes_rk:-1})
																}
																
																// reorder list by cost values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_cost'])- parseFloat(b['overall_cost'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['overall_cost_rk']=s+1;
																}
																
																// reorder list by leakage values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['leakage'])- parseFloat(b['leakage'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['leakage_rk']=s+1;
																}
																
																// reorder list by water age values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['water_age'])- parseFloat(b['water_age'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['water_age_rk']=s+1;
																}
																																								
																// finally, reorder list by sum of all rankings
																mygame.sessionBests.sort(function(a, b){return (a['overall_cost_rk']+a['leakage_rk']+a['water_age_rk'])- (b['overall_cost_rk']+b['leakage_rk']+b['water_age_rk'])});
																
																// update overallBest
																mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																mygame.overallBest['overall_cost']=mygame.sessionBests[0]['overall_cost'];
																mygame.overallBest['leakage']==mygame.sessionBests[0]['leakage'];
																mygame.overallBest['water_age']==mygame.sessionBests[0]['water_age'];
																mygame.overallBest['pressure_diff']==mygame.sessionBests[0]['pressure_diff'];
																mygame.overallBest['nb_deficit_nodes']==mygame.sessionBests[0]['nb_deficit_nodes'];
														
																if (firstbest!= mygame.overallBest['team']){																							
																	newbest=true;
																}												
															}
														}
														// re-rank all existing teams scores
														var dm_teams_updated= mygame.dm_teams_updated;
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= myuser.name;
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														dm_teams_updated[myteam]=true;														
														
														Game.update({name:mygame.name},{game_state:mygame.game_state, dm_teams_updated:dm_teams_updated,last_solution: mygame.last_solution, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
															io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																mygame=null;
																mynet=null;
																myuser=null;
															})
														});
													}
													else if (mygame.game_mode=='aqualibrium'){
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= myuser.name;
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														
														// fill in last solution for corresponding team
														mygame.last_solution[myteam]=initial_result;
														
														var nb_pipes=Object.keys(mygame.pipes_roles).length;
														var compact_history_start=initial_result.slice(1, 10);
														var compact_history_end= {};
														for (var i=initial_result.length-1-(nb_pipes*2),j=initial_result.length-1;i<j;i+=2){
															if (initial_result[i+1]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																compact_history_end[initial_result[i]]=initial_result[i+1];
															}
														}
														// fill in game state only with inputs ans corresponding results from the time
														if (mygame.game_state.hasOwnProperty(myteam)){
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														else{
															mygame.game_state[myteam]=[];
															mygame.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														var newbest=false;
														var firstbest= '';
														if (mygame.overallBest.hasOwnProperty('team')){
															firstbest = mygame.overallBest['team'];
														}
														// get new score
														var reservoir_1=parseFloat(initial_result[5]);
														var reservoir_2=parseFloat(initial_result[6]);
														var reservoir_3=parseFloat(initial_result[7]);
														var score=parseFloat(initial_result[8]);
														var valid_score = initial_result[9];
														
														// if score different than initial calibration score then do something
														// if score different than initial calibration score then do something
														if ((mygame.initialScore.overall_score!= score) ||
															(mygame.initialScore.res1!= reservoir_1) ||
															(mygame.initialScore.res2!= reservoir_2) ||
															(mygame.initialScore.res3!= reservoir_3) ){
															// if there is no best score yet, update it and put this team as first in the ranking											
															if (Object.keys(mygame.overallBest).length==0 && (valid_score===true || valid_score==="true" || valid_score==='true')){
																mygame.overallBest['team']=myteam;
																mygame.overallBest['overall_score']=score;
																mygame.overallBest['res1']=reservoir_1;
																mygame.overallBest['res2']=reservoir_2;
																mygame.overallBest['res3']=reservoir_3;
																mygame.sessionBests=[{team: myteam, overall_score: score,overall_score_rk:1}]
																newbest = true;
															}
															else if (valid_score===true || valid_score==="true" || valid_score==='true'){
																
																// if team already exists, replace score, otherwise,  push new team score into array of scores
																var isIn=false;
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	if (mygame.sessionBests[s]['team']==myteam){
																		mygame.sessionBests[s]={team: myteam, overall_score: score,overall_score_rk:-1}
																		isIn=true;
																	}
																}
																if (isIn==false){
																	mygame.sessionBests.push({team: myteam, overall_score: score,overall_score_rk:-1})
																}
																
																// reorder list by cost values from smallest to biggest
																mygame.sessionBests.sort(function(a, b){return parseFloat(a['overall_score'])- parseFloat(b['overall_score'])});
																// take not of each team ranking and replace rank value in the lot
																
																for (var s=0, maxs= mygame.sessionBests.length;s<maxs;s++){
																	mygame.sessionBests[s]['overall_score_rk']=s+1;
																}
																
																// update overallBest
																mygame.overallBest['team']=mygame.sessionBests[0]['team'];
																mygame.overallBest['overall_score']=mygame.sessionBests[0]['overall_score'];
																mygame.overallBest['res1']==mygame.sessionBests[0]['res1'];
																mygame.overallBest['res2']==mygame.sessionBests[0]['res2'];
																mygame.overallBest['res3']==mygame.sessionBests[0]['res3'];
																if (firstbest!= mygame.overallBest['team']){
																	newbest=true;
																}
														
															}
														}
														var dm_teams_updated= mygame.dm_teams_updated;
														var myteam= "";
														if ( mygame.team_size==1){
															myteam= myuser.name;
														}
														else{
															myteam= mygame.players_teams[myuser.name]['team'];
														}
														dm_teams_updated[myteam]=true;	
														Game.update({name:mygame.name},{game_state:mygame.game_state , last_solution: mygame.last_solution, dm_teams_updated:dm_teams_updated, overallBest:mygame.overallBest, sessionBests:mygame.sessionBests}).exec(function afterwards(errg, updated){
															io.socket.put('/update', {name: myuser.name , game:mygame.name, team:myteam, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok'], changedbest:newbest, changedbestdetail: mygame.overallBest},function gotResponse(body, response) {
																//console.log('Server sending request ot server ');
																mygame=null;
																mynet=null;
																myuser=null;
															})
														});
													}
												});
												
											}
											else{
												io.socket.put('/update', {name: myuser.name , game:mygame.name, last_result: initial_result, type:commit_evaluate, jobid:mjobid,history:['ok']},function gotResponse(body, response) {
													mygame=null;
													myuser=null;
												})
											}
										}
									
								});
						   }
						  
						  // var new_session={'sessions':[]}
						  // for(var line = 0; line < lines.length; line++){  
						    // new_session['sessions'].push(lines[line].split(' '))
						  // } 
						  // //console.log(new_session['sessions']);
						  // //console.log(file_data);
						  // User.update({name:myuser.name},{history:new_session}).exec(function afterwards(err, updated){

						    // if (err) {
							// sails.log(err);
						    // }

						    // //console.log('Updated user to have history ' + updated[0].history);
						    // console.log('Updated user history ');			
						    // io.socket.put('/update', {name: myuser.name ,history: [new_session['sessions'].length-2, new_session['sessions'][new_session['sessions'].length-2]]},function gotResponse(body, response) {
							// console.log('Server sending request ot server ');
						    // })
					
						  // });
			
					  });
					}
					// else{
						// //sails.log('"%s" has no history', myuser.name);
						// // if the user is an admin, there is a chance that this is a game initialisation where the default base setting of the game will be computed
						// if (myuser.admin){
							// fs.readFile(file, 'utf8', function (errf, file_data) {
								// var lines =file_data.split('\n');
								// var initial_result=[];
								// initial_result=lines[lines.length-2].split(' ');
								// if (initial_result && initial_result.length>0){
									// var gname=initial_result[1];
									// Game.update({name:gname},{initial_solution:initial_result}).exec(function afterwards(errg, updated){});
									
								// }
							// });
						// }
					// }
				}

			});
		}
	})
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
