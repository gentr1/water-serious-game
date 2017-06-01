/**
 * NetworkController
 *
 * @description :: Server-side logic for managing networks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
module.exports = {
	create: function(req, res) {
		//console.log(req.param('network-pipes'));
		var fname=req.param('network-name');
		Network.find({select: ['name']}).exec(function(err, results) {
			if(err) {
				console.log("bad request - cannot seem to find networks models in database...")
			}
			var isIn=false;
			for (var i=0;i<results.length;i++){
				if (results[i]['name']==fname){
					isIn=true;
				}
			}
			if (fname!="" && isIn==false){
				req.file('epanetfile').upload({
				  dirname: '../../',
				  saveAs: fname+'.inp'
				},function (err, uploadedFiles) {
					if (err) return res.negotiate(err);
					Network.create({
					  name: fname,
					  junctions: JSON.parse(req.param('network-junctions')), 
					  reservoirs: JSON.parse(req.param('network-reservoirs')), 
					  tanks: JSON.parse(req.param('network-tanks')), 
					  pipes: JSON.parse(req.param('network-pipes')), 
					  pumps: JSON.parse(req.param('network-pumps')), 
					  pump_curves: JSON.parse(req.param('pump-curves')), 
					  valves: JSON.parse(req.param('network-valves')), 
					  backdrop_data: JSON.parse(req.param('network-backdrop')),
					  pipe_diameters: JSON.parse(req.param('pipe-diameters')),
					  pipe_diameters_costs: JSON.parse(req.param('pipe-diameters-costs')),
					  min_max_diff_pressure: JSON.parse(req.param('min-max-diff-pressure')),
					  min_max_age: JSON.parse(req.param('min-max-age')),
					  min_max_leakage: JSON.parse(req.param('min-max-leakage'))
					}, function networkCreated(err, newNet) {
						//return res.json({
						//	message: uploadedFiles.length + ' file(s) uploaded successfully!'
						//});
						res.redirect('/seenetworks');
					});
					
				});
			}
			else{
				return res.json({
					message: ' Upload unsuccessfull ! File name already in use. Please retry with a different file name!'
				});
			}
		});
		
		//console.log(req.file('epanetfile'))
	},
	delete: function(req, res) {
		//console.log('delete')
		//console.log(req.param('id'))
		Network.findOne(req.param('nid')).exec(function(err, result) {
			fs.stat(result['name']+'.inp', function (err2, stats) {
			   //console.log(stats);//here we got all information of file in stats variable
			   if (err2) {
				   return console.error(err);
			   }
			   fs.unlink(result['name']+'.inp',function(err3){
					if(err) return console.log(err3);
					console.log('file deleted successfully');
					Network.destroy({id:req.param('nid')}).exec(function (err){
					  if (err) {
						//return res.negotiate(err);
						sails.log('error when trying to delete network')
					  }
					   
					  sails.log('deleted network in database...');
					  res.redirect('/seenetworks');
					});
			   });  
			});
			
		});
		//Network.update(req.param('network-id'), netObj, function netUpdated(err3) {
		
		//})
			
	},
	
	update: function(req, res) {
		console.log("something is updated")
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
				  
					 // id = req.param('network-id')
					 // pipes: JSON.parse(req.param('network-pipes')), 
					 // pumps: JSON.parse(req.param('network-pumps')), 
					 // valves: JSON.parse(req.param('network-valves')),
						
				  Network.findOne(req.param('network-id')).exec(function(err2, result) {
				  console.log('update redirection');
					  var netObj = {
							name: result['name'],
							junctions: JSON.parse(req.param('network-junctions')), 
							reservoirs: result['reservoirs'],
							tanks: result['tanks'],
							pipes: JSON.parse(req.param('network-pipes')), 
							pumps: JSON.parse(req.param('network-pumps')), 
							pump_curves: result['pump_curves'], 
							valves: JSON.parse(req.param('network-valves')), 
							backdrop_data: result['backdrop_data'], 
							pipe_diameters: JSON.parse(req.param('pipe-diameters')),
							pipe_diameters_costs: JSON.parse(req.param('pipe-diameters-costs')),
							min_max_diff_pressure: JSON.parse(req.param('min-max-diff-pressure')),
							min_max_age: JSON.parse(req.param('min-max-age')),
							min_max_leakage: JSON.parse(req.param('min-max-leakage'))
						}
						//console.log(netObj.junctions['J511']);	
						Network.update(req.param('network-id'), netObj, function netUpdated(err3) {
							if (err3) return res.negotiate(err2);
							res.redirect('/seenetworks');
						});
				  });
			  }
			  else{
				sails.log.verbose('The network viewer is only avaialable to users with admin privilege');
				return res.view('homepage');  
				  
			  }

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
		  if (user.admin==true){
			  Network.find({select: ['name','id']}).exec(function(err, results) {
				  return res.view('network/index', {
					me: {
					  id: user.id,
					  name: user.name,
					  email: user.email,
					  //title: user.title,
					  //history: user.history,
					  admin: user.admin//,
					  //gravatarUrl: user.gravatarUrl
					},
					networks: results
				  });
			  });
		  }
		  else{
			sails.log.verbose('The network viewer is only avaialable to users with admin privilege');
			return res.view('homepage');  
			  
		  }

		});
    
		
		
		}
	},
	show: function(req, res) {
		if (req.session.me) {
			User.findOne(req.session.me, function (err, user){
				
			  if (err) {
				return res.negotiate(err);
			  }
	
			  if (!user) {
				sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
				return res.view('homepage');
			  }
			  //console.log(user.name);
			  if (user.admin==true){
				
				  Network.findOne(req.param('nid')).exec(function(err, result) {
					  return res.view('network/show', {
						me: {
						  id: user.id,
						  name: user.name,
						  email: user.email,
						  //title: user.title,
						  //history: user.history,
						  admin: user.admin//,
						  //gravatarUrl: user.gravatarUrl
						},
						network: result
					  });
				  });
			  }
			  else{
				sails.log.verbose('The network viewer is only avaialable to users with admin privilege');
				return res.view('homepage');  
				  
			  }

			});
    
		
		
		}
	
	}
};

