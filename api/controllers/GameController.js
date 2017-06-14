/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var os = require('os');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var game_modes2views={'modena':'game/play_modena','nyc':'game/play_nyc','aqualibrium':'game/play_aqua','hydraulic':'game/play_hyd'};

module.exports = {
	create: function(req, res) {
		if (req.session.me) {
			User.findOne(req.session.me, function (err, user){
				if (err) {
				return res.negotiate(err);
				}

				if (!user) {
				sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
				return res.view('homepage');
				}

				User.find({select: ['name']}).exec(function(err, users) {
					Network.find({select: ['name','id']}).exec(function(err, networks) {
							  return res.view('game/gamecreator', {
								me: {
								  id: user.id,
								  name: user.name,
								  email: user.email,
								  //title: user.title,
								  //history: user.history,
								  admin: user.admin//,
								  //gravatarUrl: user.gravatarUrl
								},
								listusers: users,
								listnetworks: networks
							  });
					});
				});



			});



		}
	},
	
	settings: function(req, res) {
		if (req.session.me) {
			User.findOne(req.session.me, function (err, user){
				if (err) {
				return res.negotiate(err);
				}

				if (!user) {
				sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
				return res.view('homepage');
				}

				
				Game.findOne(req.param('nid')).exec(function(err2, mgame) {
					if (err2) {
						return res.negotiate(err2);
					}
					Network.findOne({name: mgame.network_name}, function foundUser(err3, net) {
						if (err3) {
							return res.negotiate(err3);
						}
						User.find({select: ['name']}).exec(function(err, users) {
							return res.view('game/gameeditor', {
								me: {
								  id: user.id,
								  name: user.name,
								  email: user.email,
								  //title: user.title,
								  //history: user.history,
								  admin: user.admin//,
								  //gravatarUrl: user.gravatarUrl
								},
								users,
								game: mgame,
								network: net
							});
						});
					});
				});
			});
		}
	},
	
	update: function(req, res) {
		if (req.session.me) {
			console.log('creating game')
			Game.create({
			  name: req.param('game-name'),
			  network_name: req.param('network-name'),
			  team_size: parseInt(req.param('team-size')),
			  players_teams: JSON.parse(req.param('players-teams')), 
			  initialScore: {},
			  is_on: false,
			  game_mode: req.param('game-mode'),
			  updates_on: true,
			  dm_teams_updated:{},
			  open_game:false,
			  time_points: parseInt(req.param('time-points')),
			  overallBest: {},
			  sessionBests: [],
			  pumps_roles:{},
			  valves_roles:{},
			  pipes_roles:{},
			  initial_solution:[],
			  last_solution:{},
			  game_state:{},
			  white_image:'',
			  black_image:'',
			  height_image:''
			}, function gameCreated(err, game) {
				// create an initial solution for the game to be picked up by users when they start the game
				User.findOne(req.session.me, function (err, user){
					if (err) {
					return res.negotiate(err);
					}
					var myos = os.type();
					var typos=0;
					if (myos.substring(0,3)=="Win"){
						typos=0;
					}
					else if (myos.substring(0,3)=="Dar"){
						typos=1;
					}
					else if (myos.substring(0,3)=="Lin"){
						typos=2;
					}
					else{
						typos=3;
					}
					//sails.log(typos);
					var fname;  
					if (typos==0){
						fname = 'assets\\game-engine';
					}
					else{
						fname = 'assets/game-engine';
					}
					
					var command;
					if (typos==0){
						// will have to add pipes, pumps, valves with list of changeable elements and corresponding diameters...
						if (game.game_mode=='modena'){
							command = 'assets\\game-engine\\cwsSeGWADE.exe "' + user.name+ '" "'+ game.game_mode+ '" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c';
						}
						else if (game.game_mode=='aqualibrium'){
							command = 'assets\\game-engine\\CWS_AquaLibrium_Server.v0.exe "'+ user.name+ '" "aqualibrium" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c "2" 0 "3" 0 "4" 0 "5" 0 "6" 0 "7" 0 "8" 0 "9" 0 "10" 0 "11" 0 "12" 0 "13" 0 "14" 0 "15" 0 "16" 0 "17" 0 "18" 0 "19" 0 "20" 0 "21" 0 "22" 0 "23" 0 "24" 0 "25" 0';
						}
						else if (game.game_mode=='nyc'){
							command = 'assets\\game-engine\\cwsNYTServer.v1.exe "'+ user.name+ '" "nyc" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c "101" 0 "102" 0 "103" 0 "104" 0 "105" 0 "106" 0 "107" 0 "108" 0 "109" 0 "110" 0 "111" 0 "112" 0 "113" 0 "114" 0 "115" 0 "116" 0 "117" 0 "118" 0 "119" 0 "120" 0 "121" 0';
						}
						//latest_session= myuser.name+ "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
						// should create a new line output with: 22/02/2017-14:44:31 game-mode game-name job-id C cost, total deficit, nb of deficit nodes + 21 x ("pipe name" + diameter )+ 19 x ("junction_id" + pressure) 
					}
					else{
						if (game.game_mode=='modena'){
							command = 'assets/game-engine/cwsSeGWADE-lin.exe "' + user.name+ '" "'+ game.game_mode+ '" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c';
						}
						else if (game.game_mode=='aqualibrium'){
							command = 'assets/game-engine/CWS_AquaLibrium_Server.v0-lin.exe "'+ user.name+ '" "aqualibrium" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c pipes "2" 0 "3" 0 "4" 0 "5" 0 "6" 0 "7" 0 "8" 0 "9" 0 "10" 0 "11" 0 "12" 0 "13" 0 "14" 0 "15" 0 "16" 0 "17" 0 "18" 0 "19" 0 "20" 0 "21" 0 "22" 0 "23" 0 "24" 0 "25" 0';
						}
						else if (game.game_mode=='nyc'){
							command = 'assets/game-engine/cwsNYTServer.v1-lin.exe "'+ user.name+ '" "nyc" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c "101" 0 "102" 0 "103" 0 "104" 0 "105" 0 "106" 0 "107" 0 "108" 0 "109" 0 "110" 0 "111" 0 "112" 0 "113" 0 "114" 0 "115" 0 "116" 0 "117" 0 "118" 0 "119" 0 "120" 0 "121" 0';
						}
					}
					console.log(command)
					
					exec(command, function(err, stdout, stderr) {
						//console.log('output:', stdout);
						//console.log('stderr:', stderr);
					  
					});
					
					
					
					res.redirect('/seegames');
				});
			});
		}
	},
	
	setgame: function(req, res) {
		if (req.session.me) {
			Game.findOne({
			  name: req.param('game-name')
			}, function foundGame(err, game) {
				var all_players_team=JSON.parse(req.param('players-teams'));
				var open_game= JSON.parse(req.param('open-game'));
				var game_mode= req.param('game-mode');
				//console.log(open_game)
				var different =false;
				if (parseInt(req.param('team-size'))!=game.team_size){
					different=true;
				}
				for (elem in game.players_teams){
					if (game.players_teams[elem]['team']!=all_players_team[elem]['team']){
						different=true;
					}
				}
				// if team size or composition of teams has been changed, reset game state of each team
				var teams_games;
				var final_games;
				//console.log(different)
				
				if (different==true){
					if (game_mode!='aqualibrium'){
						teams_games={};//game_state
						final_games={}
						for (elem in all_players_team){
							if (parseInt(all_players_team[elem]['team'])!=-1){
								teams_games[all_players_team[elem]['team']]=[];
								final_games[all_players_team[elem]['team']]=[];
							}
						}
					}
				}
				else{
					
					if (game.game_state && _.isEmpty(game.game_state)){
						teams_games={};//game_state
						//console.log(all_players_team)
						for (elem in all_players_team){
							if (parseInt(all_players_team[elem]['team'])!=-1){
								teams_games[all_players_team[elem]['team']]=[];
							}
						}
						//teams_games=game.game_state;
					}
					else{
						teams_games=game.game_state;
					}
					
					if (game.last_solution && _.isEmpty(game.last_solution)){
						final_games={};//game_state
						//console.log(all_players_team)
						for (elem in all_players_team){
							if (parseInt(all_players_team[elem]['team'])!=-1){
								final_games[all_players_team[elem]['team']]=[];
							}
						}
						//teams_games=game.game_state;
					}
					else{
						final_games=game.last_solution;
					}
					
					
				}
				//console.log(all_players_team)
				//console.log(teams_games)
				Game.update({id:game['id']},{team_size: parseInt(req.param('team-size')),game_mode: game_mode,time_points: parseInt(req.param('time-points')), open_game: open_game, players_teams: all_players_team, pumps_roles:JSON.parse(req.param('pumps-roles')), valves_roles:JSON.parse(req.param('valves-roles')), pipes_roles:JSON.parse(req.param('pipes-roles')), game_state:teams_games, last_solution: final_games, white_image:'', black_image:'', height_image:''}, function gameUpdated(err2) {
					if (err2) return res.negotiate(err2);
					console.log('game settings updated')
					
					//io.socket.put('/calibratescore', {newscore:[totalcost, total_deficit],team:},function gotResponse(body, response) {
					//   console.log('Server new score to server ');
					//})
					res.redirect('/seegames');
				});
			});
		}
	},
	delete: function(req, res) {
		//console.log('delete')
		//console.log(req.param('id'))
		Game.findOne(req.param('nid')).exec(function(err, result) {
			if (err) {
				return res.negotiate(err);
			  }
			Game.destroy({id:req.param('nid')}).exec(function (err){
			  if (err) {
				//return res.negotiate(err);
				sails.log('error when trying to delete game')
			  }
			   
			  sails.log('deleted game in database...');
			  res.redirect('/seegames');
			});
			    
			
			
		});
		//Network.update(req.param('network-id'), netObj, function netUpdated(err3) {
		
		//})
			
	},
	
	export3best: function(req, res) {
		
		Game.findOne(req.param('nid')).exec(function(err, game) {
			if (err) {
				return res.negotiate(err);
			}
			if (game.game_mode=='aqualibrium'){
				var myos = os.type();
				var typos=0;
				if (myos.substring(0,3)=="Win"){
					typos=0;
				}
				else if (myos.substring(0,3)=="Dar"){
					typos=1;
				}
				else if (myos.substring(0,3)=="Lin"){
					typos=2;
				}
				else{
					typos=3;
				}
				var users_commands=[];
				//console.log("export 5 best solutionsto epanet files");
				for (var i1=0,j1=game.sessionBests.length;i1<j1;i1++){
					if (i1<5){
						
						var command='';
						if (typos==0){													
							command = 'assets\\game-engine\\aqualibriumConsole.exe ';							
						}
						else{
							command = 'assets/game-engine/CWS_AquaLibrium_Server.v0-lin.exe ';	
						}
						command+='"'+game.sessionBests[i1]['team']+'" aqualibrium "Export" "'+game.network_name+'" 1 "export" S pipes';
						//command+= '"t1" "aqualibrium" "Aqua" "A1" 1 "t11476281688727" c pipes ';
		
						if (game.game_state.hasOwnProperty(game.sessionBests[i1]['team']) ){
							var max=false;
							for (var i2=0, j2= game.game_state[game.sessionBests[i1]['team']].length;i2<j2;i2++){
								if (game.game_state[game.sessionBests[i1]['team']][i2][0][7]==game.sessionBests[i1]['overall_score']){
									for (pipe in game.game_state[game.sessionBests[i1]['team']][i2][1]){
										if (max==false){
											command +=' "'+pipe+'" '+game.game_state[game.sessionBests[i1]['team']][i2][1][pipe];
											
										}
										
									}
									max=true;
									//command = game.game_state[game.sessionBests[i1]['team']][i2][1];
								}
							}
						}
						users_commands.push([game.sessionBests[i1]['team'], game.sessionBests[i1]['overall_score'], command])
						
					}
				}
				//console.log(users_commands)
				for (var i1=0,j1=users_commands.length;i1<j1;i1++){
					console.log(users_commands[i1])
					exec(users_commands[i1][2], function(err, stdout, stderr) {
						console.log('output:', stdout);
						console.log('stderr:', stderr);
						command=null;
					});
				}
				
				sails.log('exported 3 best solutions to epanet files');
				res.redirect('/seegames');
			}
		});
	},
	
	rewritedb: function(req, res) {
		console.log("rewriting game database from text files")
		Game.findOne(req.param('nid')).exec(function(err, game) {
			if (err) {
				return res.negotiate(err);
			  }
			 //console.log(game.name)
			// console.log(game.players_teams)
			 if (game.game_mode=='aqualibrium'){
				// fs.readdir( 'output\\', function( err, files) {
					// if ( err ) {
						// console.log("Error reading files: ", err);
					// } else {
						// // keep track of how many we have to go.
						// var remaining = files.length;
						// //var totalBytes = 0;
						
						// if ( remaining == 0 ) {
							// console.log("Done reading files.");
						// }

						// // for each file,
						// for ( var i = 0; i < files.length; i++ ) {
							// try{
								// //if (files[i] && files[i].endsWith('.out')){
									// var file_data = fs.readFileSync('output\\'+files[i]+'.out', 'utf8').toString();
									// if (file_data && file_data!=""){
										// var lines =file_data.split('\n');
										// console.log(lines.length);
									// }
								// //}
								// //remaining -= 1;
								// //if ( remaining == 0 ) {
								// //	console.log("Done reading files.");
								// //}
							// }
							// catch(exep){
								
								// remaining -= 1;
								// if ( remaining == 0 ) {
									// console.log("Done reading files.");
								// }
									
							// }
						// }
					// }
				// });
				 var keys = Object.keys(game.players_teams).length;
				 var cnt=0;
				 for (player in game.players_teams){
					//var player = 'Zara Visanji';
					//console.log(player)
					var myteam= "";
					if ( game.team_size==1){
						myteam= game.players_teams[player]['team'];
					}
					else{
						myteam= game.players_teams[player]['team'];
					}
					if (myteam!=-1 && myteam!='-1' && myteam==player){
					
						game.game_state[myteam]=[];
						
							try {
								var file_data = fs.readFileSync('output\\'+player+'.out', 'utf8').toString();
								if (file_data && file_data!=""){
									var lines =file_data.split('\n');
									console.log(lines.length)
									
									for (var i0=0,j0=lines.length-2;i0<j0;i0++){
										var initial_result = lines[i0].split(' ');
									
										if (initial_result && initial_result.length>0){
											var game_mode = initial_result[1];
											var gname=initial_result[2];
											var mjobid= initial_result[3];
											var commit_evaluate= initial_result[4];
											if (gname==game.name){
												if(commit_evaluate=='c' || commit_evaluate=='C'){
													var reservoir_1=parseFloat(initial_result[5]);
													var reservoir_2=parseFloat(initial_result[6]);
													var reservoir_3=parseFloat(initial_result[7]);
													var score=parseFloat(initial_result[8]);
													var valid_score = initial_result[9];
													var nb_pipes=Object.keys(game.pipes_roles).length;
													var compact_history_start=initial_result.slice(1, 10);
													var compact_history_end= {};
													if (valid_score=='true'){
														for (var i=initial_result.length-1-(nb_pipes*2),j=initial_result.length-1;i<j;i+=2){
															if (initial_result[i+1]!=-1 && initial_result[i]!="" && initial_result[i]!=null){
																compact_history_end[initial_result[i]]=initial_result[i+1];
															}
														}
														// fill in game state only with inputs ans corresponding results from the time
														if (game.game_state.hasOwnProperty(myteam)){
															game.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
														else{
															game.game_state[myteam]=[];
															game.game_state[myteam].push([compact_history_start,compact_history_end]);
														}
													}
															
												}
											}
										}
									}
								   
								  
							  }
							}
							catch(err){
							}
						
						
					}
					cnt++;
					if (keys==cnt){
						
					}
					}
				 
				for (pl in game.game_state ){
					 console.log(pl+' '+game.game_state[pl].length);
				}
				var bscore = parseFloat(game.overallBest['overall_score'])	;
				 for (player in game.game_state){
					 //console.log(player);
					 
					for (var i0=0, j0= game.game_state[player].length;i0<j0;i0++){
						var pscore = parseFloat(game.game_state[player][i0][0][7]);
						var correct = game.game_state[player][i0][0][8];
						if (bscore>pscore && correct=='true'){	
							//console.log(bscore +' '+pscore)
							// update overallBest
							game.overallBest['team']=player;
							game.overallBest['overall_score']=pscore;
							game.overallBest['res1']=parseFloat(game.game_state[player][i0][0][4]);
							game.overallBest['res2']=parseFloat(game.game_state[player][i0][0][5]);
							game.overallBest['res3']=parseFloat(game.game_state[player][i0][0][6]);
							bscore = pscore;
						}
					}
				 }
				 
				 for (player in game.game_state){
					for (var i=0, j= game.game_state[player].length;i<j;i++){
						var pscore = parseFloat(game.game_state[player][i][0][7]);
						var correct = game.game_state[player][i][0][8];
						if (game.sessionBests.length>0){
							for (var i1=0,j1=game.sessionBests.length;i1<j1;i1++){
								
								if ((player == game.sessionBests[i1]['team']) && (pscore <parseFloat(game.sessionBests[i1]['overall_score'])) && correct=='true'){
									//console.log("changed user "+player+" best score to "+ pscore)
									game.sessionBests[i1]['overall_score']=pscore;
								}
							}
						}
						if (game.sessionBests.length==0){
							var listTeams = Object.keys(game.game_state)
							for (var i1=0,j1=listTeams.length;i1<j1;i1++){
								var scorerank={}
								scorerank['team']=listTeams[i1];
								scorerank['overall_score']=pscore;
								scorerank['overall_score_rk']=i1;
								game.sessionBests.push(scorerank);
								//if ((player == game.sessionBests[i1]['team']) && (pscore <parseFloat(game.sessionBests[i1]['overall_score'])) && correct=='true'){
									//console.log("changed user "+player+" best score to "+ pscore)
									//game.sessionBests[i1]['overall_score']=pscore;
								//}
							}
						}
						
						
					}
				 }
				 game.sessionBests.sort(function(a, b){return parseFloat(a['overall_score'])- parseFloat(b['overall_score'])});
				// // take not of each team ranking and replace rank value in the lot
				
				for (var s=0, maxs= game.sessionBests.length;s<maxs;s++){
					game.sessionBests[s]['overall_score_rk']=s+1;
				}
				console.log(game.sessionBests)
				 Game.update({name:game.name},{game_state:game.game_state, overallBest:game.overallBest, sessionBests: game.sessionBests }).exec(function afterwards(errg, updated){
					console.log('updated game database');
				 });
				 
				//Game.destroy({id:req.param('nid')}).exec(function (err){
				//  if (err) {
					//return res.negotiate(err);
				//	sails.log('error when trying to delete game')
				//  }
				   
				sails.log('rewritten game database from text files...');
				res.redirect('/seegames');
			}
			//});
			    
			
			
		});
	},
	resetscore: function (req, res) {
		if (!req.isSocket) {return res.badRequest();}
		
		if (req.body['game']){
			//console.log('resetting score board for game')
			Game.findOne({
			  name: req.body['game']
			}, function foundGame(err, game) {
				game.sessionBests=[];
				Game.update({id:game['id']},{ sessionBests:[] , overallBest: {}}, function gameUpdated(err2) {
					if (err2) return res.negotiate(err2);
					console.log('resetting score board for game')
					//res.redirect('/seegames');
				});
			});
		}
	},
	endscore: function (req, res) {
		if (!req.isSocket) {return res.badRequest();}
		
		if (req.body['game']){
			
			Game.findOne({
			  name: req.body['game']
			}, function foundGame(err, game) {
				sails.sockets.broadcast('funSockets', 'endscore', {mygame:game.name, board: game.sessionBests});
				console.log('broadcast signal to show end score board for game')
			});
		}
	},
	
	showgame: function(req, res) {
		if (req.session.me) {
			User.findOne(req.session.me, function (err, user){
				if (err) {
					return res.negotiate(err);
				}

				if (!user) {
					sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
					return res.view('homepage');
				}
				Game.findOne(req.param('nid')).exec(function(err2, mgame) {
					if (err2) {
						return res.negotiate(err2);
					}
					Network.findOne({name: mgame.network_name}, function foundUser(err3, net) {
						if (err3) {
							return res.negotiate(err3);
						}
						return res.view('game/dmplay', {
							me: {
							  id: user.id,
							  name: user.name,
							  email: user.email,
							  //title: user.title,
							  history: user.history,
							  admin: user.admin,
							  gravatarUrl: user.gravatarUrl
							},
							game: mgame,
							network: net
						});
					});
				});
			});
    
		
		
		}
	},
	
	analyseGame: function(req, res) {
		if (req.session.me) {
			User.findOne(req.session.me, function (err, user){
				if (err) {
					return res.negotiate(err);
				}

				if (!user) {
					sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
					return res.view('homepage');
				}
				Game.findOne(req.param('nid')).exec(function(err2, mgame) {
					if (err2) {
						return res.negotiate(err2);
					}
					Network.findOne({name: mgame.network_name}, function foundUser(err3, net) {
						if (err3) {
							return res.negotiate(err3);
						}
						return res.view('game/analysegame', {
							me: {
							  id: user.id,
							  name: user.name,
							  email: user.email,
							  //title: user.title,
							  history: user.history,
							  admin: user.admin,
							  gravatarUrl: user.gravatarUrl
							},
							game: mgame,
							network: net
						});
					});
				});
			});
    
		
		
		}
	},
	
	
	playgame: function(req, res) {
		if (req.session.me) {
			User.findOne(req.session.me, function (err, user){
				if (err) {
					return res.negotiate(err);
				}

				if (!user) {
					sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
					return res.view('homepage');
				}
				Game.findOne(req.param('nid')).exec(function(err2, mgame) {
					if (err2) {
						return res.negotiate(err2);
					}
					
						if (mgame.team_size==1){
							if (user['admin']==false){
								var team=  user['name'];
								//console.log(team)
								for (elem in mgame.game_state){
									if (elem!=team){
										delete mgame.game_state[elem]
									}
								}
								for (elem in mgame.last_solution){
									if (elem!=team){
										delete mgame.last_solution[elem]
									}
								}
								//mgame.game_state[]
								Network.findOne({name: mgame.network_name}, function foundUser(err3, net) {
									if (err3) {
										return res.negotiate(err3);
									}
									return res.view(game_modes2views[mgame.game_mode], {
										me: {
										  id: user.id,
										  name: user.name,
										  email: user.email,
										  //title: user.title,
										  history: user.history,
										  admin: user.admin,
										  gravatarUrl: user.gravatarUrl
										},
										game: mgame,
										network: net
									});
								});
							}
							//else{
							//	return res.view('homepage');
							//}
						}
						else{
					
							if ((mgame.players_teams.hasOwnProperty(user['name'])) && mgame.players_teams[user['name']]['team']!=-1 && mgame.players_teams[user['name']]['team_member']!=-1){
								var team=  mgame.players_teams[user['name']]['team'];
								//console.log(team)
								for (elem in mgame.game_state){
									if (elem!=team){
										delete mgame.game_state[elem]
									}
								}
								for (elem in mgame.last_solution){
									if (elem!=team){
										delete mgame.last_solution[elem]
									}
								}
								//mgame.game_state[]
								Network.findOne({name: mgame.network_name}, function foundUser(err3, net) {
									if (err3) {
										return res.negotiate(err3);
									}
									return res.view(game_modes2views[mgame.game_mode], {
										me: {
										  id: user.id,
										  name: user.name,
										  email: user.email,
										  //title: user.title,
										  history: user.history,
										  admin: user.admin,
										  gravatarUrl: user.gravatarUrl
										},
										game: mgame,
										network: net
									});
								});
							}
							else{
								return res.view('homepage');
							}
						}
				});
			});
    
		
		
		}
	},
	
	
	index: function(req, res) {
		if (req.session.me) {
		 User.findOne(req.session.me, function (err, user){
		  if (err) {
			return res.negotiate(err);
		  }

		  if (!user) {
			sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
			return res.view('homepage');
		  }
		  
		  Game.find({select: ['name','id','is_on','players_teams','game_mode']}).exec(function(err, games) {
				//sails.log(games);
			  if (user.admin==true){
				  return res.view('game/index', {
					me: {
					  id: user.id,
					  name: user.name,
					  email: user.email,
					  //title: user.title,
					  //history: user.history,
					  admin: user.admin//,
					  //gravatarUrl: user.gravatarUrl
					},
					listgames: games
				  });
			  }
			  else{
					
				  return res.view('game/playerindex', {
					me: {
					  id: user.id,
					  name: user.name,
					  email: user.email,
					  //title: user.title,
					  //history: user.history,
					  admin: user.admin//,
					  //gravatarUrl: user.gravatarUrl
					},
					listgames: games
				  });
			  }
		  });
		  
		  

		});
    
		
		
		}
	}
};

