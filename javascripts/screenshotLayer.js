/**
 * Created by kyoshida on 2015/06/08.
 */
$(function () {
    var telepath = new TelepathyClient();
    var telepath_name = 'preview';
    var telepath_url = 'ws://apps.wisdomweb.net:64260/ws/mik';
    var telepath_site = 'kyoshida';
    var telepath_token = 'Pad:5538';
    var reconnectInterval = 5 * 1000;
    var reconnectTimer = null;
    var heartbeatInterval = 20 * 1000;
    var heartbeatTimer = null;
    var heartbeatCounter = 0;

    //console.error('canvaslayer');

    var myId;


    var screenHeight = screen.height;
    var screenWidth = screen.width;

    var canvasContext = {
        canvasType: 1,
        image: '',
        layerID: '',
        position: {x: 0, y: 0, width: screenWidth, height: screenHeight}
    };

    var mouseDownWillShot = true;
    var startDownX;
    var startDownY;
    var endDownX;
    var endDownY;
    var mouseDownFlg = false;


    var thumbnailContext = {
        width:null,
        height:null,
        url:null,
        image:null,
        id:null
    }

    /*
     canvasContext={
     layerID
     canvasContext:{
     images:{type:String,default:''}
     lines:{type:Array}
     }
     }
     */

    $('#screenshoter').attr('width', screenWidth);
    $('#screenshoter').attr('height', screenHeight);

    /*
     swb初期設定
     */
    swb.initialize(function () {

    swb.transmitRequest({
            S: swb.currentPath,
            D: '../',
            C: 'set-properties',
            P: {
                value: {
                    browser: {
                        level:-2147483623,
                        alphaValue: 1.0,
                        ignoresMouseEvents: false,
                        movableByWindowBackground: false,
                        //level: -2147483623
                    },
                    setting: {
                        level: -2147483623,
                        alphaValue:0.0,
                        ignoresMouseEvents:true,
                        movableByWindowBackground:false
                    },
                    movable: {
                        level: -2147483623,
                        frame: {
                            origin: {
                                x: 0,
                                y: 0
                            },
                            size: {
                                width: screen.width,
                                height: screen.height
                            }
                        },
                        alphaValue: 0.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false,
                    },
                    preview:{
                        level:-2147483623,
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
                        //console.error(res);
                        myId=res.P.value.id;

                        /*
                         Telepathyサーバ
                         */


                        telepath.on('connect', function (event) {
                            telepath.hello({from: 'screenshotLayer'}, function (req, res) {
                                if (res.status == 200) {
                                   
                                }
                            });
                        });

                        telepath.on('message', function (message) {

                            if(message.body.act == 'getThumbnail'){
                                fowardLayerLevel(function(req,res){
                                    thumbnailContext.id = genLayerId();    
                                    thumbnailContext.url = message.body.url;
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
                                console.log('on response HELLO')
                                if (res.status != 200) {
                                    close();
                                    return;
                                } else {

                                    //telepath.send({to: myEditID, body: {act: 'getLayersSetting', id: myPreviewShotID}});

                                }
                                //console.log('telepath');
                                //telepath.send({to: myEditID, body: {act: 'made'}});
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

    function appealAnimation() {
       swb.level(31, function (req, res) {
            //$('body').append('<div id="appeal" style="background-color: transparent;width: 100%;height:100%;"></div>');

         //  $('#appeal').remove();

            $('#appeal').animate(
                {'background-color': 'yellow'},{
                    'duration': 500
                }
            ).animate(
                {'background-color': 'transparent'},
                {
                    'duration': 500
                }
            );
                console.log($('#domdom').html());


        });

    };


    $('#screenshoter').mousedown(function (e) {
            console.log('onmousedown');

            startDownX = e.pageX;
            startDownY = e.pageY;
            console.log(String(startDownX) + String(startDownY));
            mouseDownFlg = true;
        
    });

    $('#screenshoter').mousemove(function (e) {
            if (mouseDownFlg) {
                var currentX = e.pageX;
                var currentY = e.pageY;

                var ctx = $('#screenshoter')[0].getContext('2d');
                ctx.strokeStyle = 'rgb(192, 80, 77)';
                ctx.clearRect(0, 0, screenWidth, screenHeight);
                ctx.strokeRect(startDownX, startDownY, currentX - startDownX, currentY - startDownY);
            } else {
            }
        
    });

    $('#screenshoter').mouseup(function (e) {
        if (mouseDownWillShot) {
            endDownX = e.pageX;
            endDownY = e.pageY;
            mouseDownFlg = false;
            var mW = Math.abs(startDownX - endDownX);
            var mH = Math.abs(startDownY - endDownY);
            thumbnailContext.width = mW;
            thumbnailContext.height= mH;

            if(startDownX > endDownX){
                startDownX = endDownX;
            }
            if(startDownY > endDownY){
                startDownY = endDownY;
            }

            var ctx = $('#screenshoter')[0].getContext('2d');
            swb.transmitRequest({
                    S: swb.currentPath,
                    D: '..',
                    C: 'screenshot',
                    P: {
                        value: {
                            left: startDownX,
                            top: startDownY,
                            width: mW,
                            height: mH,
                            type: 'image/png'
                        }
                    }
                },
                function (request, response) {
                    console.log('screenshot result');
                    console.log(response);

                        var dataurl = response.P.value.data;
                        
                        thumbnailContext.img = dataurl;
                        backLayerLevel(function(req,res){
                            telepath.send({
                                to: 'boardLayer',
                                body: {act: 'addThumbnail', thumbnail:thumbnailContext}
                            }, function (req, res) {
                                ctx.clearRect(0, 0, screenWidth, screenHeight);
                            });
                        });
                    });

        }

    });

    function backLayerLevel(callback) {

        swb.transmitRequest({
            S: swb.currentPath,
            D: '../',
            C: 'set-properties',
            P: {
                value: {
                    browser: {

                        level: -2147483623
                    },
                    setting: {

                        level: -2147483623
                    },
                    movable: {
                        level: -2147483623
                    }
                }
            }
        }, function (req, res) {
            callback(req,res);
        });

    }

    function fowardLayerLevel(callback) {
        swb.transmitRequest({
            S: swb.currentPath,
            D: '../',
            C: 'set-properties',
            P: {
                value: {
                    browser: {
                        level: 30
                    },
                    setting: {

                        level: 30
                    },
                    movable: {
                        level: 30
                    }
                }
            }
        }, function (req, res) {
            
            callback(req,res);
        });

    }


    function genLayerId(){
        return String(Math.random().toString(36).slice(-8));
    }
    

})
;