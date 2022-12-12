const mongoose = require('mongoose');
const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/confusion';
const connect = mongoose.connect(url);

connect.then(db => {
  console.log('connected to server');

  Dishes.create({
    name: 'Uthapizza',
    description: 'Test description'
  }).then(dish => {
    console.log('Created dish: ', dish);

    return Dishes.findByIdAndUpdate(dish._id, {
      $set: {description: 'Updated test description'},
    }, {
      new: true
    });
  }).then(dish => {
    console.log('Found dish: ', dish);

    dish.comments.push({
      rating: 5,
      comment: 'I am getting a sinking feeling',
      author: 'Leonardo Di Carpaccio'
    });
    return dish.save();
  }).then(dish => {
    console.log(dish);

    return Dishes.remove({});
  }).then(() => {
    return mongoose.connection.close();
  }).catch(err => {
    console.err(err)
  });

});


