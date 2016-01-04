/**
 * Created by kyoshida on 15/05/01.
 */

$(function(){

    var screenHeight = screen.height;
    var screenWidth = screen.width;
    var browserURL = "http://localhost:50000/search";
    var web_setting_layer = 'http://localhost:50000/ui/browse/';
    var userSessionKey = 'mySession';

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
    var layer_id;
    var home_id;
    var manageLayer_id;
    var layers={browser:[],favorite:null,board:null,thumbnails:null};

    var method_mode = 0;

    // var socket = new io.connect("http://localhost:50000");
    //   socket.on('connect', function(){});
    //   socket.on('event', function(data){});
    //   socket.on('disconnect', function(){});

    /*
    ¥¯¥ê¥Ã¥¯¥ê¥¹¥Ê©`
     */
     $('#switch_search').click(function (e) {
        //window.location.href = "./search";

        //changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});
        setLayerId(function (id) {
            swb.transmitRequest({
                S: swb.currentPath,
                D: '../../../',
                C: 'add-layer',
                P: {
                    value: {
                        id: id,
                        name: id,
                        shared: false,
                        browser: {
                            level:20,ignoresMouseEvents: false,
                            //url:"http://www.google.co.jp"
                            url: "http://133.68.112.180:50000/ui/search"
                        },
                        setting: {
                            level:20,
                            url: web_setting_layer
                        },
                        movable: {
                            level:20,
                            frame: {
                                origin: {
                                    x: screen.width / 2 + 15,
                                    y: screen.height / 10
                                },
                                size: {
                                    width: screen.width * 2 / 5,
                                    height: screen.height * 4 / 5
                                }
                            }
                        },
                        preview: {
                            level:20,
                            url: ''
                        }
                    }
                }
            }, function (req, res) {
                layers.browser.push(id);
            });
        });

    });

    $('#switch_favorite').click(function (e) {
        telepath.send({to: 'favorite', body: {act: 'call'}}, function (req, res) {

        });
        //changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});


    });
    $('#switch_history').click(function (e) {
        //window.location.href = "./history/history";

        //changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});


    });
    $('#switch_screenshot').click(function (e) {
        // swb.transmitRequest({
        //     S: swb.currentPath,
        //     D: '../',
        //     C: 'screenshot',
        //     P: {
        //         value: {
        //             left: 0,
        //             top: 0,
        //             width: screenWidth,
        //             height: 25,
        //             type: 'image/png'
        //         }
        //     }
        // }, function (req, res) {
        //     var imgUrl = res.P.value.data;

        //     var image = new Image();
        //     image.onload = function () {
        //         image.resize
        //         var str = OCRAD(image);
        //         console.log('result ocr');
        //         console.log(str);
        //     }
        //     image.src = imgUrl;
        // });
        // 
        
        //TODOÒÆ„Ó¤·¤Æ
    });

    $('#switch_relation').click(function (e) {

        telepath.get({key: userSessionKey}, function (req, res) {
            var relations = res.value;
            var htmlsrc = '';
            htmlsrc += '<div id="relations>';

            htmlsrc += "</div>";


        });


        $('#relation_box').hover(function () {
        }, function () {

        });
    });

    $('#switch_rotateThumbnail').click(function(e){
        telepath.send({to:'thumbnailsLayer',body:{act:'rotateThumbnail'}},function(req,res){

        });
    });

    $('#switch_changeAlphaThumbnail').click(function(e){
        telepath.send({to:'thumbnailsLayer',body:{act:'changeAlphaThumbnail'}},function(req,res){
            
        });
    });

    $('#switch_deleteThumbnail').click(function(e){
        telepath.send({to:'thumbnailsLayer',body:{act:'deleteItems'}},function(req,res){
            
        });
    });
    
    $('#switch_backStateThumbnail').click(function(e){
//        telepath.send({to:'thumbnailsLayer',body:{act:'backState'}},function(req,res){
            telepath.send({to:'boardLayer',body:{act:'showClippingOnFoot'}},function(req,res){
            
        });
    });

    $('#switch_changeScaleThumbnail').click(function(e){
        telepath.send({to:'thumbnailsLayer',body:{act:'scaleChange'}},function(req,res){
            
        }); 
    });


    $('#switch_changeUseMethod').click(function(e){
        telepath.send({to:'thumbnailsLayer',body:{act:'changeScale'}},function(req,res){
         changeMethodMode(changeMethodModeIcon);
        }); 
    });


     swb.initialize(function () {
            swb.transmitRequest({
                S: '.',
                D: '..',
                C: 'set-properties',
                P: {
                    value: {
                        browser: {
                            alphaValue: 0.0
                        },
                        movable: {
                            alphaValue: 0.0,
                            ignoresMouseEvents: true,
                            movableByWindowBackground: false,
                            backgroundColor: {
                                r: 0.00,
                                g: 0.00,
                                b: 0.00,
                                a: 0.01
                            },
                            hasShadow: true,
                            frame: {
                                origin: {
                                    x: 0,
                                    y: 0
                                }, size: {
                                    width: screenWidth,
                                    height: screenHeight
                                }
                            }
                        },

                    }
                }
            }, function () {
                swb.level(20, function () {
                    swb.transmitRequest({
                        S: swb.currentPath,
                        D: '../',
                        C: 'get-all-properties',
                        P: {}
                    }, function (req, res) {

                        /*
                         Telepathy¥µ©`¥Ð
                         */

                        telepath.on('connect', function (event) {
                            //manageLayer_id = res.P.value.id;
                            manageLayer_id = 'manageLayer';
                            telepath.hello({from: manageLayer_id}, function (req, res) {
                                if (res.status == 200) {
                                    setLayerId(function(id){
                                     telepath.set({key: 'manageLayer', value: manageLayer_id},function(req,res){
                                        layers.favorite = id;
                                        //  swb.transmitRequest({
                                        //     S: '.',
                                        //     D: '../../../',
                                        //     C: 'add-layer',
                                        //     P: {
                                        //         value: {
                                        //             id: id,
                                        //             name: id,
                                        //             shared: false,
                                        //             movable: {
                                        //                 frame: {
                                        //                     origin: {
                                        //                         x: 0,
                                        //                         y: 0
                                        //                     },
                                        //                     size: {
                                        //                         width: screen.width,
                                        //                         height: screen.height
                                        //                     }
                                        //                 }
                                        //             },
                                        //             setting: {
                                        //                 url: 'http://localhost:50000/ui/favorite/'
                                        //             },
                                        //             preview: {
                                        //                 url: ''
                                        //             },
                                        //             browser: {
                                        //                 url: ''
                                        //             }
                                        //         }
                                        //     }
                                        // }, function () {
                                        setLayerId(function(id){
                                            layers.board = id;
                                            telepath.set({key: 'boardLayer', value: layers.board},function(req,res){
                                            swb.transmitRequest({
                                                    S: swb.currentPath,
                                                    D: '../../../',
                                                    C: 'add-layer',
                                                    P: {
                                                        value: {
                                                            id: id,
                                                            name: id,
                                                            shared: false,
                                                            browser: {
                                                                level:20,
                                                                url:''
                                                            },
                                                            setting: {
                                                                level:20,
                                                                url: 'http://localhost:50000/ui/board/'
                                                            },
                                                            movable: {
                                                                level:20,
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
                                                            preview: {
                                                                level:20,
                                                                url: ''
                                                            }
                                                        }
                                                    }
                                                }, function (req, res) {
                                                    setLayerId(function(id){
                                                        layers.thumbnails = id;
                                                        telepath.set({key: 'thumbnailsLayer', value: layers.thumbnails},function(req,res){
                                                        swb.transmitRequest({
                                                                S: swb.currentPath,
                                                                D: '../../../',
                                                                C: 'add-layer',
                                                                P: {
                                                                    value: {
                                                                        id: id,
                                                                        name: id,
                                                                        shared: false,
                                                                        browser: {
                                                                            level:30,
                                                                            url:''
                                                                        },
                                                                        setting: {
                                                                            level:30,
                                                                            url: 'http://localhost:50000/ui/thumbnails/'
                                                                        },
                                                                        movable: {
                                                                            level:30,
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
                                                                        preview: {
                                                                            level:30,
                                                                            url: ''
                                                                        }
                                                                    }
                                                                }
                                                            }, function (req, res) {
                                                                    setLayerId(function(id){
                                                                        layers.screenshot = id;
                                                                        telepath.set({key: 'screenshotLayer', value: layers.screenshot},function(req,res){
                                                                        swb.transmitRequest({
                                                                                S: swb.currentPath,
                                                                                D: '../../../',
                                                                                C: 'add-layer',
                                                                                P: {
                                                                                   value: {
                                                                                       id: id,
                                                                                       name: id,
                                                                                       shared: false,
                                                                                       movable: {
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
                                                                                       setting: {
                                                                                           url: ''
                                                                                       },
                                                                                       preview: {
                                                                                           url: ''
                                                                                       },
                                                                                       browser: {
                                                                                           url: 'http://localhost:50000/ui/screenshot/'
                                                                                       }
                                                                                   }
                                                                                }
                                                                            }, function (req, res) {

                                                                            });
                                                                         });
                                                                        });
                                                            });
                                                         });
                                                        });
                                                });
                                                });
                                            });

                                     //   });

                                     });
                                    });
                                    // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));
                                    /* telepath.get({key:userSessionKey},function(req,res){
                                     console.log(res);
                                     });*/
                                    //$('#myID').text(layer_id);
                                    //$('#myID').text('homei1q64mmwe');

                                    //setTabs();
                                }
                            });
                        });

                        telepath.on('message', function (message) {/*
                         if (msg.method == 'NOTIFY' && msg.key == myPreviewID) {
                         //¥Ç©`¥¿‰ä¸ü•r¤ËÎÄ×Ö¤ò¥Ñ©`¥¹¤·¤ÆHTML¤Ë·´Ó³¤µ¤»¤ë
                         }*/
                            if(message.body.act == 'commandSemiColon'){

                            }

                            if(message.body.act == 'commandPeriod'){

                            }

                            if (message.body.act == 'thumbnail') {
                                console.log(message);
                                $('#tab' + String(message.body.number)).attr('src', message.body.img);
                                $('#tab' + String(message.body.number)).css('opacity', 0.75);
                                if (message.body.left != null && message.body.left != undefined) {
                                    $('#tab' + String(message.body.number)).css('left', message.body.left);
                                    $('#tab' + String(message.body.number)).css('top', message.body.top);

                                }
                            }

                            if (message.body.act == 'reset-thumbnail') {
                               // setTabs();
                            }

                            if(message.body.act == 'make_thumbnail'){

                                var aphtml = '<img id="tab' + message.body.id +
                                    '" ' +
                                        //'class="btn btn-material-pink btn-fab btn-raised mdi-action-schedule"' +
                                    ' style="position:absolute;cursor:pointer; margin:0px;'+
                                    'left:'+String(message.body.left)+'px;top:' +
                                    String(message.body.top) +
                                    'px;"' +
                                    'width="45" height="60" src="'+message.body.img+'""></img>';
                                $('#tab_army').append(aphtml);
                                //  telepath.send({to: value, body: {act: 'capture'}}, function (req, res) {


                            
                                    $('#tab' + String(message.body.id)).dblclick(function () {
                                        //ŒgÌå»¯
                                       // console.log(value);
                                        telepath.send({to: message.body.id, body: {act: 'set-visible'}}, function (req, res) {
                                            $('#tab' + String(message.body.id)).remove();
                                        });
                                    });
                                    $('#tab' + String(message.body.id)).hover(function () {
                                        //°ëŒgÌå»¯
                                        telepath.send({to: message.body.id, body: {act: 'set-hover'}}, function (req, res) {

                                        });
                                    }, function () {
                                        telepath.send({to: message.body.id, body: {act: 'set-unhover'}}, function (req, res) {

                                        });
                                    });

                                    $('#tab' + String(message.body.id)).draggable({
                                        stop: function () {
                                            telepath.send({
                                                to: message.body.id,
                                                body: {
                                                    act: 'set-tab-position',
                                                    top: $('#tab' + String(message.body.id)).offset().top,
                                                    left: $('#tab' + String(message.body.id)).offset().left
                                                }
                                            }, function (req, res) {
                                                console.log($('#tab' + String(message.body.id)).offset().top);
                                            });
                                        }
                                    });
                                    //        });

                            }

                            if (message.body.act == 'createWindow') {
                                setLayerId(function (id) {
                                    swb.transmitRequest({
                                        S: swb.currentPath,
                                        D: '../../../',
                                        C: 'add-layer',
                                        P: {
                                            value: {
                                                id: id,
                                                name: id,
                                                shared: false,
                                                browser: {
                                                    url: message.body.url
                                                },
                                                setting: {
                                                    url: web_setting_layer
                                                },
                                                movable: {
                                                    frame: {
                                                        origin: {
                                                            x: screen.width / 2 + 15,
                                                            y: screen.height / 10
                                                        },
                                                        size: {
                                                            width: screen.width * 2 / 5,
                                                            height: screen.height * 4 / 5
                                                        }
                                                    }
                                                },
                                                preview: {
                                                    url: ''
                                                }
                                            }
                                        }
                                    }, function (req, res) {

                                    });
                                });
                            }

                            if(message.body.act == 'deleteTab'){
                                $('#tab' + String(message.body.id)).remove();
                            }


                            if(message.body.act == 'changeMethodMode'){
                                changeMethodMode(changeMethodModeIcon);
                            }

                            if(message.body.act == 'semiAutoWindowPositioner'){
                              //  console.error(message.body.positions);
                              telepath.send({to:'testLayer',body:{act:'showWindows',data:message.body.positions}},function(req,res){
                                 swb.transmitRequest({
                                        S: swb.currentPath,
                                        D: '/root/private/'+layers.browser[layers.browser.length-1],
                                        C: 'get-all-properties',
                                        P: {}
                                    }, function (req, res) {
                                            swb.transmitRequest({
                                                S: '.',
                                                D: '..',
                                                C: 'screenshot',
                                                P: {
                                                    value: {
                                                        left: res.P.value.movable.frame.origin.x,
                                                        top: res.P.value.movable.frame.origin.y,
                                                        width: res.P.value.movable.frame.size.width,
                                                        height: res.P.value.movable.frame.size.height,
                                                        type: 'image/png'
                                                    }
                                                }
                                            }, function (requet, response) {
                                                var dataurl = response.P.value.data;
                                                //imageurl
                                                var imageR = new Image();

                                                     imageR.onload = function(){
                                                     //currentEdgeMap¤òÈ¡µÃ
                                                    //ActiveWindow¤Î·ù¤Ê¤É¤òÈ¡µÃ
                                                    //referenceWindow¤òÈ¡µÃ
                                                    //edgeDetector.recommendPositionWithpositionCandidateListandEdgeImage(currentEdgeMap,referenceWindow,activeWindow,candidatePositionList);
                                                   imageR.style.left = String(res.P.value.browser.frame.origin.x) + "px";
                                                    imageR.style.top = String(res.P.value.browser.frame.origin.y) + "px";
                                                    imageR.width = String(res.P.value.browser.frame.size.width) + "px";
                                                    imageR.height = String(res.P.value.browser.frame.size.height) + "px";

                                                    var referenseObj = {
                                                        left:res.P.value.browser.frame.origin.x,
                                                        top:res.P.value.browser.frame.origin.y,
                                                        width:res.P.value.browser.frame.size.width,
                                                        height:res.P.value.browser.frame.size.height,
                                                        //data:dataurl
                                                        data:edgeDetector.getTranscarentImageUrl(imageR,res.P.value.browser.frame.size.width,res.P.value.browser.frame.size.height)
                                                    }
                               swb.transmitRequest({
                                    S: swb.currentPath,
                                    D: '/root/private/'+layers.browser[layers.browser.length-1],
                                    C: 'set-properties',
                                    P: {
                                         value: {
                                        setting: {
                                            alphaValue: 0.0,
                                            level: -20
                                        },
                                        browser: {

                                            alphaValue: 0.0,
                                            level: -20
                                        },
                                        movable: {

                                            alphaValue: 0.0,
                                            level: -20
                                        }
                                    }
                                    }
                                }, function (req, res) {
                                    //callback
                                    //
                                    console.log(res);
                                async.mapSeries(message.body.positions,function(value,next){
                                     swb.transmitRequest({
                                        S: '.',
                                        D: '..',
                                        C: 'screenshot',
                                        P: {
                                            value: {
                                                left: value.windowBounds.X,
                                                top: value.windowBounds.Y,
                                                width: value.windowBounds.Width,
                                                height: value.windowBounds.Height,
                                                type: 'image/png'
                                            }
                                        }
                                    }, function (requet, response) {
                                        var dataurl = response.P.value.data;
                                        //imageurl
                                        var image = new Image();
                              image.onload = function(){
                                           // console.log(canvas.width);
                                          //  console.log(canvas.style.height);
                                        
                                            image.style.left = String(value.windowBounds.X)+"px";
                                            image.style.top = String(value.windowBounds.Y)+"px";
                                            image.width = String(value.windowBounds.Width)+"px";
                                            image.height = String(value.windowBounds.Height)+"px";
                                        var currentObj={
                                            left:value.windowBounds.X,
                                            top:value.windowBounds.Y,
                                            width:value.windowBounds.Width,
                                            height:value.windowBounds.Height,
                                            data:dataurl
                                        }
                                        telepath.send({to:'testLayer',body:{act:'captImage',img:dataurl,width:currentObj.width,height:currentObj.height}},function(req,res){

                                            next(null, currentObj);
                                             
                                        });
                                        }
                                        image.src = dataurl;
                                    });

                                },function(err,resultList){
                                  //  console.log('resultList');
                                   // console.log(resultList);
                                    if(err){
                                        console.error(err);
                                    }
                                    //»­Ïñ„IÀí
                                  
                                                    telepath.send({to:'testLayer',body:{act:'captImage',img:referenseObj.data,width:referenseObj.width,height:referenseObj.height}},function(req,res){


                                                    var activeObj = {
                                                        left:parseInt(resultList[0].left),
                                                        top:parseInt(resultList[0].top),
                                                        width:parseInt(resultList[0].width),
                                                        height:parseInt(resultList[0].height)
                                                    }

                                                    var currentImageCanvas = document.createElement('canvas');
                                                    currentImageCanvas.width = screen.width;
                                                    currentImageCanvas.height = screen.height;
                                                    var currentImageContext = currentImageCanvas.getContext('2d');
                                                    currentImageContext.fillRect(0,0,screen.width,screen.height);
                                                    resultList.reverse();
                                                    async.eachSeries(resultList,function(value,next){
                                                        var cImage = new Image();

                                                        cImage.onload = function(){
                                                            currentImageContext.drawImage(cImage,parseInt(value.left),parseInt(value.top),parseInt(value.width),parseInt(value.height));
                                                             next();
                                                        }
                                                        cImage.src = value.data;
                                                       

                                                    },function(err){
                                                        if(err){
                                                            console.error(error);
                                                        }else{
                                                            //currentImageCanvasOK
                                                            //activeOk
                                                            //referenceOk
                                                            var sendurl = currentImageCanvas.toDataURL('image/png');
                                                            telepath.send({to:'testLayer',body:{
                                                                act:'captImage',img:sendurl,width:screen.width,height:screen.height
                                                            }},function(req,res){

                                                            edgeDetector.setRecommendPosition(currentImageCanvas,activeObj,referenseObj,function(resultRecommendList){
                                                                //recommend
                                                                 console.log('autoset position');
                                                                 console.log(resultRecommendList[0]);
                                                                 var nY = screen.height-resultRecommendList[0].top-resultRecommendList[0].height;
                                                                  telepath.send({to:String(layers.browser[layers.browser.length-1]),body:{act:'setHalfAlpha'}},function(req,res){

                                                                 swb.transmitRequest({
                                                                        S: swb.currentPath,
                                                                        D: '/root/private/'+layers.browser[layers.browser.length-1],
                                                                        C: 'set-properties',
                                                                        P: {
                                                                            value:{
                                                                                movable: {
                                                                                    frame: {
                                                                                        origin: {
                                                                                            x: resultRecommendList[0].left,
                                                                                            y: screen.height-resultRecommendList[0].top-resultRecommendList[0].height
                                                                                        },
                                                                                        size:{
                                                                                            width:resultRecommendList[0].width,
                                                                                            height:resultRecommendList[0].height
                                                                                        }
                                                                                    }
                                                                                },
                                                                                setting:{
                                                                                    frame: {
                                                                                        origin: {
                                                                                            x: resultRecommendList[0].left,
                                                                                            y: screen.height-resultRecommendList[0].top-resultRecommendList[0].height
                                                                                        },
                                                                                        size:{
                                                                                            width:resultRecommendList[0].width,
                                                                                            height:resultRecommendList[0].height
                                                                                        }
                                                                                    }
                                                                                },
                                                                                browser:{
                                                                                    frame: {
                                                                                        origin: {
                                                                                            x: resultRecommendList[0].left,
                                                                                            y: screen.height-resultRecommendList[0].top-resultRecommendList[0].height
                                                                                        },
                                                                                        size:{
                                                                                            width:resultRecommendList[0].width,
                                                                                            height:resultRecommendList[0].height
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }, function (req, res) {
                                                                        //callback
                                                                        //
                                                                        console.log(res);
                                                                });
                                                            });
                                                            });
                                                            });
                                                        }
                                                    });
                                                            });
                                             
                                                 
                                            });
                                    });
   }
                                                imageR.src = dataurl;
                                });
                            
                              });
                                
                                });
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
                         Telepathy¥µ©`¥Ð½KÁË
                         */

                    });
                });
            });

        });


    function setLayerId(callback) {
        swb.transmitRequest({
            S: '.',
            D: '/root/private',
            C: 'get-children',
            P: {}
        }, function (req, res) {
            //console.log(res.P.value);
            //console.log(Object.keys(res.P.value).length);
            var activelayer = res.P.value;
            layer_id = String(Object.keys(res.P.value).length + Math.random().toString(36).slice(-8));
            callback(layer_id);

        });
    }

    function genLayerId(){
        return String(Math.random().toString(36).slice(-8));
    }

    function changeMethodMode(callback){
        method_mode = method_mode + 1;
        if(method_mode > 2){
            method_mode = 0;
        }
        callback();
    }

    function changeMethodModeIcon(){
        var targetIcon = document.getElementById('switch_changeUseMethod');

        switch(method_mode){
            case 0:
                targetIcon.className = "btn btn-warning btn-fab btn-raised mdi-action-settings-backup-restore";
            break;
            case 1:
                targetIcon.className = "btn btn-warning btn-fab btn-raised mdi-action-flip-to-front";
            break;
            case 2:
                targetIcon.className = "btn btn-warning btn-fab btn-raised mdi-content-add-box";
            break;
            default:
                console.error(method_mode);
            break;
        }
    }


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
        for(var i= 0;i<resultImage.length;i++){
            resultImage[i];
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
              resultImage[i * width + j] = Math.floor(Math.abs(sum));
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
      //console.log(edgeMap[0]);
      //console.log(screen.height);
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
          };

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



});