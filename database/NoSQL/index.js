const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/systems-design-capstone');

let questionsSchema = mongoose.Schema({
  product_id: Number,
  question_id: Number,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean
});

let answersSchema = mongoose.Schema({
  product_id: Number,
  id: Number,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
});

let photosSchema = mongoose.Schema({
  answer_id: Number,
  id: Number,
  url: String
});

let Questions = mongoose.model('Questions', questionsSchema);
let Answers = mongoose.model('Answers', answersSchema);
let Photos = mongoose.model('Photos', photosSchema);

// let retrieve = (/* TODO */) => {

// }

// module.exports.retrieve = retrieve;