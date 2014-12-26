var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('login', {});
});

router.post('/handler', function(req, res) {
  // Authenticate
  // Set something in session
  // Redirect to homepage
  res.redirect(303, '/');
})

module.exports = router;
