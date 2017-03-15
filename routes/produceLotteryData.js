'use strict';

var router = require('express').Router();

var AV = require('leanengine');

router.get('/',function(req,res,next){
	res.render('produceLotteryData',{ currentTime: new Date() })
});



module.exports = router;