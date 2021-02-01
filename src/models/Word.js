const mongoose = require("mongoose");

const Word = {
  id: String,
  type: Number,
  article: String,
  word: String,
  favorite: Boolean,
  istOk: Number,
  shown: Boolean,
  showCount: Number,
  group: Number,
  photoUrl: String,
  mineAdded: Boolean,
  priorty: Number,
  known: Boolean,
  vocabularyDetail: [
    {
      id: String,
      vocabularyId: String,
      description: String,
      sentenceMeaning: String,
      language: Number,
    },
  ],
};

module.exports = mongoose.model("Word", Word);
