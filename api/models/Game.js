/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	name: {
      type: 'string',
      required: true,
	  unique: true
    },
	network_name: {
		type: 'string',
		required: true
	},
	is_on: {
		type: 'boolean',
      defaultsTo: false
	},
	updates_on: {
		type: 'boolean',
      defaultsTo: true
	},
	time_points: {
		type: 'integer',
		defaultsTo: 1
	},
	team_size: {
		type: 'integer',
		defaultsTo: 1
	},
	players_teams: {
      type: 'json',
	  defaultsTo: {}
    },
	initialScore: {
      type: 'json',
	  defaultsTo: {}
    },
	overallBest: {
      type: 'json',
	  defaultsTo: {}
    },
	sessionBests: {
      type: 'json',
	  defaultsTo: []
    },
	pumps_roles:{
	  type: 'json',
	  defaultsTo: {}
	},
	valves_roles:{
	  type: 'json',
	  defaultsTo: {}
	},
	pipes_roles:{
	  type: 'json',
	  defaultsTo: {}
	},
	initial_solution:{
	  type: 'json',
	  defaultsTo: []
	},
	last_solution:{
	  type: 'json',
	  defaultsTo: {}
	},
	game_state:{
		type: 'json',
		defaultsTo: {}
	},
	modified_pipes:{
		type: 'json',
		defaultsTo: {}
	},
	white_image: {
      type: 'string',
      defaultsTo: ''
    },
	black_image: {
      type: 'string',
      defaultsTo: ''
    },
	height_image: {
      type: 'string',
      defaultsTo: ''
    },
	toJSON: function() {
      var obj = this.toObject();
      delete obj._csrf;
      return obj;
    }
  }
};

