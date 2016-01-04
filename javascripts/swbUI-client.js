/**
 * Created by kyoshida on 15/05/01.
 */

$(function () {

    var screenHeight = screen.height;
    var screenWidth = screen.width;
    var browserURL = "http://localhost:50000/search";
    var web_setting_layer = 'http://localhost:50000/setting';
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

    console.log(screenHeight);

    /*swb.position({left: screenWidth - 80, top: -30, width: 100, height: 100}, function (req, res) {
     /!*
     $.get("http://localhost:50000/ui/e",
     {
     width: screenWidth,
     height: screenHeight
     }
     );*!/
     swb.level(20, function (req, res) {

     });

     });*/
    /*swb.level(-20,function(reqe,rese){

     });*/

    $(window).keydown(function (e) {
        console.log('keydown!!');
        console.log(e.keyCode);
        if (e.keyCode == 13) {

            window.location.href = "./search";
            // changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});
        }
        return false;


    });
    $('#switch_search').click(function (e) {
        window.location.href = "./search";

        //changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});


    });

    $('#switch_favorite').click(function (e) {
        telepath.send({to: 'favorite', body: {act: 'call'}}, function (req, res) {

        });
        //changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});


    });
    $('#switch_history').click(function (e) {
        window.location.href = "./history/history";

        //changeMode2Search({x:0,y:0,width:screenWidth,height:screenHeight});


    });
    $('#switch_screenshot').click(function (e) {
        swb.transmitRequest({
            S: swb.currentPath,
            D: '../',
            C: 'screenshot',
            P: {
                value: {
                    left: 0,
                    top: 0,
                    width: screenWidth,
                    height: 25,
                    type: 'image/png'
                }
            }
        }, function (req, res) {
            var imgUrl = res.P.value.data;

            var image = new Image();
            image.onload = function () {
                image.resize
                var str = OCRAD(image);
                console.log('result ocr');
                console.log(str);
            }
            image.src = imgUrl;
        });
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


    function changeMode2Search(opt, callback) {

        swb.transmitRequest({
            S: '.',
            D: '../../../',
            C: 'add-layer',
            P: {
                value: {
                    id: 'search',
                    name: 'search',
                    shared: false,
                    movable: {
                        ignoresMouseEvents: true,
                        frame: {
                            origin: {
                                x: opt.x,
                                y: opt.y
                            },
                            size: {
                                width: opt.width,
                                height: opt.height
                            }
                        }
                    },
                    setting: {
                        url: "",
                        ignoresMouseEvents: true,
                    },
                    preview: {
                        url: ""
                    },
                    browser: {
                        url: "http:localhost:50000/search"
                    }
                }
            }
        }, callback);
    }


    $(function () {
        var screenHeight = screen.height;
        var screenWidth = screen.width;
        /*swb.setCallback('SWBConnector.receiveMessage', function (request, response) {
         swb.transmitRequest({
         S: '.',
         D: '..',
         C: 'set-properties',
         P: {
         value: {
         browser: {
         alphaValue: 1.0
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
         }

         }
         }
         }, function () {

         });

         });*/
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
                         Telepathyサーバ
                         */

                        telepath.on('connect', function (event) {
                            layer_id = res.P.value.id;
                            home_id = res.P.value.id;
                            telepath.hello({from: res.P.value.id}, function (req, res) {
                                if (res.status == 200) {
                                    // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));
                                    /* telepath.get({key:userSessionKey},function(req,res){
                                     console.log(res);
                                     });*/
                                    //$('#myID').text(layer_id);
                                    $('#myID').text('homei1q64mmwe');

                                    setTabs();
                                }
                            });
                        });

                        telepath.on('message', function (message) {/*
                         if (msg.method == 'NOTIFY' && msg.key == myPreviewID) {
                         //データ変更時に文字をパースしてHTMLに反映させる
                         }*/


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
                                setTabs();
                            }
                            if (message.body.act == 'createWindow') {
                                setLayerId(function () {
                                    swb.transmitRequest({
                                        S: swb.currentPath,
                                        D: '../../../',
                                        C: 'add-layer',
                                        P: {
                                            value: {
                                                id: layer_id,
                                                name: layer_id,
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
            layer_id = 'refer' + String(Object.keys(res.P.value).length + Math.random().toString(36).slice(-8));
            callback();

        });
    }

    function setTabs() {
        $('#tab_army').html('');
        swb.transmitRequest({
            S: '.',
            D: '/root/private',
            C: 'get-children',
            P: {}
        }, function (req, res) {
            var result = res.P.value;
            /*for(var i = 0; i<Object.keys(result).length;i++){
             var aphtml = '<a id="tab' + String(i)+
             '" class="btn btn-material-pink btn-fab btn-raised mdi-action-schedule" style="position:absolute; margin:0px;left:16px;bottom:' +
             String(16+i*64) +
             'px;"></a>';

             $('#button_army').append(aphtml);
             $('#tab'+String(i)).click(function(){
             //実体化
             });
             $('#tab'+String(i)).hover(function(){
             //半実体化
             });

             }*/
            console.log(result);
            Object.keys(result).forEach(function (value, index, arr) {
                if (value.indexOf('home') == -1) {
                    var aphtml = '<img id="tab' + String(index) +
                        '" ' +
                            //'class="btn btn-material-pink btn-fab btn-raised mdi-action-schedule"' +
                        ' style="position:absolute;cursor:pointer; margin:0px;left:16px;bottom:' +
                        String(16 + index * 64) +
                        'px;"' +
                        'width="45" height="60"></img>';
                    $('#tab_army').append(aphtml);
                    //  telepath.send({to: value, body: {act: 'capture'}}, function (req, res) {


                    telepath.send({
                        to: value,
                        body: {act: 'get-thumbnail', number: index, to: home_id}
                    }, function (req, res) {
                        $('#tab' + String(index)).dblclick(function () {
                            //実体化
                            console.log(value);
                            telepath.send({to: value, body: {act: 'set-visible'}}, function (req, res) {

                            });
                        });
                        $('#tab' + String(index)).hover(function () {
                            //半実体化
                            telepath.send({to: value, body: {act: 'set-hover'}}, function (req, res) {

                            });
                        }, function () {
                            telepath.send({to: value, body: {act: 'set-unhover'}}, function (req, res) {

                            });
                        });

                        $('#tab' + String(index)).draggable({
                            stop: function () {
                                telepath.send({
                                    to: value,
                                    body: {
                                        act: 'set-tab-position',
                                        top: $('#tab' + String(index)).offset().top,
                                        left: $('#tab' + String(index)).offset().left
                                    }
                                }, function (req, res) {
                                    console.log($('#tab' + String(index)).offset().top);
                                });
                            }
                        });
                        //        });

                    });
                }
            });

        });


    }

});