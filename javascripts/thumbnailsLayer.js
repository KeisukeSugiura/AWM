$(function () {
    var telepath = new TelepathyClient();
    var url_list = new Array();
    var favorites = new Array();
    var web_setting_layer = "http://localhost:50000/ui/browse";
    var makeLayerLeft = screen.width / 2 + 15;
    var makeLayerTop = screen.height / 10;
    var makeLayerWidth = screen.width * 2 / 5;
    var makeLayerHeight = screen.height * 4 / 5;
    var layer_id = 'layer00';
    var home_layer_id;
    var myId='';
    var manageLayer_id;
    var imageStack = [];
    var imageBackStack = [];
    var transFlg = false;

    var screenEdgeMap=[];
    var imageEdgeMap=[];
    var currentScore=0;
    var moveInterval = null;

    var telepath = new TelepathyClient();
    var telepath_name = 'name';
    var telepath_url = 'ws://apps.wisdomweb.net:64260/ws/mik';
    var telepath_site = 'kyoshida';
    var telepath_token = 'Pad:5538';
    var reconnectInterval = 5 * 1000;
    var reconnectTimer = null;
    var heartbeatInterval = 20 * 1000;
    var heartbeatTimer = null;
    var heartbeatCounter = 0;

    $('#item_board').css({
        width:screen.width,
        height:screen.height
    });
    

    swb.initialize(function () {
        swb.transmitRequest({
            S: swb.currentPath,
            D: '../',
            C: 'set-properties',
            P: {
                value: {
                    browser: {
                        level:30,
                        alphaValue: 0.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false,
                        //level: -2147483623
                    },
                    setting: {
                        level: 30,
                        alphaValue: 1.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false
                    },
                    movable: {
                        level: 30,
                        alphaValue: 0.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false,
                        frame: {
                            origin: {
                                x: 0,
                                y: 0
                            },
                            size: {
                                width: screen.width,
                                height: screen.height
                            }
                        }
                    },
                    preview:{
                        alphaValue: 0.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false,
                    }
                }
            }
        }, function (req, res) {
            
            swb.transmitRequest({
                        S: swb.currentPath,
                        D: '../',
                        C: 'get-all-properties',
                        P: {}
                    }, function (req, res) {
                    /*
                     Telepathyサーバ
                     */
                   
                    telepath.on('connect', function (event) {

                        telepath.hello({from:'thumbnailsLayer'}, function (req, res) {
                            if (res.status == 200) {
                                // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));
                                

                        }
                     });
                    });

                    telepath.on('message', function (message) {
                        //console.error(message);
                        if(message.body.act == 'addImage'){
                            //console.err(message.body.thumbnail);
                            imageBackStack = [];
                            if(!(imageStack.indexOf(message.body.thumbnail.id) == -1)){
                                $('#'+imageStack[imageStack.indexOf(message.body.thumbnail.id)]).remove();
                                imageStack.splice(imageStack.indexOf(message.body.thumbnail.id),1);
                            }

                            var addImage = new Image();
                            imageStack.push(message.body.thumbnail.id);
                            addImage.id = message.body.thumbnail.id;
                            addImage.className = 'thumbnail';
                            addImage.width = message.body.thumbnail.width;
                            addImage.height = message.body.thumbnail.height;
                            addImage.onload = function(e){
                                //var targetDiv = document.getElementById('item_board');
                                //targetDiv.appendChild(addImage);
                                $('#item_board').append(addImage);
                                $('#'+message.body.thumbnail.id).css({
                                    position:'absolute',
                                    opacity:0.5
                                });
                                $('#'+message.body.thumbnail.id).offset({
                                    left:message.body.thumbnail.left,
                                    top:message.body.thumbnail.top
                                });
                            }
                            addImage.src = message.body.thumbnail.img;

                        }

                        if(message.body.act == 'changeAlphaMode'){
                            setTrans(function(){});
                        }

                        if(message.body.act == 'changeAlphaThumbnail'){
                            var ros = document.getElementsByClassName('thumbnail');
                            methodForImprovementOfLegibility.changeAlphaControler(ros);
                        }

                        if(message.body.act == 'rotateThumbnail'){
                            var ros = document.getElementsByClassName('thumbnail');
                            methodForImprovementOfLegibility.rotateControler(ros);
                            
                        }

                        if(message.body.act == 'changeColorInverse'){
                            var ros = document.getElementByClassName('thumbnail');
                            methodForImprovementOfLegibility.changeColorInverse(ros);
                        }

                        if(message.body.act == 'deleteItems'){
                            $('#item_board').empty();
                            clearInterval(moveInterval);
                            moveInterval = null;
                            imageStack = [];
                        }

                        if(message.body.act == 'backState'){
                            backState();
                        }

                        if(message.body.act == 'reuseState'){
                            reuseState();
                        }

                        if(message.body.act == 'scaleChange'){
                            var ros = document.getElementsByClassName('thumbnail');
                            methodForImprovementOfLegibility.changeScaleControler(ros);
                        }

                        if(message.body.act == 'changeMethodMode'){
                            methodForImprovementOfLegibility.changeMethodMode();
                        }

                        if(message.body.act == 'useMethod'){
                            var ros = document.getElementsByClassName('thumbnail');
                            methodForImprovementOfLegibility.useMethod(ros);
                        }

                        if(message.body.act == 'stopUseMethod'){
                            methodForImprovementOfLegibility.stopUseMethod();
                        }

                        if(message.body.act == 'semiAutoImageSet'){
                            upsertSemiAutoClipping(message.body.thumbnail);
                        }

                        if(message.body.act == 'stopSemiAutoImageSet'){
                            stopSemiAutoClipping();
                        }

                        if(message.body.act == 'test'){
                            //TODO
                            setScreenEdgeMap();
                        }


                    });

                    telepath.on('error', function (event) {
                        console.log('on error');
                        stopHeartbeating();
                        reconnect();
                    });

                    telepath.on('response', function (req, res) {
                        if (res.method == 'HELLO') {
                            console.log('on response HELLO');
                            if (res.status != 200) {
                                close();
                                return;
                            }
                            startHeartbeating();
                            return;
                        }
                    });

                    telepath.on('close', function () {
                        console.log('on close');
                        stopHeartbeating();
                        reconnect();
                    });

                    var connect = function () {
                        telepath.connect(telepath_url, telepath_site, telepath_token);
                    };

                    var reconnect = function () {
                        if (reconnectTimer != null) {
                            clearTimeout(reconnectTimer);
                            reconnectTimer = null;
                        }
                        reconnectTimer = setTimeout(function () {
                            connect();
                        }, reconnectInterval);
                    };

                    var startHeartbeating = function () {
                        stopHeartbeating();
                        heartbeatTimer = setInterval(function () {
                            heartbeat();
                        }, heartbeatInterval);
                    };

                    var stopHeartbeating = function () {
                        if (heartbeatTimer != null) {
                            clearInterval(heartbeatTimer);
                            heartbeatTimer = null;
                        }
                    };

                    var heartbeat = function () {
                        console.log('heartbeat');

                        telepath.echo({body: {timestamp: Date.now(), count: heartbeatCounter}});
                        heartbeatCounter++;
                    };
                    var close = function () {
                        telepath.close();
                    };


                    connect();


                    /*
                     Telepathyサーバ終了
                     */
                });
            });

    
    });

    function backState(){
        var backId = imageStack.pop();
        imageBackStack.push(document.getElementById(backId));
        $('#'+backId).remove();
    }

    function reuseState(){
        var popElm = imageBackStack.pop();
        $('#item_board').append(popElm);
        imageStack.push(popElm.id);

    }


    function setTrans(callback) {
            callback = (typeof callback == 'function' ? callback : function () {
            });
            if (transFlg) {

                swb.transmitRequest({
                    S: swb.currentPath,
                    D: '../',
                    C: 'set-properties',
                    P: {
                        value: {
                            setting: {
                                alphaValue: 1.0
                            },
                            browser: {
                                alphaValue: 1.0
                            },
                            movable: {
                                alphaValue: 1.0                            }
                        }
                    }

                }, function (req, res) {

                    transFlg=!transFlg;

                    callback(req, res);                
                });
            } else {
                swb.transmitRequest({
                    S: swb.currentPath,
                    D: '../',
                    C: 'set-properties',
                    P: {
                        value: {
                            setting: {
                                alphaValue: 0.0
                            },
                            browser: {

                                alphaValue: 0.0
                            },
                            movable: {
                                alphaValue: 0.0
                            }
                        }
                    }

                }, function (req, res) {

                    transFlg=!transFlg;
                    callback(req, res);
                });
            }

        }


    var methodForImprovementOfLegibility = (function(){
        var module = {};
        module.methodMode = 0;//0:回転,1:透過,2:拡大縮小


        module.changeMethodMode = function(){
            module.methodMode = module.methodMode +1;
            if(module.methodMode > 2){
                module.methodMode = 0;
            }
        }

        module.useMethod = function(elms){

            switch(module.methodMode){
                case 0:
                    module.rotateControler(elms);
                    break;
                case 1:
                    module.changeAlphaControler(elms);
                    break;
                case 2:
                    module.changeScaleControler(elms);
                    break;
                default:
                    break;
            }
        }

        module.stopUseMethod = function(){
            if(module.changeAlphaFlg){
                module.stopChangeAlpha();
                module.changeAlphaFlg = false;
            }
            if(module.rotateFlg){
                module.stopRotate();
                module.rotateFlg = false;            }
            if(module.changeScaleFlg){    
                module.stopAutoChangeScale();
                module.changeScaleFlg = false;
            }
        }


        //rotate
        module.theta = 0;
        module.r = 100;
        module.thetaIncrement=null;
        module.rotateItemList = [];
        module.rotateFlg = false;

        module.rotateItem = function(elmCtx){
            /*
                elm = {elm,center{x,y}}
             */
            
            $('#'+elmCtx.elm.id).offset(
              {
                left:elmCtx.center.x + module.r*Math.cos(Math.PI/180 * module.theta),
                top:elmCtx.center.y + module.r*Math.sin(Math.PI/180 * module.theta)
              }
            );
          
        }

        module.incrementTheta = function(){
            module.theta = module.theta + 3.0;
        }

        module.startRotate = function(elm){
           module.rotateItemList.push(setInterval(function(){module.rotateItem(elm);},2));
        }
        module.stopRotate = function(){
            for(var i=0; i< module.rotateItemList.length;i++){
                clearInterval(module.rotateItemList[i]);
            }
            clearInterval(module.thetaIncrement);
            module.thetaIncrement = null;
            //module.theta = 0;
            module.rotateItemList = [];

        }

        /**
         * [これを対象アイテムリストにつかう]
         * @param  {[type]} elms [description]
         * @return {[type]}      [description]
         */
        module.rotateControler = function(elms){
            if(module.rotateFlg){
                module.stopRotate();
                module.rotateFlg = false;
            }else{
                for(var i=0; i<elms.length;i++){
                    module.startRotate({elm:elms[i],center:
                      {x:parseInt(elms[i].style.left),y:parseInt(elms[i].style.top)}});
                }
               module.thetaIncrement = setInterval(function(){module.incrementTheta();},2);
                module.rotateFlg = true;
            }
        }


        //transparent
        module.alphaVector = true; //true:透けてく,false:実体化
        module.alphaValue = 0.5;
        module.ac = 2;
        module.changeAlphaItemList = [];
        module.changeAlphaInterval = null;
        module.changeAlphaFlg = false;


        module.changeAlpha = function(){
          // if(module.alpahVector){
          //   module.alphaValue= module.alphaValue - module.ac;
          //   if(module.alphaValue <= 0){
          //     module.alphaValue = 0;
          //     module.alphaVector = false;
          //   }
             
          // }
          // else{
          //   module.alphaValue=module.alphaValue + module.ac;
          //   if(module.alphaValue >= 1.0){
          //     module.alphaValue = 1.0;
          //     module.alphaVector = true;
          //   }
          // }
          // 
          module.alphaValue = 0.3*Math.cos(Math.PI/180 * module.ac)+0.5;
          module.ac = module.ac + 3.0;
        }

        module.changeElementAlpha = function(elm){
          console.log(elm);
          elm.style.opacity = module.alphaValue;
        }

        module.startChangeAlpha = function(elm){
            module.changeAlphaItemList.push(setInterval(function(){module.changeElementAlpha(elm);}),2);
        }

        module.stopChangeAlpha = function(){
          for(var i=0;i<module.changeAlphaItemList.length;i++){
            clearInterval(module.changeAlphaItemList[i]);
          }
          clearInterval(module.changeAlphaInterval);
          module.changeAlphaInterval = null;
          module.changeAlphaItemList = [];

        }

        module.changeAlphaControler = function(elms){
          if(module.changeAlphaFlg){
            module.stopChangeAlpha();
            module.changeAlphaFlg = false;
          }else{
            for(var i=0; i< elms.length;i++){
              module.startChangeAlpha(elms[i]);
            }
            module.changeAlphaInterval = setInterval(function(){module.changeAlpha();},2);
            module.changeAlphaFlg = true;
          }
        }

              module.scale = 1.0;
        module.scaleRate = 1.0;
        module.sc = 0.0;
        module.changeScaleItemList = [];
        module.changeScaleInterval = null;
        module.changeScaleFlg = false;

        module.changeScaleExpansion = function(){
          module.scale = module.scale + module.scaleRate;
        }

        module.changeScaleReduction = function(){
          if(module.scale > module.scaleRate){
              module.scale = module.scale - module.scaleRate;    
          }
        }

        module.changeScaleCircleED = function(){
          //0.5 ~ 2.0
          var cCR =  0.5*Math.cos(Math.PI/180 * (module.sc-90));
          if(cCR > 0){
            cCR = cCR * 1;
          }
          module.sc = module.sc + module.scaleRate;
          module.scale = 1+ cCR;
        }

        module.changeItemScale = function(elm){
          console.log(elm);
          //initial:{x,y,width,height}
          if(module.scale < 1.0){
            elm.elm.style.left = String(elm.initial.x + elm.initial.width * (1-module.scale)/2)+"px";
            elm.elm.style.top = String(elm.initial.y + elm.initial.height * (1-module.scale)/2)+"px";
          }else{
            elm.elm.style.left = String(elm.initial.x - elm.initial.width * (module.scale -1)/2)+"px";
            elm.elm.style.top = String(elm.initial.y - elm.initial.height * (module.scale -1)/2)+"px";
          }
          elm.elm.style.width = String(elm.initial.width * module.scale)+"px";
          elm.elm.style.height = String(elm.initial.height * module.scale)+"px";
        }

        module.startAutoChangeScale = function(elm){
          module.changeScaleItemList.push(setInterval(function(){module.changeItemScale(elm)},0));
        }

        module.stopAutoChangeScale = function(){
          for(var i=0;i<module.changeScaleItemList.length;i++){
            clearInterval(module.changeScaleItemList[i]);
          }
          clearInterval(module.changeScaleInterval);
          module.changeScaleInterval=null;
          module.changeScaleItemList = [];
        }

        module.startManualChangeScale = function(elms,flg){
          if(flg){
            module.changeScaleExpansion();
          }else{
            module.changeScaleReduction();
          }
          for(var i=0; i< elms.length;i++){
            module.changeItemScale(elms[i]);
          }
        }

        module.changeScaleControler = function(elms){
           if(module.changeScaleFlg){
            module.stopAutoChangeScale();
            module.changeScaleFlg = false;
          }else{
            for(var i=0; i< elms.length;i++){
              module.startAutoChangeScale({elm:elms[i],initial:{x:parseFloat(elms[i].style.left),y:parseFloat(elms[i].style.top),width:parseFloat(elms[i].width),height:parseFloat(elms[i].height)}});
            }
            module.changeScaleInterval = setInterval(function(){module.changeScaleCircleED();},0);
            module.changeScaleFlg = true;
          }
        }

        module.changeColorInverse = function(elms){
          for(var i=0; i< elms.length;i++){
            var elm = elms[i];
            var canvas = document.createElement('canvas');
            canvas.width = elm.width;
            canvas.height = elm.height;
            var context = canvas.getContext('2d');
            context.drawImage(elm,0,0);
            var imageData = context.getImageData(0,0,canvas.width,canvas.height);
            var data = imageData.data;
            for(var j= 0; j<data.length;j=j+4){
                data[j] = 255-data[j];
                data[j+1] = 255-data[j+1];
                data[j+2] = 255-data[j+2];
                data[j+3] = data[j+3];
            }
            imageData.data= data;
            context.putImageData(imageData, 0, 0);
            elm.src = canvas.toDataURL("image/png");
          }
        }

        return module;
    })();

 
         var edgeDetector = (function(){

    var module = {};

    module.sobelFilterH = new Array(
        1,0,-1,
        2,0,-2,
        1,0,-1
        );

    module.sobelFilterV = new Array(
        1,2,1,
        0,0,0,
        -1,-2,-1
        );

    module.laplacian4Filter = new Array(
         0, 1, 0,
         1, -4, 1,
         0, 1, 0
        );

    module.laplacian8Filter = new Array(
         1, 1, 1,
         1, -8, 1,
         1, 1, 1
        );

    module.effectGrayScale = function(canvas){
        var context = canvas.getContext('2d');
         var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
            data = imageData.data;
            //TODO 3¥Õ¥ì©`¥à¤ÎÆ½¾ù¤ò¤È¤ë->module.getAverageColor(imageData);
            imageData.data = module.grayScaleFilter(data);
        context.putImageData(imageData, 0, 0);

    }

    module.grayScaleFilter = function(imageData){
        for(var i=0; i<imageData.length;i=i+4){
            var ys = module.grayScale(imageData[i],imageData[i+1],imageData[i+2]);
            imageData[i] = ys;
            imageData[i+1] = ys;
            imageData[i+2] = ys;
        }

        return imageData;
    }

    module.grayScale = function(r,g,b){
        return r*0.298912 + g*0.586611 + b * 0.114478;
    }


    module.edgeDetector = function(canvas){
        var _canvasW = canvas.width;
        var _canvasH = canvas.height;
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var grayScaleData = new Array(_canvasH*_canvasW);

        for(var i=0;i<data.length;i=i+4){
            grayScaleData[i/4] = module.grayScale(data[i],data[i+1],data[i+2]);
        }

        var resultImage = module.spatialFilter(grayScaleData,_canvasH,_canvasW,module.laplacian8Filter,3);

        for(var i=0;i<data.length;i++){
            data[i*4] = resultImage[i];
            data[i*4+1] = resultImage[i];
            data[i*4+2] = resultImage[i];
        }
        imageData.data = data;
        context.putImageData(imageData, 0, 0);
    }

    module.spatialFilter = function(grayImage,height,width,filter,size_f){
        var init = Math.floor(size_f/2);
        var from = -init;
        var to = init;

        var resultImage = new Array(height*width);
        for(var k= 0;k<resultImage.length;k++){
            resultImage[k]=0;
        }

        for  (var i = init; i < height - init; i++) {
            for (var j = init; j < width - init; j++) {
              var sum = 0.0;
              /* ¥Õ¥£¥ë¥¿¥ê¥ó¥° */
              for (var n = from; n <= to; n++) {
                for (var m = from; m <= to; m++) {
                  sum += grayImage[(i + n) * width + j + m] *
                    filter[(n + init) * size_f + m + init];
                }
              }
              var ac = Math.floor(Math.abs(sum));
              if(ac < 50){
                resultImage[i*width + j] = 0;
              }else{

                resultImage[i*width + j] = 1;
              }
              //resultImage[i * width + j] = Math.floor(Math.abs(sum));
            }
          }
        return resultImage;
    }

    module.getEdgeMap = function(canvas){
      var _canvasW = canvas.width;
      var _canvasH = canvas.height;
      var context = canvas.getContext('2d');
      var imageData = context.getImageData(0,0,canvas.width,canvas.height);
      var data = imageData.data;
      var grayScaleData = new Array(_canvasH*_canvasW);

      for(var i=0;i<data.length;i=i+4){
          grayScaleData[i/4] = module.grayScale(data[i],data[i+1],data[i+2]);
      }

      var resultImage = module.spatialFilter(grayScaleData,_canvasH,_canvasW,module.laplacian8Filter,3);

      return resultImage;
    }

    module.getInitialEdgeMap = function(sWidth,sHeight){
      var initialEdgeMap = new Array(sWidth*sHeight);
      for(var i=0;i<sWidth*sHeight;i=i++){
          initialEdgeMap[i] = 0;
      }

      return initialEdgeMap;

    }

    module.getEdgeCount = function(EdgeMap){
        var count = 0;
        for(var i=0; i< EdgeMap.length; i++){
          if(EdgeMap[i] == 1){
            count++;
          }
        }
        return count;
    }

    module.getEdgeCountWithCanvas = function(canvas){
      var count = 0;
      var edgeMap = module.getEdgeMap(canvas);
      for(var i=0; i<edgeMap.length; i++){
        if(edgeMap[i] > 50){
          count++;
        }
      }
      console.log("3 at getEdgeCountWithCanvas");
      console.log(count);
      return count;
    }

    module.makeEdgeMap = function(edgeMapArr){
      var targetCanvas = document.createElement('canvas');
      targetCanvas.width = screen.width;
      targetCanvas.height = screen.height;
      var context = targetCanvas.getContext('2d');
      context.fillRect(0,0,screen.width,screen.height);
      async.forEachSeries(edgeMapArr, function(value, callback) {
        //
        context.drawImage(value.map,value.left,value.top,value.width,value.height);
        callback();

      }, function() {
        //
        module.edgeDetector(targetCanvas);

      });
      return targetCanvas;
    }

    module.recommendPositionWithpositionCandidateListandEdgeImage = function(currentEdgeMapCanvas,referenceWindowEdgeMapCanvas,positionCandidateList,cb){
    //var currentImageData = currentEdgeMapCanvas.getImageData(0,0,currentEdgeMapCanvas.width,currentEdgeMapCanvas.height);
      console.log('1 start recommendPositionWithpositionCandidateListandEdgeImage');
      async.map(positionCandidateList,function(value,callback){
          //  console.log(value);
          console.log('2 map edgeCalculate');
          value.edgeCount = module.getEdgeCountWithPositionCandidate(currentEdgeMapCanvas,referenceWindowEdgeMapCanvas,value);
          //TODO
          console.log('6 edgeCount calculate');
          console.log(value.edgeCount);
          callback(null,value);
      },function(err,resultsCount){
        //sort
          async.sortBy(resultsCount, function(item, done){
               //console.log(item);
              done(null, item.edgeCount*-1);
          }, function(err,results){
              if (err){
                 console.error(err);
              }else{
                console.log('7 edgeCount result');
               console.log(results);
                cb(results);

              // var recommendPosition = results[0];
              // var resultCanvas = document.createElement('canvas');
              // resultCanvas.width = screen.width;
              // resultCanvas.height = screen.height;
              // var resultContext = resultCanvas.getContext('2d');
              // resultContext.drawImage(currentEdgeMapCanvas,0,0,currentEdgeMapCanvas.width,currentEdgeMapCanvas.height);
              // resultContext.drawImage(activeWindowCanvas.map,activeWindowCanvas.left,activeWindowCanvas.top,activeWindowCanvas.width,activeWindowCanvas.height);
              // console.log('edgeCount');
              // console.log(recommendPosition.edgeCount);

              // resultContext.drawImage(referenceWindowEdgeMapCanvas,recommendPosition.left,recommendPosition.top,referenceWindowEdgeMapCanvas.width,referenceWindowEdgeMapCanvas.height);
              //  edgeDetector.edgeDetector(resultCanvas);
              // document.body.appendChild(resultCanvas);
              }

          });



      });


      return positionCandidateList;
    }

    module.getEdgeCountWithPositionCandidate = function(currentEdgeMapCanvas,referenceWindowEdgeMap,positionCandidate){
      var targetCanvas = document.createElement('canvas');
      targetCanvas.width = screen.width;
      targetCanvas.height = screen.height;
      var targetContext = targetCanvas.getContext('2d');
      targetContext.drawImage(currentEdgeMapCanvas,0,0);
      var count = 3;
      var caImage = new Image();
      caImage.onload = function(evt){
          targetContext.drawImage(caImage,positionCandidate.left,positionCandidate.top);
            count = module.getEdgeCountWithCanvas(targetCanvas);

          console.log('4 at getEdgeCountWithPositionCandidate');
          console.log(positionCandidate);
          console.log(count);
            console.log('5 return getEdgeCountWithPositionCandidate');
            caImage.onload = function(){};
            return count;
      }
      caImage.src= referenceWindowEdgeMap.data;
      
      //TODO イベント強制発火 -> 不安定
      return caImage.onload();
      }


    module.setRecommendPosition = function(currentEdgeMap,activeWindow,referenceWindow,cb){
         //var activeWindow = imageStack[imageStack.length-1];
          var candidatePositionList = new Array();

          console.log("active and reference window");
          console.log(activeWindow);
          console.log(referenceWindow);
          var candidatePosition1 = {
              left: activeWindow.left+activeWindow.width,
              top: activeWindow.top,
              width:referenceWindow.width,
              height:referenceWindow.height,
              edgeCount:0,
              number:1
          }

          var candidatePosition2 = {
            left: activeWindow.left+activeWindow.width,
            top: activeWindow.top+activeWindow.height-referenceWindow.height,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:2
          }
          var candidatePosition3 = {
            left:activeWindow.left+activeWindow.width-referenceWindow.width,
            top:activeWindow.top+activeWindow.height,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:3
          }
          var candidatePosition4 = {
            left:activeWindow.left,
            top:activeWindow.top+activeWindow.height,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:4
          }
          var candidatePosition5 = {
            left:activeWindow.left-referenceWindow.width,
            top:activeWindow.top+activeWindow.height-referenceWindow.height,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:5
          }
          var candidatePosition6 = {
            left:activeWindow.left-referenceWindow.width,
            top:activeWindow.top,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:6
          }
          var candidatePosition7 = {
            left:activeWindow.left,
            top:activeWindow.top-referenceWindow.height,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:7
          }
          var candidatePosition8 = {
            left:activeWindow.left+activeWindow.width-referenceWindow.width,
            top:activeWindow.top-referenceWindow.height,
              width:referenceWindow.width,
              height:referenceWindow.height,
            edgeCount:0,
            number:8
          }

          candidatePositionList.push(candidatePosition1);
          candidatePositionList.push(candidatePosition2);
          candidatePositionList.push(candidatePosition3);
          candidatePositionList.push(candidatePosition4);
          candidatePositionList.push(candidatePosition5);
          candidatePositionList.push(candidatePosition6);
          candidatePositionList.push(candidatePosition7);
          candidatePositionList.push(candidatePosition8);
          // currentEdgeMapCanvas,referenceWindowEdgeMapCanvas,positionCandidateList
       
          // 
          var recommentList = edgeDetector.recommendPositionWithpositionCandidateListandEdgeImage(currentEdgeMap,referenceWindow,candidatePositionList,cb);


    }

    module.getTranscarentImageUrl = function(image,width,height){
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.drawImage(image,0,0);
        //console.log(canvas.width);
        var imageData = context.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        for(var i =0; i< data.length;i = i+4){
            data[i+3] = data[i+3] / 2; 
        }
        //console.log(data.length/4);
        imageData.data = data;
        context.putImageData(imageData, 0, 0);
        var dataurl = canvas.toDataURL("image/png");

        return dataurl;
    }

    return module;
})();

    function setScreenEdgeMap(){
        swb.transmitRequest({
            S: '.',
            D: '..',
            C: 'screenshot',
            P: {
                value: {
                    left: 0,
                    top: 0,
                    width: screen.width,
                    height: screen.height,
                    type: 'image/png'
                }
            }
        }, function (requet, response) {
            var dataurl = response.P.value.data;
            var mapImage = new Image();
            mapImage.onload = function(){
                var mapCanvas = document.createElement('canvas');
                mapCanvas.width = screen.width;
                mapCanvas.height = screen.height;
                var mapContext = mapCanvas.getContext('2d');
                mapContext.drawImage(mapImage,0,0,mapCanvas.width,mapCanvas.height);
                screenEdgeMap = edgeDetector.getEdgeMap(mapCanvas);
                var nTester = new Array(2000);
                for(var i=0; i<2000;i++){
                    nTester[i] = screenEdgeMap[i+200000];
                }
                telepath.send({to:'testLayer',body:{
                    act:'consoleA',data:nTester
                }},function(req,res){});

                }
            mapImage.src = dataurl;
        });
    }

    
    function upsertSemiAutoClipping(thumbnail){
        //thumbnail:{id,img,width,height}
        var addImage = new Image();
        addImage.width = thumbnail.width;
        addImage.height = thumbnail.height;
        addImage.id = thumbnail.id;
        addImage.style.opacity = 0.5;
        addImage.style.position = 'absolute';
        addImage.className = 'autoClipping';
        addImage.onload = function(){
            var exClip = document.getElementsByClassName('autoClipping');
            
            if(exClip.length > 0){
                var aClip = exClip[0];
                addImage.style.left = aClip.style.left;
                addImage.style.top = aClip.style.top;
                $('#'+aClip.id).remove();
                var addCanvas = document.createElement('canvas');
                addCanvas.width = addImage.width;
                addCanvas.height = addImage.height;
                var addContext = addCanvas.getContext('2d');
                addContext.drawImage(addImage,0,0,thumbnail.width,thumbnail.height);
                imageEdgeMap = edgeDetector.getEdgeMap(addCanvas);
                document.getElementById('item_board').appendChild(addImage);
                //TODO 自動移動メソッドをsetIntervalでセットする
               clearInterval(moveInterval);
                moveInterval = null;
               moveInterval =  setInterval(function(){calculate8Direction()},1000);
            }else{
                setScreenEdgeMap();

                addImage.style.left = String(Math.random()*(screen.width-addImage.width))+"px";
                addImage.style.top = String(Math.random()*(screen.height-addImage.height))+"px";
                //addImage.style.left = "400px";
                //addImage.style.top = "300px";
                var addCanvas = document.createElement('canvas');
                addCanvas.width = addImage.width;
                addCanvas.height = addImage.height;
                var addContext = addCanvas.getContext('2d');
                addContext.drawImage(addImage,0,0,thumbnail.width,thumbnail.height);
                imageEdgeMap = edgeDetector.getEdgeMap(addCanvas);
                telepath.send({to:'testLayer',body:{act:'consoleA',data:{edge:imageEdgeMap,width:addImage.width,left:addImage.style.left,img:thumbnail.img}}});

                document.getElementById('item_board').appendChild(addImage);
                //TODO 自動移動メソッドをsetIntervalでセットする
                clearInterval(moveInterval);
                moveInterval = null;
               moveInterval = setInterval(function(){
                  telepath.send({to:'testLayer',body:{act:'consoleA',data:"go"}},function(){
                        calculate8Direction()
                  });},1000);  
            }
        }
        addImage.src = thumbnail.img;
    }

    function stopSemiAutoClipping(){
        clearInterval(moveInterval);
        moveInterval = null;
        $('.autoClipping').remove();

    }

    function calculate8Direction(){
        //差が最大
        var AC = Math.floor(Math.random()*50);
        var targetImage = document.getElementsByClassName('autoClipping')[0];
        telepath.send({to:'testLayer',body:{act:'consoleA',data:targetImage.style.left}});

        var directions = new Array();
        var direction1 = {
            left:parseInt(targetImage.style.left)+AC,
            top:parseInt(targetImage.style.top),
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction2 = {
            left:parseInt(targetImage.style.left)-AC,
            top:parseInt(targetImage.style.top),
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction3 = {
            left:parseInt(targetImage.style.left),
            top:parseInt(targetImage.style.top)+AC,
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction4 = {
            left:parseInt(targetImage.style.left),
            top:parseInt(targetImage.style.top)-AC,
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction5 = {
            left:parseInt(targetImage.style.left)+AC,
            top:parseInt(targetImage.style.top)+AC,
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction6 = {
            left:parseInt(targetImage.style.left)+AC,
            top:parseInt(targetImage.style.top)-AC,
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction7 = {
            left:parseInt(targetImage.style.left)-AC,
            top:parseInt(targetImage.style.top)+AC,
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        var direction8 = {
            left:parseInt(targetImage.style.left)-AC,
            top:parseInt(targetImage.style.top)-AC,
            width:parseInt(targetImage.width),
            height:parseInt(targetImage.height)
        };
        telepath.send({to:'testLayer',body:{act:'consoleA',data:direction1}});
        directions.push(direction1);
        directions.push(direction2);
        directions.push(direction3);
        directions.push(direction4);
        directions.push(direction5);
        directions.push(direction6);
        directions.push(direction7);
        directions.push(direction8);


        async.map(directions,function(value,next){
            var score = calculateSumAbsSub(value); 
            value.score = score;
            next(null,value);

        },function(err,resultList){
            if(err){
                console.error(err);
            }else{
                async.sortBy(resultList, function(item, done){
               //console.log(item);
                  done(null, item.score*1);
                }, function(err,results){
                  if (err){
                     console.error(err);
                  }else{
                    console.log(results);
                     
                    // telepath.send({to:'testLayer',body:{act:'consoleA',data:results}});
                    //移動処理
                    // if(currentScore >= results[0].score){
                    //     clearInterval(moveInterval);
                    //     moveInterval = null;
                    // }else{
                    targetImage.style.left = String(results[0].left) + "px";
                    targetImage.style.top = String(results[0].top) + "px";
                    currentScore = results[0].score;
                    //}
                    //console.error(currentScore);
                }

                });

            }
        });

    }

    function calculateSumAbsSub(direction){
        var fromX = direction.left;
        var lengthX = direction.width;
        var fromY = direction.top;
        var lengthY = direction.height;

        if(fromX<0){
            return 0;
        }
        if(fromX + lengthX > screen.width){
            return 0;
        }
        if(fromY < 0){
            return 0;
        }
        if(fromY + lengthY > screen.height){
            return 0;
        }

        var score = 0;
        for(var i = fromY; i<fromY+lengthY;i++){
            for(var j = fromX; j< fromX+lengthX; j++){
                //screenEdgeMap
                //imageEdgeMap
                score = score + Math.abs(screenEdgeMap[screen.width*i + j]-imageEdgeMap[(i-fromY)*(lengthX) + j-fromX]);
                if(i==fromY+lengthY-1 && j==fromX+lengthX-1){
               // telepath.send({to:'testLayer',body:{act:'consoleA',data:'0000000'}});

               // telepath.send({to:'testLayer',body:{act:'consoleA',data:{imageX:(i-fromY)*(lengthX)+j-fromX,name:'0000000',imageE:imageEdgeMap.length,screenE:screenEdgeMap.length,x:lengthX}}});
                }
            }
        }

        return score;

    }




});