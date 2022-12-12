const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const {cors, corsWithOptions} = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const dishes = await Dishes.find({}).populate('comments.author');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dishes);
    } catch (e) {
      next(e);
    }
  })
  .post(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const dish = await Dishes.create(req.body);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      } catch (e) {
        next(e);
      }
    }
  )
  .put(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(`PUT operation is not supported on ${req.baseUrl}`);
    }
  )
  .delete(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const response = await Dishes.remove({});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } catch (e) {
        next(e);
      }
    }
  );

dishRouter.route('/:dishId')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish);
    } catch (e) {
      next(e);
    }
  })
  .post(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(`POST operation is not supported on ${req.baseUrl}/${req.params.dishId}`);
    }
  )
  .put(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const dish = await Dishes.findByIdAndUpdate(req.params.dishId, {
          $set: req.body
        }, {
          new: true
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      } catch (e) {
        next(e);
      }
    }
  )
  .delete(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const response = await Dishes.findByIdAndRemove(req.params.dishId);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } catch (e) {
        next(e);
      }
    }
  );

dishRouter.route('/:dishId/comments')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
      if (dish !== null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
      } else {
        const err = new Error(`Dish with id '${req.params.dishId}' not found`);
        err.status = 404;
        return next(err);
      }
    } catch (e) {
      next(e);
    }
  })
  .post(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      let dish = await Dishes.findById(req.params.dishId);
      if (dish !== null) {
        req.body.author = req.user._id;
        dish.comments.push(req.body);
        dish = await dish.save();
        dish = await Dishes.findById(dish._id).populate('comments.author');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      } else {
        const err = new Error(`Dish with id '${req.params.dishId}' not found`);
        err.status = 404;
        return next(err);
      }
    } catch (e) {
      next(e);
    }
  })
  .put(corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on ${req.originalUrl}`);
  })
  .delete(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        let dish = await Dishes.findById(req.params.dishId);
        if (dish !== null) {
          for (let i = (dish.comments.length -1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
          }
          dish = await dish.save();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        } else {
          const err = new Error(`Dish with id '${req.params.dishId}' not found`);
          err.status = 404;
          return next(err);
        }
      } catch (e) {
        next(e);
      }
    }
  );

dishRouter.route('/:dishId/comments/:commentId')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const dish = await Dishes.findById(req.params.dishId).populate('comments.author');
      if (dish !== null) {
        const comment = dish.comments.id(req.params.commentId);
        if (comment !== null) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(comment);
        } else {
          const err = new Error(`Comment with id '${req.params.commentId}' not found`);
          err.status = 404;
          return next(err);
        }
      } else {
        const err = new Error(`Dish with id '${req.params.dishId}' not found`);
        err.status = 404;
        return next(err);
      }
    } catch (e) {
      next(e);
    }
  })
  .post(corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on ${req.originalUrl}`);
  })
  .put(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      let dish = await Dishes.findById(req.params.dishId);
      if (dish === null) {
        const err = new Error(`Dish with id '${req.params.dishId}' not found`);
        err.status = 404;
        return next(err);
      } else {
        const comment = dish.comments.id(req.params.commentId);
        if (comment === null) {
          const err = new Error(`Comment with id '${req.params.commentId}' not found`);
          err.status = 404;
          return next(err);
        } else {
          if (!comment.author.equals(req.user.id)) {
            const err = new Error(`You are not authorized to perform this operation!`);
            err.status = 403;
            return next(err);
          } else {
            if (req.body.rating) {
              comment.rating = req.body.rating;
            }
            if (req.body.comment) {
              comment.comment = req.body.comment;
            }
            dish = await dish.save();
            dish = await Dishes.findById(dish._id).populate('comments.author');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
          }
        }
      }
    } catch (e) {
      next(e);
    }
  })
  .delete(corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      let dish = await Dishes.findById(req.params.dishId);
      if (dish === null) {
        const err = new Error(`Dish with id '${req.params.dishId}' not found`);
        err.status = 404;
        return next(err);
      } else {
        const comment = dish.comments.id(req.params.commentId);
        if (comment === null) {
          const err = new Error(`Comment with id '${req.params.commentId}' not found`);
          err.status = 404;
          return next(err);
        } else {
          if (!comment.author.equals(req.user.id)) {
            const err = new Error(`You are not authorized to perform this operation!`);
            err.status = 403;
            return next(err);
          } else {
            dish.comments.id(req.params.commentId).remove();
            dish = await dish.save();
            dish = await Dishes.findById(dish._id).populate('comments.author');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
          }
        }
      }
    } catch (e) {
      next(e);
    }
  });

module.exports = dishRouter;
