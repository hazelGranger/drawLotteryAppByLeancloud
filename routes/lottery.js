'use strict';

var router = require('express').Router();

var AV = require('leanengine');

var LotteryLeanCloud = AV.Object.extend('lotteryInfo');
var lottery = new LotteryLeanCloud();

router.get('/',function(req,res,next){
	var userinfo = req.query.userinfo;
	console.log(userinfo);
	var param = {
		userinfo: userinfo
	}
	AV.Cloud.run('drawLottery',param).then(function(data){
		console.log(data,"get hello")
	  res.end(data);
	},function(err){
	  console.log(err);
	  res.end(err)
	});


});


module.exports = router;