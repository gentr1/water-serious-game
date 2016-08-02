/**
 * GameWorldController
 *
 * @description :: Server-side logic for managing gameworlds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	reset: function (req, res) {
		if (!req.isSocket) {return res.badRequest();}
		GameWorld.find().limit(1).exec( function foundGame(err, game) {
			if (err) return res.negotiate(err);
			if (!game) return res.notFound();
			
			var gameWorldObj = {
			  //id: game.id,
			  overallBest: {cost:game[0].overallBest.cost},
			  sessionBests: []
			}
			GameWorld.update(game.id, gameWorldObj, function worldUpdated(err2) {
				if (err2) return res.negotiate(err2);
			});
		});
	},
	update: function (req, res) {
		if (!req.isSocket) {return res.badRequest();}
		
		GameWorld.find().limit(1).exec( function foundGame(err, game) {
			if (err) return res.negotiate(err);
			if (!game) return res.notFound();
			
			if (req.body['newscore']){
				//console.log(req.body['newscore'])
				//console.log(game[0])
				//console.log(req.body['newscore'])
				//console.log(game[0])
				var cost= req.body['newscore'][0];
				var pressure_deficit= req.body['newscore'][1];
				//if sessionBests
				//console.log(pressure_deficit)
				//console.log(cost)
				//console.log(game[0].overallBest.cost)
				if ( (cost< game[0].overallBest.cost) && (pressure_deficit>=0)){
					console.log("boolean ok")
					if (game[0].sessionBests.length==0){
						//var newscores= game[0].sessionBests;
						//if (newscores[0] && newscores[0]['score'] < cost)
						var newscores=[];
						newscores.push({'score':cost, 'user':req.body['user']});
						var gameWorldObj = {
						  //id: game.id,
						  overallBest: {cost:game[0].overallBest.cost},
						  sessionBests: newscores
						}
						GameWorld.update(game.id, gameWorldObj, function worldUpdated(err2) {
							if (err2) return res.negotiate(err2);
							sails.sockets.broadcast('funSockets', 'betterscore', {score:cost, user:req.body['user']});
						});
					}
					else{
						if (game[0].sessionBests[0] && cost < game[0].sessionBests[0]['score']){
							var newscores=game[0].sessionBests;
							newscores.unshift({'score':cost, 'user':req.body['user']});
							var gameWorldObj = {
							  //id: game.id,
							  overallBest: {cost:game[0].overallBest.cost},
							  sessionBests: newscores
							}
							GameWorld.update(game.id, gameWorldObj, function worldUpdated(err2) {
								if (err2) return res.negotiate(err2);
								sails.sockets.broadcast('funSockets', 'betterscore', {score:cost, user:req.body['user']});
							});
						}
					}
					//console.log("world "+game[0].overallBest.cost);
				}
				//console.log("updating high score from "+req.body['user']+ ": "+ cost)
				//if (cost< game[0].overallBest.cost && cost< pressure_deficit>=0){
					
					
				//}
			}
		});
	},
	ending: function (req, res) {
		if (!req.isSocket) {return res.badRequest();}
		
		GameWorld.find().limit(1).exec( function foundGame(err, game) {
			if (err) return res.negotiate(err);
			if (!game) return res.notFound();
			sails.sockets.broadcast('funSockets', 'end', {overallBest: game[0].overallBest,sessionBests: game[0].sessionBests});
		});
	},
};

