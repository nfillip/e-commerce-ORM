const router = require('express').Router();
const apiRoutes = require('./api');

//going to api folder looking for an index.js (NOW PREFIX WITH API)
router.use('/api', apiRoutes);

router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>")
});

module.exports = router;