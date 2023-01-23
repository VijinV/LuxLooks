const express = require('express');

const router = express();

const adminController = require('../controller/adminController');



router.get('/',adminController.loadDashboard)














module.exports = router
