const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

//NO NEED OF CHECK ID MIDDLEWARE
// router.param('id', tourController.checkID);
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;