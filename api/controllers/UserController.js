/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var os = require('os');
var exec = require('child_process').exec;
//var rooms=[];
var all_job_queues={};
// function getAllInfo(session_info){
	// var totalCost=0;
	// for (var i=1;i<latest_diameters.length+1;i++){
		// totalCost+= (listVariableLinks[i-1]['Length']*nytCosts[parseInt(session_info[i])]);
	// }
	// var nbNegNodes=0;
	// var totalNegPSI=0;
	// var mcnt=1;
	// for (var i=22;i<session_info.length-1;i++){	
		// if (listNodes[mcnt] && listNodes[mcnt].hasOwnProperty('initialPressure')){		
			// //listNodes[mcnt]['initialPressure']=parseFloat(latest_pressures_raw[i]);
			// var tmp =(parseFloat(session_info[i])-listNodes[mcnt]['minimumPressure']);
			// if (tmp<0){
				// nbNegNodes+=1;
				// totalNegPSI+=tmp;
			// }
		// }
		// mcnt+=1;
	// }
	// return [totalCost, nbNegNodes, totalNegPSI]
// }

module.exports = {

  /**
   * Check the provided email address and password, and if they
   * match a real user in the database, sign in to Activity Overlord.
   */
  login: function (req, res) {

    // Try to look up user using the provided email address
    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      // Compare password attempt from the form params to the encrypted password
      // from the database (`user.password`)
      require('machinepack-passwords').checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: user.encryptedPassword
      }).exec({

        error: function (err){
          return res.negotiate(err);
        },

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        incorrect: function (){
          return res.notFound();
        },

        success: function (){
          // Store user id in the user session
          req.session.me = user.id;
	  //return res.ok();
	  return res.view('homepage', {
	    id: user.id
	  });
        }
	
      });
    });

  },

  index: function (req, res) {
    if (req.session.me) {
		 User.findOne(req.session.me, function (err, user){
		  if (err) {
			return res.negotiate(err);
		  }

		  if (!user) {
			sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
			return res.view('homepage');
		  }
		  if (user.admin==true){
			  User.find({select: ['name','admin']}).exec(function(err, allusers) {
				  return res.view('user/index', {
					me: {
					  id: user.id,
					  name: user.name,
					  email: user.email,
					  //title: user.title,
					  history: user.history,
					  admin: user.admin,
					  gravatarUrl: user.gravatarUrl
					},
					users: allusers
				  });
			  });
		  }
		  else{
			sails.log.verbose('The uploader is only avaialable to users with admin privilege');
			return res.view('homepage');  
			  
		  }

		});
    }
  },
  
  updateusers: function(req, res) {
		//console.log('delete')
		var updated_users=JSON.parse(req.param('users-admins'));
		User.find({select: ['name','admin']}).exec(function(err, allusers) {
			for (var i=0;i<allusers.length;i++){
				//console.log(allusers[i])
				//console.log(allusers[i]['id'])
				//console.log(updated_users[allusers[i]['name']])
				User.update({id:allusers[i]['id']},{admin:updated_users[allusers[i]['name']]}, function usrUpdated(err2) {
				//	if (err2) return res.negotiate(err2);
				//	
				});
			}
			res.redirect('/seegames');
		});
		// User.findOne(req.param('nid')).exec(function(err, user) {
			// if (err) {
				// return res.negotiate(err);
			// }					
			// User.destroy({id:req.param('nid')}).exec(function (err){
			  // if (err) {
				// //return res.negotiate(err);
				// sails.log('error when trying to delete user')
			  // }
			   
			  // sails.log('deleted user in database...');
			  // res.redirect('/editusers');
			// });
		// });
	},
  
  
  delete: function(req, res) {
		//console.log('delete')
		//console.log(req.param('id'))
		User.findOne(req.param('nid')).exec(function(err, user) {
			if (err) {
				return res.negotiate(err);
			}					
			User.destroy({id:req.param('nid')}).exec(function (err){
			  if (err) {
				//return res.negotiate(err);
				sails.log('error when trying to delete user')
			  }
			   
			  sails.log('deleted user in database...');
			  res.redirect('/editusers');
			});
		});
	},

  evaluate: function (req, res,next) {
    if (req.session.me) {
		//var userObj = {
		//	//  name: req.param('name'),
		//	//  email: req.param('email'),
		//	history: req.param('history'),
			
		
		var parameters= req.param('history');
		var game_mode= req.param('mode');
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
			if (game_mode=='modena'){
				command = 'assets\\game-engine\\cwsSeGWADE.exe ' + parameters;
			}
			else if (game_mode=='aqualibrium'){
				command = 'assets\\game-engine\\aqualibriumConsole.exe ' + parameters;
			}
		}
		else{
			//command = 'assets/game-engine/cwsNYTServer.exe ' + method + ' -i ' + fname + ' -b ' + fname1 + ' -f ' + fname2 + ' -X ' + xt + ' -comment';
		}
		console.log(command)
		exec(command, function(err, stdout, stderr) {
			console.log('output:', stdout);
			console.log('stderr:', stderr);
			command=null;
		});
    }
  },
  commit: function (req, res,next) {
    if (req.session.me) {
		
		
		var parameters= req.param('history');
		var mygame=req.param('mygame');
		var myteam=req.param('myteam');
		var myplayer=req.param('player');
		var mydate=req.param('mydate');
		var game_mode= req.param('mode');
		//console.log(parameters)
		//console.log(mygame)
		//console.log("commit parameter team: "+myteam)
		//console.log(myplayer)
		//console.log(mydate)
		// get as parameter 
		// the game name
		// the team name
		// the add these in the queue data structure
		
		if (all_job_queues.hasOwnProperty(mygame)){
			if (all_job_queues[mygame].hasOwnProperty(myteam)){
				var pid = ""+myplayer+mydate;
				pid = pid.replace(/\s/g,"_"); 
				all_job_queues[mygame][myteam].push([''+pid,mydate,parameters,0])
			}
			else{
				var pid = ""+myplayer+mydate;
				pid = pid.replace(/\s/g,"_"); 
				all_job_queues[mygame][myteam]=[];
				all_job_queues[mygame][myteam].push([''+pid,mydate,parameters,0])
			}
		}
		else{
			var pid = ""+myplayer+mydate;
			pid = pid.replace(/\s/g,"_"); 
			all_job_queues[mygame]={};
			all_job_queues[mygame][myteam]=[];
			all_job_queues[mygame][myteam].push([''+pid,mydate,parameters,0])
		}
		//console.log(all_job_queues[mygame][myteam]);
		
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
			for (var i=0;i<all_job_queues[mygame][myteam].length;i++){
				var pid = ""+myplayer+mydate;
				pid = pid.replace(/\s/g,"_"); 
				if (all_job_queues[mygame][myteam][i][0]==(pid)){
					if (game_mode=='modena'){
						command = 'assets\\game-engine\\cwsSeGWADE.exe ' +all_job_queues[mygame][myteam][i][2];
					}
					else if (game_mode=='aqualibrium'){
						command = 'assets\\game-engine\\aqualibriumConsole.exe ' +all_job_queues[mygame][myteam][i][2];
					}
					console.log('executing command job id: '+all_job_queues[mygame][myteam][i][0]);
					all_job_queues[mygame][myteam][i][3]+=1;
				}
			}
			//command = 'assets\\game-engine\\cwsSeGWADE.exe ' + all_job_queues[mygame][myteam].shift()[2]//all_job_queues[mygame][myteam][0][2]//all_job_queues[mygame][myteam].shift()[2]
		}
		else{
			//command = 'assets/game-engine/cwsNYTServer.exe ' + method + ' -i ' + fname + ' -b ' + fname1 + ' -f ' + fname2 + ' -X ' + xt + ' -comment';
		}
		console.log(command)
		exec(command, function(err, stdout, stderr) {
			console.log('output:', stdout);
			console.log('stderr:', stderr);
			command=null;
		});
    }
  },
  
  dmcommit: function (req, res,next) {
    if (req.session.me) {
		
		
		var parameters= req.param('history');
		var mygame=req.param('mygame');
		var myteam=req.param('myteam');
		var myplayer=req.param('player');
		var mydate=req.param('mydate');
		var game_mode= req.param('mode');
		//console.log(parameters)
		//console.log(mygame)
		//console.log("commit parameter team: "+myteam)
		//console.log(myplayer)
		//console.log(mydate)
		// get as parameter 
		// the game name
		// the team name
		// the add these in the queue data structure
		
		if (all_job_queues.hasOwnProperty(mygame)){
			if (all_job_queues[mygame].hasOwnProperty(myteam)){
				var pid = ""+myplayer+mydate;
				pid = pid.replace(/\s/g,"_"); 
				all_job_queues[mygame][myteam].push([''+pid,mydate,parameters,0,'dm'])
			}
			else{
				var pid = ""+myplayer+mydate;
				pid = pid.replace(/\s/g,"_"); 
				all_job_queues[mygame][myteam]=[];
				all_job_queues[mygame][myteam].push([pid,mydate,parameters,0,'dm'])
			}
		}
		else{
			var pid = ""+myplayer+mydate;
			pid = pid.replace(/\s/g,"_"); 
			all_job_queues[mygame]={};
			all_job_queues[mygame][myteam]=[];
			all_job_queues[mygame][myteam].push([''+pid,mydate,parameters,0,'dm'])
		}
		//console.log(all_job_queues[mygame][myteam]);
		
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
			for (var i=0;i<all_job_queues[mygame][myteam].length;i++){
				var pid = ""+myplayer+mydate;
				pid = pid.replace(/\s/g,"_"); 
				if (all_job_queues[mygame][myteam][i][0]==(''+pid)){
					if (game_mode=='modena'){
						command = 'assets\\game-engine\\cwsSeGWADE.exe ' +all_job_queues[mygame][myteam][i][2];
					}
					else if (game_mode=='aqualibrium'){
						command = 'assets\\game-engine\\aqualibriumConsole.exe ' +all_job_queues[mygame][myteam][i][2];
					}
					console.log('executing command job id: '+all_job_queues[mygame][myteam][i][0]);
					all_job_queues[mygame][myteam][i][3]+=1;
				}
			}
			//command = 'assets\\game-engine\\cwsSeGWADE.exe ' + all_job_queues[mygame][myteam].shift()[2]//all_job_queues[mygame][myteam][0][2]//all_job_queues[mygame][myteam].shift()[2]
		}
		else{
			//command = 'assets/game-engine/cwsNYTServer.exe ' + method + ' -i ' + fname + ' -b ' + fname1 + ' -f ' + fname2 + ' -X ' + xt + ' -comment';
		}
		console.log(command)
		exec(command, function(err, stdout, stderr) {
			console.log('output:', stdout);
			console.log('stderr:', stderr);
			command=null;
		});
    }
  },
  
  done: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	var mgame= req.body['game'];
	var mteam= req.body['team'];
	var jobid = req.body['jobid'];
	var game_mode= req.body['mode'];
	//console.log(mteam);
	//console.log(all_job_queues[mgame]);
	//console.log(all_job_queues[mgame][mteam]);
	for (var i=0;i<all_job_queues[mgame][mteam].length;i++){
		if (all_job_queues[mgame][mteam][i][0]==jobid){
			console.log("commit job id: "+jobid+" completed.")
			//if (all_job_queues[mgame][mteam][i][3]==4){
			all_job_queues[mgame][mteam].splice(i, 1);
			//}
			//console.log(all_job_queues[mgame][mteam]);
			
		}
	}
	
	for (var i=0;i<all_job_queues[mgame][mteam].length;i++){		
		if (all_job_queues[mgame][mteam][i][3]<10){
			
			console.log('executing command job id: '+all_job_queues[mgame][mteam][i][0]);
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
				if (game_mode=='modena'){
					command = 'assets\\game-engine\\cwsSeGWADE.exe ' +all_job_queues[mgame][mteam][i][2];
				}
				else if (game_mode=='aqualibrium'){
					command = 'assets\\game-engine\\aqualibriumConsole.exe ' +all_job_queues[mygame][myteam][i][2];
				}
			}
			else{
				//command = 'assets/game-engine/cwsNYTServer.exe ' + method + ' -i ' + fname + ' -b ' + fname1 + ' -f ' + fname2 + ' -X ' + xt + ' -comment';
			}
			console.log('executing element left in queue again')
			console.log(command)
			exec(command, function(err, stdout, stderr) {
				console.log('output:', stdout);
				console.log('stderr:', stderr);
				command=null;
			});
			all_job_queues[mgame][mteam][i][3]+=1;
		}
		else{
			all_job_queues[mgame][mteam].splice(i, 1);
			console.log('deleting command job id: '+all_job_queues[mgame][mteam][i][0]+' from queue');
		}
	}
  },
  
   update: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	//console.log(req.body['name']);
	//console.log(req.body['game']);
	//console.log(req.body['type']);
	//console.log(req.body['jobid']);
	//console.log(req.body['history']);
	if (req.body['history'].length>0){ 
		if (req.body['type']=='e' || req.body['type']=='E'){
			console.log("broadcasting hello message resulting from user history update !!!")
			sails.sockets.broadcast("funSockets", "hello", {name:req.body['name'], game:req.body['game'], type:req.body['type'] ,result: req.body['last_result']});
		}
		else if (req.body['type']=='c' || req.body['type']=='C'){
			console.log("changed best : "+req.body['changedbest']);
			
			if (req.body['changedbest']==true){
				console.log("detail best : "+req.body['changedbestdetail']);
				//console.log("detail game state : ");
				//for (elem in req.body['state']){
				//	console.log(elem);
				//}
				console.log("broadcasting newbestteam message resulting from commit history update !!!")
				sails.sockets.broadcast("funSockets", "betterscore", req.body['changedbestdetail']);
			}
			console.log("broadcasting hello message resulting from commit history update !!!")
			sails.sockets.broadcast("funSockets", "hello", {name:req.body['name'], game:req.body['game'], jobid: req.body['jobid'],type:req.body['type'] ,result: req.body['last_result']});
				//console.log('solving next job in queue if present');
				
			
		}
		else if (req.body['type']=='d' || req.body['type']=='D'){
			console.log("changed best dm : "+req.body['changedbest']);
			
			if (req.body['changedbest']==true){
				console.log("detail best : "+req.body['changedbestdetail']);
				console.log("broadcasting newbestteam message resulting from dm commit history update !!!")
				sails.sockets.broadcast("funSockets", "betterscore", req.body['changedbestdetail']);
			}
			console.log("broadcasting hello message resulting from dm commit history update !!!")
			sails.sockets.broadcast("funSockets", "hello", {name:req.body['name'], game:req.body['game'], jobid: req.body['jobid'],type:req.body['type'] ,result: req.body['last_result']});
				//console.log('solving next job in queue if present');
				
			
		}
	}
	else{
		
		
		//if (rooms.indexOf('funSockets')==-1){
		//	console.log("subscribing to room as user enter game !!!")
			sails.sockets.join(req, 'funSockets');
		//	rooms.push('funSockets');
		//}
	}
	
  },
  
  changedm: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	if (req.body['parameters']){
		Game.findOne({
		  name: req.body['parameters']['game']
		}, function foundGame(err, mygame) {
			Network.findOne({name: mygame.network_name}, function foundNet(err2, net) {
				if (err2) {
					return res.negotiate(err3);
				}
				var newpipe= req.body['parameters']['change'];
				if (mygame.pipes_roles.hasOwnProperty(newpipe[0])){
					console.log('game pipes_roles has property' + newpipe[0])
					mygame.pipes_roles[newpipe[0]]=-1;
				}
				if (net.pipes.hasOwnProperty(newpipe[0])){
					console.log('network pipes has property' + newpipe[0])
					net.pipes[newpipe[0]]['Status']=newpipe[1];
					net.pipes[newpipe[0]]['Diameter']=newpipe[2];
					var index_2_diameters ={0:0};
					var diameters_2_index ={0:0};
					for (var i=0;i< net['pipe_diameters'].length;i++){
						index_2_diameters[i+1]=net['pipe_diameters'][i];
						diameters_2_index[net['pipe_diameters'][i]]=i+1;
					}
					
					mygame.modified_pipes[newpipe[0]]=diameters_2_index[newpipe[2]];
					
				}
				//console.log(mygame.team_size);
				var dm_teams_updated={};
				if (mygame.open_game==false){
					if (mygame.team_size==1){
						
						for (muser in mygame.players_teams){
							//console.log(mygame.players_teams[muser])
							if (mygame.players_teams[muser]['team']!=-1 && mygame.players_teams[muser]['team']!='-1'){
								dm_teams_updated[muser]=false;
							}
							
						}
					}
					else{
						var listTeams=[];
						for (muser in mygame.players_teams){
							//console.log(mygame.players_teams[muser])
							if (mygame.players_teams[muser]['team']!=-1 && mygame.players_teams[muser]['team']!='-1'){
								//dm_teams_updated[muser]=false;
								if (listTeams.indexOf(mygame.players_teams[muser]['team'])==-1){
									listTeams.push(mygame.players_teams[muser]['team']);
								}
							}
							for (var i=0;i<listTeams.length;i++){
								dm_teams_updated[listTeams[i]]=false;
							}
							
						}
					}
				}
				else{
					if (mygame.team_size==1){
						for (muser in mygame.players_teams){
							//console.log(mygame.players_teams[muser])
							if (mygame.players_teams[muser]['team']!=-1 && mygame.players_teams[muser]['team']!='-1'){
								dm_teams_updated[muser]=false;
							}
							
						}
					}
				}
				Game.update({id:mygame['id']},{pipes_roles: mygame.pipes_roles, modified_pipes:mygame.modified_pipes, dm_teams_updated: dm_teams_updated }, function gameUpdated(erru1) {
						if (erru1) return res.negotiate(erru1);
						//console.log("game "+mygame['name']+" updated !!!")
						Network.update({id:net['id']},{pipes: net.pipes}, function netUpdated(erru2) {
							if (erru2) return res.negotiate(erru2);
							console.log("net "+net['name']+" updated !!!")
							console.log("DM just broadcasted order that change state of the game to all players !!!")
							sails.sockets.broadcast("funSockets", "hellodm", {game:req.body['parameters']['game'], change:mygame.modified_pipes});
							mygame =null;
							net=null;
						});
				});
			});
		});
		
	}
  },
  
  startdm: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	if (req.body['parameters']){
		
		Game.findOne({
		  name: req.body['parameters']['game']
		}, function foundGame(err, mygame) {
			Game.update({id:mygame['id']},{is_on: true}, function gameUpdated(err2) {
					if (err2) return res.negotiate(err2);
					console.log("game "+mygame['name']+" started !!!")
					mygame=null;
			});
		});
		//sails.sockets.broadcast("funSockets", "hellodm", {game:req.body['parameters']['game'], change:req.body['parameters']['change']});
	}
  },
  stopdm: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	if (req.body['parameters']){
		
		Game.findOne({
		  name: req.body['parameters']['game']
		}, function foundGame(err, mygame) {
			Game.update({id:mygame['id']},{is_on: false}, function gameUpdated(err2) {
					if (err2) return res.negotiate(err2);
					console.log("game "+mygame['name']+" stopped !!!")
					sails.sockets.broadcast("funSockets", "stopdm", {game:req.body['parameters']['game']});
					mygame=null;
			});
		});
		//sails.sockets.broadcast("funSockets", "hellodm", {game:req.body['parameters']['game'], change:req.body['parameters']['change']});
	}
  },
  
  
  updatesondm: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	if (req.body['parameters']){
		
		Game.findOne({
		  name: req.body['parameters']['game']
		}, function foundGame(err, mygame) {
			Game.update({id:mygame['id']},{updates_on: true}, function gameUpdated(err2) {
					if (err2) return res.negotiate(err2);
					console.log("game "+mygame['name']+" - updates on !!!")
					sails.sockets.broadcast("funSockets", "updateson", {game:req.body['parameters']['game']});
					mygame=null;
			});
		});
		//sails.sockets.broadcast("funSockets", "hellodm", {game:req.body['parameters']['game'], change:req.body['parameters']['change']});
	}
  },
  updatesoffdm: function (req, res,next) {
    if (!req.isSocket) {return res.badRequest();}
	if (req.body['parameters']){
		
		Game.findOne({
		  name: req.body['parameters']['game']
		}, function foundGame(err, mygame) {
			Game.update({id:mygame['id']},{updates_on: false}, function gameUpdated(err2) {
					if (err2) return res.negotiate(err2);
					console.log("game "+mygame['name']+" - updates off !!!")
					sails.sockets.broadcast("funSockets", "updatesoff", {game:req.body['parameters']['game']});
					mygame=null;
			});
		});
		//sails.sockets.broadcast("funSockets", "hellodm", {game:req.body['parameters']['game'], change:req.body['parameters']['change']});
	}
  },
  
  uploader: function (req, res,next) {
	 if (req.session.me) {
		 User.findOne(req.session.me, function (err, user){
		  if (err) {
			return res.negotiate(err);
		  }

		  if (!user) {
			sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
			return res.view('homepage');
		  }
		  if (user.admin==true){
			  return res.view('network/uploader', {
				me: {
				  id: user.id,
				  name: user.name,
				  email: user.email,
				  //title: user.title,
				  history: user.history,
				  admin: user.admin,
				  gravatarUrl: user.gravatarUrl
				}
			  });
		  }
		  else{
			sails.log.verbose('The uploader is only avaialable to users with admin privilege');
			return res.view('homepage');  
			  
		  }

		});
    
		
		
	}
	
  },

  /**
   * Sign up for a user account.
   */
  signup: function(req, res) {

    var Passwords = require('machinepack-passwords');

    // Encrypt a string using the BCrypt algorithm.
    Passwords.encryptPassword({
      password: req.param('password'),
      difficulty: 10,
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        return res.negotiate(err);
      },
      // OK.
      success: function(encryptedPassword) {
        require('machinepack-gravatar').getImageUrl({
          emailAddress: req.param('email')
        }).exec({
          error: function(err) {
            return res.negotiate(err);
          },
          success: function(gravatarUrl) {
          // Create a User with the params sent from
          // the sign-up form --> signup.ejs
			var adminval = false;
			if (req.param('name')=='the_dm'){
				adminval=true;
			}
            User.create({
              name: req.param('name'),
              //title: req.param('title'),
			  history:JSON.parse(req.param('history')),
              email: req.param('email'),
              encryptedPassword: encryptedPassword,
              lastLoggedIn: new Date(),
              gravatarUrl: gravatarUrl,
			  admin: adminval
            }, function userCreated(err, newUser) {
              if (err) {

                console.log("err: ", err);
                console.log("err.invalidAttributes: ", err.invalidAttributes)

                // If this is a uniqueness error about the email attribute,
                // send back an easily parseable status code.
                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0]
                  && err.invalidAttributes.email[0].rule === 'unique') {
                  return res.emailAddressInUse();
                }

                // Otherwise, send back something reasonable as our error response.
                return res.negotiate(err);
              }

              // Log user in
              req.session.me = newUser.id;

              // Send back the id of the new user
              return res.json({
                id: newUser.id
              });
            });
          }
        });
      }
    });
  },

  /**
   * Log out of Activity Overlord.
   * (wipes `me` from the sesion)
   */
  logout: function (req, res) {

    // Look up the user record from the database which is
    // referenced by the id in the user session (req.session.me)
    User.findOne(req.session.me, function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If session refers to a user who no longer exists, still allow logout.
      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists.');
        return res.backToHomePage();
      }

      // Wipe out the session (log out)
      req.session.me = null;

      // Either send a 200 OK or redirect to the home page
      return res.backToHomePage();

    });
  }
};
