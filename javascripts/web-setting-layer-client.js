/**
 * Created by kyoshida on 15/05/14.
 */







$(function () {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var transFlg = false;//Setting上のやつ
        var menuFlg = false;
        var tabFlg = false;//falseは実体
        var layer_id;
        var thumbnail = '';
        var thumbnail_left;
        var thumbnail_top;
        var current_x;
        var current_y;
        var current_width;
        var current_height;


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


      /*  $('#input_query').change(function(){
            console.log('change');
            console.log(document.getElementById('input_query').disabled);
            console.log(document.getElementById('input_query').readOnly);
            console.log(document.getElementById('input_query').value);
            console.log($('#input_query').attr('maxLength',20));

        });
        $('#input_query').keypress(function(){
            console.log('keypress');
            console.log(document.getElementById('input_query').disabled);
            console.log(document.getElementById('input_query').readOnly);
            console.log(document.getElementById('input_query').value)
            console.log($('#input_query').attr('maxLength',210));

        });
        $('#input_query').keyup(function(){
            console.log('keyup');
            console.log(document.getElementById('input_query').disabled);
            console.log(document.getElementById('input_query').readOnly);
            console.log(document.getElementById('input_query').value)
            console.log(document.getElementById('input_query').maxLength);
        });


*/

        swb.initialize(function () {
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
                            hasShadow: true
                        }

                    }
                }
            }, function () {
                /*
                 telepathy start
                 */

                swb.transmitRequest({
                    S: '.',
                    D: '..',
                    C: 'get-id',
                    P: {}
                }, function (req, res1) {
                    telepath.on('connect', function (event) {
                        layer_id = res1.P.value;
                        console.log(res1.P.value);

                        telepath.hello({from: res1.P.value}, function (req, res) {
                            if (res.status == 200) {
                                // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));
                            }
                        });
                    });

                    telepath.on('message', function (message) {/*
                     if (msg.method == 'NOTIFY' && msg.key == myPreviewID) {
                     //データ変更時に文字をパースしてHTMLに反映させる
                     }*/

                        if (message.body.act == 'set-visible') {
                            //tabflgで行う
                            //false->実体
                            setTrans(tabFlg, function (req, res) {
                                tabFlg = !tabFlg;
                            })

                        }

                        if (message.body.act == 'set-hover') {

                            swb.transmitRequest({
                                S: swb.currentPath,
                                D: '../',
                                C: 'set-properties',
                                P: {
                                    value: {
                                        setting: {
                                            level: 20,
                                            alphaValue: 0.5
                                        },
                                        browser: {
                                            level: 20,
                                            alphaValue: 0.5
                                        },
                                        movable: {
                                            level: 20,
                                            alphaValue: 0.5
                                        }

                                    }
                                }
                            })
                        }


                        if (message.body.act == 'set-unhover') {
                            setTrans(!tabFlg, function (req, res) {
                                if (!tabFlg) {
                                    changeAlphaMode({tFlg: !transFlg, id: ''}, function (req, res) {

                                    });

                                }
                            });
                        }
                        if (message.body.act == 'set-tab-position') {
                            thumbnail_left = message.body.left;
                            thumbnail_top = message.body.top;
                        }

                        if (message.body.act == 'get-thumbnail') {
                            console.log(thumbnail);
                            console.log(thumbnail_left);
                            console.log(thumbnail_top);
                            console.log(message);
                            if (thumbnail != null && thumbnail != undefined && thumbnail.length != 0) {
                                telepath.send({
                                    to: message.body.to,
                                    body: {
                                        act: 'thumbnail',
                                        number: message.body.number,
                                        img: thumbnail,
                                        left: thumbnail_left,
                                        top: thumbnail_top
                                    }
                                }, function (req, res) {

                                });
                            } else {
                                console.log('else');
                                swb.transmitRequest({
                                    S: swb.currentPath,
                                    D: '../',
                                    C: 'get-all-properties',
                                    P: {}
                                }, function (req, res) {
                                    console.log(res);
                                    var bc = res.P.value.browser.frame;
                                    swb.transmitRequest({
                                        S: '.',
                                        D: '..',
                                        C: 'screenshot',
                                        P: {
                                            value: {
                                                left: bc.origin.x,
                                                top: bc.origin.y,
                                                width: bc.size.width,
                                                height: bc.size.height,
                                                type: 'image/png'
                                            }
                                        }
                                    }, function (requet, response) {
                                        var dataurl = response.P.value.data;
                                        thumbnail = response.P.value.data;

                                        telepath.send({
                                            to: message.body.to,
                                            body: {
                                                act: 'thumbnail',
                                                number: message.body.number,
                                                img: thumbnail,
                                                left: thumbnail_left,
                                                top: thumbnail_top
                                            }
                                        }, function (req, res) {

                                        });

                                    });
                                });
                            }

                        }

                        if (message.body.act == 'set-url') {
                            swb.transmitRequest({
                                S: '.',
                                D: '../',
                                C: 'set-properties',
                                P: {
                                    value: {
                                        browser: {
                                            url: message.body.url
                                        }
                                    }
                                }
                            }, function (request, response) {
                                swb.transmitRequest({
                                    S: swb.currentPath,
                                    D: '../',
                                    C: 'get-all-properties',
                                    P: {}
                                }, function (req, res) {
                                    console.log(res);
                                    var bc = res.P.value.browser.frame;
                                    setTimeout(function () {
                                        swb.transmitRequest({
                                            S: '.',
                                            D: '..',
                                            C: 'screenshot',
                                            P: {
                                                value: {
                                                    left: bc.origin.x,
                                                    top: bc.origin.y,
                                                    width: bc.size.width,
                                                    height: bc.size.height,
                                                    type: 'image/png'
                                                }
                                            }
                                        }, function (requet, response) {
                                            var dataurl = response.P.value.data;
                                            thumbnail = response.P.value.data;

                                        });
                                    }, 2000);

                                });
                            });
                        }

                        if (message.body.act == 'capture') {
                            swb.transmitRequest({
                                S: swb.currentPath,
                                D: '../',
                                C: 'get-all-properties',
                                P: {}
                            }, function (req, res) {
                                console.log(res);
                                var bc = res.P.value.browser.frame;
                                swb.transmitRequest({
                                    S: '.',
                                    D: '..',
                                    C: 'screenshot',
                                    P: {
                                        value: {
                                            left: bc.origin.x,
                                            top: bc.origin.y,
                                            width: bc.size.width,
                                            height: bc.size.height,
                                            type: 'image/png'
                                        }
                                    }
                                }, function (requet, response) {
                                    var dataurl = response.P.value.data;
                                    thumbnail = response.P.value.data;

                                });
                            });
                        }

                        if (message.body.act == 'setFromFavorite') {
                            thumbnail = message.body.img;
                            thumbnail_left = message.body.left;
                            thumbnail_top = message.body.top;
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

                });
                /*
                 telepathy end
                 */
            });


        });

        function setMenuMode(modeFlg, callback) {
            if (menuFlg) {
                swb.transmitRequest({
                    S: swb.currentPath,
                    D: '../',
                    C: 'set-properties',
                    P: {
                        value: {
                            movable: {
                                alphaValue: 0.00,
                                ignoresMouseEvents: true,
                                movableByWindowBackground: false
                            }
                        }
                    }
                }, function (req, res) {
                    $('#close').css('visibility', 'hidden');
                    $('#alpha').css('visibility', 'hidden');
                    $('#favorite').css('visibility', 'hidden');
                    $('#cosend').css('visibility', 'hidden');
                    $('#sendtoid').css('visibility', 'hidden');
                    callback(req, res);

                });

            } else {
                swb.transmitRequest({
                    S: swb.currentPath,
                    D: '../',
                    C: 'set-properties',
                    P: {
                        value: {
                            movable: {
                                alphaValue: 1.00,
                                ignoresMouseEvents: false,
                                movableByWindowBackground: true
                            }
                        }
                    }
                }, function (req, res) {

                    $('#close').css('visibility', 'visible');
                    $('#alpha').css('visibility', 'visible');
                    $('#favorite').css('visibility', 'visible');
                    $('#cosend').css('visibility','visible');
                    $('#sendtoid').css('visibility','visible');
                    callback(req, res);
                });
            }


        }

        function changeAlphaMode(opt, callback) {
            /*
             opt={id,tFlg=true|false}
             */
            callback = (typeof callback == 'function' ? callback : function () {
            });


            if (opt.tFlg) {
                swb.transmitRequest({
                    S: '.',
                    D: '../' + opt.id,
                    C: 'set-properties',
                    P: {
                        value: {
                            browser: {
                                alphaValue: 1.0,
                                ignoresMouseEvents: false
                            }
                        }
                    }
                }, function () {


                    callback();

                });
            } else {
                swb.transmitRequest({
                    S: '.',
                    D: '../' + opt.id,
                    C: 'set-properties',
                    P: {
                        value: {
                            browser: {
                                alphaValue: 0.5,
                                ignoresMouseEvents: true
                            }
                        }
                    }
                }, function () {

                    callback();
                });

            }


        }

        function moveLayer(opt, callback) {
            /*
             opt={
             dx,dy,id
             }
             */
            swb.transmitRequest({
                S: '.',
                D: opt.lid,
                C: 'set-properties',
                P: {
                    value: {
                        movable: {
                            frame: {
                                origin: {
                                    x: opt.dx,
                                    y: opt.dy
                                },
                                size: {
                                    width: windowWidth / 3,
                                    height: windowHeight / 3
                                }
                            }
                        }
                    }
                }
            }, callback);

        };

        function setTrans(flg, callback) {
            callback = (typeof callback == 'function' ? callback : function () {
            });
            if (flg) {

                swb.transmitRequest({
                    S: swb.currentPath,
                    D: '../',
                    C: 'set-properties',
                    P: {
                        value: {
                            setting: {
                                alphaValue: 1.0,
                                level: 20
                            },
                            browser: {

                                alphaValue: 1.0,
                                level: 20
                            },
                            movable: {

                                alphaValue: 1.0,
                                level: 20
                            }
                        }
                    }

                }, function (req, res) {
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
                    callback(req, res);
                });
            }

        }

        function deleteLayer(opt, callback) {
            /*
             opt={id}
             */

            callback = (typeof callback == 'function' ? callback : function () {
            });
            swb.transmitRequest({
                S: '.',
                D: '../' + opt.id,
                C: 'close',
                P: {}
            }, callback);

        }


        $('#close').click(function () {
            var sendobj = {
                id: ''
            };
                telepath.delete({key: layer_id}, function (req, res) {
                    deleteLayer(sendobj, function () {
                    });
            });
        });
        $('#favorite').click(function () {
            telepath.get({key: 'favorite'}, function (req, res) {
                var result = res.value;
                //console.log(res.value);
                console.log(Object.keys(result).length);
                if (Object.keys(result).length == 0) {
                    result = new Array();
                }


                telepath.get({key: layer_id}, function (req, res) {
                    var nFavorite = {
                        url: res.value.url,
                        title: res.value.title,
                        img: thumbnail,
                        left: thumbnail_left,
                        top: thumbnail_top
                    };


                    result.push(nFavorite);
                    telepath.set({key: 'favorite', value: result});
                });
                /*  swb.transmitRequest({
                 S:'.',
                 D:'..',
                 C:'get-all-properties',
                 P:{}
                 },function(req,res){
                 var url = res.P.value.browser.url;
                 swb.transmitRequest({
                 //TODO

                 },function(req,res){


                 });

                 });*/


            });
        });
        $('#alpha').click(function () {
            if (transFlg) {

                changeAlphaMode({id: '', tFlg: transFlg}, function () {

                    transFlg = false;

                });
            } else {
                changeAlphaMode({id: '', tFlg: transFlg}, function () {
                    transFlg = true;


                });
            }
            console.log(transFlg);
        });


        swb.handleRequest('resultShot', function (req, res) {
            console.log('resultShot');
            console.log(req);
            swb.transmitResponse(req, {text: 'aaaaa'});

        });

        $('#menu').click(function () {
            setMenuMode(menuFlg, function (req, res) {
                menuFlg = !(menuFlg);
                console.log(menuFlg);
            });
        });

        $('#cosend').click(function(){
            console.log('cosend click');
            var sendid = $('#sendtoid').val();
            console.log(sendid);
            if(sendid != null && sendid != undefined && sendid != ''){
                swb.transmitRequest({
                    S:swb.currentPath,
                    D:'../',
                    C:'get-all-properties',
                    P:{}
                },function(req,res){
                   var targetUrl=res.P.value.browser.url;
                    telepath.send({to:sendid,body:{act:'createWindow',url:targetUrl}},function(req,res){
                        console.log(targetUrl);
                        console.log(sendid);
                    });
                });
            }
        });

    }
)
;


