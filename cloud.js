AV.Cloud.define('drawLottery', function(request, response) {
	var time = new Date();
	console.log(request.params,"cloudrequest");

	var getDateString = function(time){
		var date = {
			y: time.getFullYear(),
			m: time.getMonth()+1,
			d: time.getDate()
		}
		return date.y + "" + (date.m > 9 ? date.m : "0"+date.m) +  (date.d > 9 ? date.d : "0"+date.d);
	}

	var getTimeString = function(time){
		var mytime = {
			h: time.getHours()>9?time.getHours()+"":"0"+time.getHours(),
			m: time.getMinutes()>9?time.getMinutes()+"":"0"+time.getMinutes(),
		}
		return mytime.h + mytime.m;
	}

	var checkTime = function(time){
		var h = time.getHours();
		return (h>=0 && h<6)? false : true;
	}

	var checkDate = function(time){
		var mydate = getDateString(time);
		if (mydate>"20170108") {
			return false;
		}else{
			return true;
		}
	}

	var userinfo = request.params.userinfo;

	var LotteryLeanCloud = AV.Object.extend('lotteryInfo');
	var lottery = new LotteryLeanCloud();

	var PrizeLeanCloud = AV.Object.extend('prize');
	var prize = new PrizeLeanCloud();

	var userQuery = new AV.Query('lotteryInfo');
	userQuery.equalTo('userinfo',userinfo);
	var drewQuery = new AV.Query('lotteryInfo');
	drewQuery.equalTo('lastDrewDate',getDateString(time));

	var prizeQuery = new AV.Query('prize');

	//var cqlres;

	var drawLottery = function(next){
		var dldate = getDateString(time);
		var dltime = getTimeString(time);
		console.log(dldate,dltime);
		var cql = "select * from prize where date='"+ dldate +"' and time<='"+ dltime +"' and state=0 order by time limit 1";

		AV.Query.doCloudQuery(cql).then(function (data) {
			console.log(data.results.length,"dldata");
			if (data.results.length) {
				var prize = data.results[0];
				var cqlres = prize.get('code');
				console.log(prize.get('prizeItem'),"drawLottery");
				prize.set('state',1);
				prize.set('winner',userinfo);
				prize.save().then(function(data){
					console.log("saved");
					next(cqlres);
				}).catch(function(err){
					console.log(err);
				});
			}else{
				//0代表没有中奖
				next("0");
			}
		},function(err){
			console.log(err);
		})
		
	}

	var saveDrewUser = function(next){
		lottery.set('userinfo',userinfo);
		lottery.set('lastDrewDate',getDateString(time));
		lottery.save().then(function(data){
			console.log("saved");
		}).catch(function(err){
			console.log(err);
		});
	}

	if (checkDate(time)) {
		if (checkTime(time)) {
			var queryLottery = AV.Query.and(userQuery,drewQuery);
			queryLottery.first().then(function(result){
				console.log(result);
				if (result) {
					//找到用户和对应抽奖信息,用户已经抽过奖
					response.success("-1");
				}else{
					drawLottery(function(cqlres){
						saveDrewUser();
						console.log(cqlres,"cqlres");
						response.success(cqlres);
					});
				}
			}).catch(function(err){
				response.error(err);
			});
		}else{
			response.success("-2");
		}
	}else{
		response.success("-3");
	}

});