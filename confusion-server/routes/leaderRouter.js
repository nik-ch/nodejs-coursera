const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const {cors, corsWithOptions} = require('./cors');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const leaders = await Leaders.find({});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leaders);
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
        const leader = await Leaders.create(req.body);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
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
        const response = await Leaders.deleteMany({});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } catch (e) {
        next(e);
      }
    }
  );

leaderRouter.route('/:leaderId')
  .options(corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors, async (req, res, next) => {
    try {
      const leader = await Leaders.findById(req.params.leaderId);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leader);
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
      res.end(`POST operation is not supported on ${req.baseUrl}/${req.params.leaderId}`);
    }
  )
  .put(
    corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    async (req, res, next) => {
      try {
        const leader = await Leaders.findByIdAndUpdate(req.params.leaderId, {
          $set: req.body
        }, {
          new: true
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
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
        const response = await Leaders.findByIdAndDelete(req.params.leaderId);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      } catch (e) {
        next(e);
      }
    }
  );

module.exports = leaderRouter;
