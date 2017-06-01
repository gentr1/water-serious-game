/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	showHomePage: function (req, res) {
   //console.log(req.allParams())
    // If not logged in, show the public view.
    if (!req.session.me) {
      sails.log('no me id in the request')
      return res.view('homepage');
    }

    // Otherwise, look up the logged-in user and show the logged-in view,
    // bootstrapping basic user data in the HTML sent from the server
    User.findOne(req.session.me, function (err, user){
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }
	  Game.find({select: ['name','id','is_on','players_teams','game_mode']}).exec(function(err, games) {
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
      // return res.view('dashboard', {
        // me: {
          // id: user.id,
          // name: user.name,
          // email: user.email,
          // //title: user.title,
          // history: user.history,
          // admin: user.admin,
          // gravatarUrl: user.gravatarUrl
        // }
      // });

    });
  },

};
