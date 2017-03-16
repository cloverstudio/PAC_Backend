/** Handles connection for mongoDB and Redis operation */

var mongoose = require('mongoose');
var redis = require("redis");
var _ = require('lodash');

var Const = require('./consts.js');
var Conf = require('./init.js');

var DatabaseManager = {

    isDatabaseReady : false,
    isRedisReady: false,
    redisClient:null,
    loadedModels : {},
    init: function(callBack){
                
		var self = this;

        // Connection to chat database
        console.log("Connecting mongoDB " + Conf.databaseUrl);
        
        try{
            
            if(!mongoose.connection.readyState){

                mongoose.connect(Conf.databaseUrl, function(err){

                    if (err) {

                        console.log(err);

                    } else {

                        self.setupRedis(callBack);
                        
                    }
                    
                });

            } else {

                // Defining a schema
                self.setupRedis(callBack);
                        
            }
            
        } catch(ex){

	        console.log("Failed to connect MongoDB!");

	        throw ex;

        }

    },

    setupRedis : function(callBack){
        
        var self = this;
        
        self.isDatabaseReady = true;
        self.redisClient = redis.createClient(Conf.redis);

        self.redisClient.on("error", function (err) {
            console.log("Redist Error " + err);
        });

        self.redisClient.on("ready", function (err) {

            self.isRedisReady = true;
            
            if(callBack){
                callBack(self.isDatabaseReady);
            }
            
        });
        
    },
    
    getModel : function(modelName){

        if(!this.isDatabaseReady)
            return null;

        if(!_.isEmpty(this.loadedModels[modelName]))
            return this.loadedModels[modelName];


        var model = require('../Models/' + modelName);

        if(model){

            var model = new model();

            model.init(mongoose);

            this.loadedModels[modelName] = model;

            return model;

        }
        else
            return null;

    },
    
    redisDel : function(key){
        
        this.redisClient.del(key);
        
    },
    redisIncr : function(key){

        this.redisClient.incr(key , redis.print);
        
    },

    
    redisDecr : function(key){
        
        this.redisClient.decr(key , redis.print);
        
    },
     
    redisSave : function(key,value){
        
        var saveValue = JSON.stringify(value);
        
        this.redisClient.set(key, saveValue , redis.print);
        
    },

    
    redisGet : function(key,callBack){
        
        this.redisClient.get(key, function(err, value) {
            
            if(err)
                console.log(err);
                
            if(callBack)
                callBack(err,JSON.parse(value));
                
        });
        
    },
    
    redisSaveValue : function(key,value){
        
        this.redisClient.set(key, value);
        
    },

    
    redisGetValue : function(key,callBack){
        
        this.redisClient.get(key, function(err, value) {
            
            if(callBack)
                callBack(err,value);
                
        });
        
    },

    redisSaveToHash : function(key,hashKey,value){
        
        this.redisClient.hset([key,hashKey,value], redis.print);

        
    },

    redisSaveToSortedList : function(key,sortkey,value){
        
        this.redisClient.zadd([key,value,sortkey], redis.print);

        
    },

    redisGetSortedList : function(key,offest,limit,callBack){

        var args = [ key, '+inf', '-inf' , 'WITHSCORES', 'LIMIT', offest, limit ];
        this.redisClient.zrevrangebyscore(args, function (err, response) {
            if (err) {
                
                console.log(err);
                
                if(callBack)
                    callBack(err,null);
                
                return;
            }
            
            if(!_.isArray(response)){
                
                callBack("not array",null);
                
                return;
            }

           if(response.length % 2 != 0){
                
                callBack("invalid array",null);
                
                return;
                
            }
            
            var result = [];
            
            for(var i = 0 ; i < response.length ; i += 2){
                
                var key = response[i];
                var value = response[i+1];
                
                result[key] = value;
                
            }
            
            if(callBack)
                callBack(err,result);
 
        });

    },

    toObjectId: function(_id) {

        if (!_.isEmpty(_id)) return new mongoose.Types.ObjectId(_id);
         
    }

}

module["exports"] = DatabaseManager;
