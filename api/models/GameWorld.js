/**
 * GameWorld.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	overallBest: {
      type: 'json',
	  defaultsTo: {cost:294156055.0}
    },
	sessionBests: {
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

