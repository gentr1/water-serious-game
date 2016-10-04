/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var os = require('os');
var exec = require('child_process').exec;

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
					Network.find({select: ['name']}).exec(function(err, networks) {
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
							command = 'assets\\game-engine\\aqualibriumConsole.exe "'+ user.name+ '" "aqualibrium" "'+ game.name+ '" "'+ game.network_name+'" '+ game.time_points+' "initialisation" c "2" 0 "3" 0 "4" 0 "5" 0 "6" 0 "7" 0 "8" 0 "9" 0 "10" 0 "11" 0 "12" 0 "13" 0 "14" 0 "15" 0 "16" 0 "17" 0 "18" 0 "19" 0 "20" 0 "21" 0 "22" 0 "23" 0 "24" 0 "25" 0';
						}
					}
					else{
						//command = 'assets/game-engine/cwsNYTServer.exe ' + method + ' -i ' + fname + ' -b ' + fname1 + ' -f ' + fname2 + ' -X ' + xt + ' -comment';
					}
					console.log(command)
					
					exec(command, function(err, stdout, stderr) {
						console.log('output:', stdout);
						console.log('stderr:', stderr);
					  
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
					teams_games={};//game_state
					final_games={}
					for (elem in all_players_team){
						if (parseInt(all_players_team[elem]['team'])!=-1){
							teams_games[all_players_team[elem]['team']]=[];
							final_games[all_players_team[elem]['team']]=[];
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
									return res.view('game/play', {
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
									return res.view('game/play', {
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
		  
		  Game.find({select: ['name','is_on','players_teams']}).exec(function(err, games) {
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

