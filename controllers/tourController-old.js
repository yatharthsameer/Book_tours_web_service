const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// ); -> substitute for this code is written with const Tour = ...


//CHECK ID FUNCTION IS NO LONGER NEEDED AS WE WILL BE USING UNIQUE IDS GENERATED BY MONGOOSE.
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit - '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
try{
  // //BUILD QUERY
  // const queryObj = {...req.query};
  // //even if someone sends queries regarding page sort limit fields, we will be discarding them.
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach(el => delete queryObj[el]); 

  // //ADVANCED FILTERING - necessary to pass the advanced filtering parameters like gte gt lte lt because we need to convert them into 'gte' -> '$gte' to make them work in mongoose.
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // console.log(JSON.parse(queryStr));

  // let query = Tour.find(JSON.parse(queryStr));

  // console.log(req.query, queryObj);

  // //SORTING BY PRICE, THEN IF TIE, THEN BY RATINGSAVERAGE
  // if(req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt'); //if user doesn't provide a sorting method, we sort the results in descending order of createdAt, so that the newest tour appears first.
  // }

  // //PAGINATION
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // //page=3&limit=10, 1-10 : page-1, 11-20 : page-2 ...
  // query = query.skip(skip).limit(limit);

  // if(req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if(skip >= numTours) throw new Error('This page does not exist');
  // }




  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().paginate();
  const tours = await features.query;  //returns a Javascript array of all the tours from Tour

  //const tours = await Tour.find(); //this is when you are commenting out the above queryObj code.

  // PASSING IT WITH QUERIES
  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');


  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
  } catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try{
    //Tour.findOne({_id: req.params.id}) excatly the same as the below line
    const tour = await Tour.findById(req.params.id);//req.params.id gives the 'id' from 'api/v1/tours/:id'.
    
    res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
}
  catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });

  // const tour = tours.find(el => el.id === id);

  
  // });
};
}

exports.createTour = async (req, res) => {

// const newTour = new Tour({})
// newTour.save()
  try{
    const newTour = await Tour.create(req.body); //same thing as above 2 lines but shorter

    res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
  }

  catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  
};
}

exports.updateTour = async (req, res) => {
  try{
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //new updated document will be returned and sent back to the client. It is a default query which comes with a mongoose model.
        runValidators: true
      });

      res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
};
}

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTourStats = async (req, res) => {
  try{
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: { $gte:4.5}}
      },
      {
        $group: {
          // _id: null,  //group all the ids together
          _id: '$difficulty', //to make different groups by difficulty
          numTours: {$sum: 1},
          numRatings: {$sum: '$ratingsQuantity'},
          avgRating: {$avg: '$ratingsAverage'},
          avgPrice: {$avg: '$price'} ,
          minPrice: {$min: '$price'},
          maxPrice: {$max: '$price'},
        }
      },
      {
        $sort: { avgPrice: 1} //sort by avgPrice (1 for ascending order)
      },
      // { //to hide easy ones
      //   $match: {_id: {$ne: 'easy'}}
      // } 
    ]);

      res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};