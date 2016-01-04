/**
 * Created by kyoshida on 15/05/31.
 */

$(function () {
    var telepath = new TelepathyClient();
    var url_list = new Array();
    var favorites = new Array();
    var web_setting_layer = "http://localhost:50000/setting";
    var makeLayerLeft = screen.width / 2 + 15;
    var makeLayerTop = screen.height / 10;
    var makeLayerWidth = screen.width * 2 / 5;
    var makeLayerHeight = screen.height * 4 / 5;
    var layer_id = 'layer00';
    var home_layer_id;
    var myId='';


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

    $('#trash_area').droppable({
        accept:'.tabs',
        drop:function(event,ui){

           var str = $(this).attr('id');
            console.log(str);
            var str2 = str.replace('tab','');
            var ind = parseInt(str2);
            favorites.slice(ind,1);
            $(str).remove();
            telepath.set({key:'favorite',value:favorites},function(req,res){

            });
        }
    });

    swb.initialize(function () {
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
                    }
                }
            }
        }, function (req, res) {
            setInitialId(function () {
                home_layer_id = layer_id;
                swb.transmitRequest({
                    S: '.',
                    D: '../../../',
                    C: 'add-layer',
                    P: {
                        value: {
                            id: layer_id,
                            name: layer_id,
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
                                url: 'http://localhost:50000/ui'
                            },
                            preview: {
                                url: ''
                            },
                            browser: {
                                url: ''
                            }
                        }
                    }
                }, function () {


                    /*
                     Telepathyサーバ
                     */
                    telepath.on('connect', function (event) {


                        telepath.hello({from: 'favorite'}, function (req, res) {
                            if (res.status == 200) {
                                // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));

                                telepath.get({key: 'favorite'}, function (req, res) {
                                    favorites = res.value;
                                    console.log(favorites);
                                    console.log(res);
                                    if (favorites != null && favorites != undefined) {
                                        setLayerId(makeFavoriteItem);
                                    }
                                    telepath.delete({key:'history'},function(req,res){});
                                    telepath.observe({key: 'favorite'}, function (req, res) {
                                        telepath.get({key: 'favorite'}, function (req, res) {
                                            favorites = res.value;
                                            console.log(favorites);
                                            console.log(res);
                                            if (favorites != null && favorites != undefined) {
                                                setLayerId(makeFavoriteItem);
                                            }
                                        });
                                    });
                                });
                            }
                        });
                    });

                    telepath.on('message', function (message) {
                        if (message.body.act == 'call') {
                            fowardLayerLevel(function () {
                            });
                        }
                        if (message.body.act == 'reset-items') {
                            makeFavoriteItem();
                        }
                        if (message.body.act == 'createWindow') {
                            setLayerId(function () {
                                swb.transmitRequest({
                                    S: swb.currentPath,
                                    D: '../../../',
                                    C: 'add-layer',
                                    P: {
                                        id: layer_id,
                                        name: layer_id,
                                        shared:false,
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
                                            url:''
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


    $('#back').click(function () {
        backLayerLevel(function () {
        });
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

            $(document.body).css({
                   'background-color':'rgba(0,0,0,0.0)'
            });
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
            $(document.body).css({'background-color':'rgba(0,0,0,0.6)'});
            callback(req,res);
        });

    }

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

    function setInitialId(callback) {
        layer_id = 'home' + String(Math.random().toString(36).slice(-8));
        callback();
    }

    function setMyId(callback){
        myId = String(Math.random().toString(36).slice(-8));
    }

    function makeFavoriteItem() {
        $('#button_army').html('');
        if (favorites != null && favorites != undefined && favorites.length != 0) {
            favorites.forEach(function (value, index, arr) {
                /*
                 value={
                 img
                 title
                 url
                 top
                 left
                 snipet
                 }
                 */
                var aphtml = '<img class="tabs" id="tab' + String(index) +
                    '" ' +
                    'src ="' + value.img + '"' +
                        //'class="btn btn-material-pink btn-fab btn-raised mdi-action-schedule"' +
                    ' style="position:absolute;cursor:pointer; margin:0px;left:16px;bottom:' +
                    String(16 + index * 64) +
                    'px;"' +
                    'width="45" height="60"></img>';
                $('#button_army').append(aphtml);
                //  telepath.send({to: value, body: {act: 'capture'}}, function (req, res) {

                $('#tab' + String(index)).css('left', value.left);
                $('#tab' + String(index)).css('top', value.top);


                $('#tab' + String(index)).dblclick(function () {
                    //windowを生成して後退
                   backLayerLevel(function (req, res) {
                        swb.transmitRequest({
                            S: swb.currentPath,
                            D: '../../../',
                            C: 'add-layer',
                            P: {
                                value: {
                                    id: layer_id,
                                    name: layer_id,
                                    shared: false,
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
                                    setting: {
                                        url: web_setting_layer
                                    },
                                    preview: {
                                        url: ''
                                    },
                                    browser: {
                                        url: value.url
                                    }
                                }
                            }
                        }, function (req, res) {
                            setLayerId(function (req, res) {
                                telepath.send({key: layer_id, body: {act: 'reset-thumbnail'}}, function (req, res) {

                                });
                            });
                        });
                    });
                });
                console.log(value);

                $('#tab' + String(index)).hover(function () {
                    //色の切り替え、スニペットの表示
                    //TODO
                    $('#tab' + String(index)).css({
                        width: 60,
                        height: 80
                    });
                }, function () {
                    $('#tab' + String(index)).css({
                        width: 45,
                        height: 60
                    });
                });

                $('#tab' + String(index)).draggable({
                    //移動してtelepathyに保存
                    stop: function () {
                        var nFavorite = {
                            img: value.img,
                            title: value.title,
                            url: value.url,
                            snipet: value.snipet,
                            left: $('#tab' + String(index)).offset().left,
                            top: $('#tab' + String(index)).offset().top
                        };
                        favorites[index] = nFavorite;
                        telepath.set({key: 'favorite', value: favorites}, function (req, res) {
                        });
                    }
                    //        });
                });
            });
        }
    }
});