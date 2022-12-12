const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const {cors, corsWithOptions} = require('./cors');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const promotions = await Promotions.find({});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promotions);
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
        const promotion = await Promotions.create(req.body);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
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
        const response = await Promotions.remove({});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } catch (e) {
        next(e);
      }
    }
  );

promoRouter.route('/:promoId')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const promotion = await Promotions.findById(req.params.promoId);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promotion);
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
      res.end(`POST operation is not supported on ${req.baseUrl}/${req.params.promoId}`);
    }
  )
  .put(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const promo = await Promotions.findByIdAndUpdate(req.params.promoId, {
          $set: req.body
        }, {
          new: true
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
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
        const response = await Promotions.findByIdAndDelete(req.params.promoId);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } catch (e) {
        next(e);
      }
    }
  );

module.exports = promoRouter;
