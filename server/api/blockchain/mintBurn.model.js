let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let MintBurnSchema = new Schema({
  amountOfTokens: String,
  type: {type: String, required: true}, // mint | burn
  publicAddress: { type: String, lowercase: true },
  transactionHash: { type: String, required: true, lowercase: true},
  transactionTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MintBurn", MintBurnSchema);
