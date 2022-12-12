const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const {cors, corsWithOptions} = require('./cors');
const authenticate = require('../authenticate');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, authenticate.verifyUser, async (req, res, next) => {
    try {
      const favorite = await Favorites.find({user: req.user._id}).populate('user').populate('dishes');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
    } catch (e) {
      next(e);
    }
  })
  .post(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      let favorite = await Favorites.findOne({user: req.user._id.valueOf()});
      if (favorite === null) {
        favorite = await Favorites.create({
          user: req.user._id,
          dishes: req.body.map(d => d._id)
        });
      } else {
        // saving only not presented earlier dishes
        const dishesToSave = [];
        const favoriteDishesIds = favorite.dishes.map(d => d.valueOf());
        req.body.forEach(newDish => {
          if (favoriteDishesIds.indexOf(newDish._id) === -1) {
            dishesToSave.push(newDish._id);
          }
        });
        if (dishesToSave.length > 0) {
          favorite.dishes.push(...dishesToSave);
          favorite = await favorite.save();
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
    } catch (e) {
      next(e);
    }
  })
  .delete(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      const response = await Favorites.findOneAndRemove({user: req.user._id.valueOf()});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(response);
    } catch (e) {
      next(e);
    }
  });

favoriteRouter.route('/:dishId')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      let favorite = await Favorites.findOne({user: req.user._id.valueOf()});
      if (favorite === null) {
        favorite = await Favorites.create({
          user: req.user._id,
          dishes: [req.params.dishId]
        });
      } else {
        const favoriteDishesIds = favorite.dishes.map(d => d.valueOf());
        if (favoriteDishesIds.indexOf(req.params.dishId) === -1) {
          favorite.dishes.push(req.params.dishId);
          favorite = await favorite.save();
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
    } catch (e) {
      next(e);
    }
  })
  .delete(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      let favorite = await Favorites.findOne({user: req.user._id.valueOf()});
      if (favorite !== null) {
        const favoriteDishesIds = favorite.dishes.map(d => d.valueOf());
        const index = favoriteDishesIds.indexOf(req.params.dishId);
        if (index !== -1) {
          favorite.dishes.splice(index, 1);
          await favorite.save();
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      } else {
        return next();
      }
    } catch (e) {
      next(e);
    }
  });




module.exports = favoriteRouter;
