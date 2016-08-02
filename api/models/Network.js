/**
 * Network.js
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
	junctions: {
      type: 'json',
	  defaultsTo: {}
    },
	reservoirs: {
      type: 'json',
	  defaultsTo: {}
    },
	tanks: {
      type: 'json',
	  defaultsTo: {}
    },
	pipes: {
      type: 'json',
	  defaultsTo: {}
    },
	pumps: {
      type: 'json',
	  defaultsTo: {}
    },
	pump_curves: {
      type: 'json',
	  defaultsTo: []
    },
	valves: {
      type: 'json',
	  defaultsTo: {}
    },
	backdrop_data: {
      type: 'json',
	  defaultsTo: []
    },
	pipe_diameters: {
      type: 'json',
	  defaultsTo: []
    },
	pipe_diameters_costs: {
      type: 'json',
	  defaultsTo: []
    },
	min_max_diff_pressure: {
      type: 'json',
	  defaultsTo: []
    },
	min_max_age: {
      type: 'json',
	  defaultsTo: []
    },
	min_max_leakage: {
      type: 'json',
	  defaultsTo: []
    },
	toJSON: function() {
      var obj = this.toObject();
      delete obj._csrf;
      return obj;
    }
  }
};

