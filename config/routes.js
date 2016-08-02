/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  ////////////////////////////////////////////////////////////
  // Server-rendered HTML webpages
  ////////////////////////////////////////////////////////////

  'GET /signup': {view: 'signup'},
  'GET /': 'PageController.showHomePage',

  ////////////////////////////////////////////////////////////
  // JSON API
  ////////////////////////////////////////////////////////////

  // User enrollment + authentication
  'POST /signup': 'UserController.signup',
  'PUT /playerevaluate': 'UserController.evaluate',
  'PUT /playercommit': 'UserController.commit',
  'PUT /update': 'UserController.update',
  'PUT /committed': 'UserController.done',
  'PUT /changedm': 'UserController.changedm',
  'PUT /startdm': 'UserController.startdm',
  'PUT /stopdm': 'UserController.stopdm',
  'PUT /updatesondm': 'UserController.updatesondm',
  'PUT /updatesoffdm': 'UserController.updatesoffdm',
  'PUT /submitscore': 'GameWorldController.update',
  'PUT /login': 'UserController.login',
  'GET /logout': 'UserController.logout',
  '/editusers': 'UserController.index',
  'POST /deleteuser': 'UserController.delete',
  'POST /updateusers': 'UserController.updateusers',
  'PUT /resetscore': 'GameController.resetscore',
  'PUT /endscore': 'GameController.endscore',
  'POST /uploadnetwork': 'NetworkController.create',
  'POST /updatenetwork': 'NetworkController.update',
  'POST /shownetwork': 'NetworkController.show',
  'POST /deletenetwork': 'NetworkController.delete',
  '/uploader': 'UserController.uploader',
  '/seenetworks': 'NetworkController.index',
  '/seegames': 'GameController.index',
  '/gamecreator': 'GameController.create',
  'POST /creategame': 'GameController.update',
  'POST /deletegame': 'GameController.delete',
  'POST /editgame': 'GameController.settings',
  'POST /setgame': 'GameController.setgame',
  'POST /showgame': 'GameController.showgame',
  'POST /playgame': 'GameController.playgame'
  // '/': {
  //   view: 'homepage'
  // }

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
