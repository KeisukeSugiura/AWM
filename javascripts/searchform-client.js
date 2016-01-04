/**
 * Created by kyoshida on 15/04/30.
 */




//イベントオブジェクトを定義しておく
/*
 canvas.on('click',function(){
 mouseposition = get
 for(eventobject){

 eventobject[i].handleclick(mouseposition);
 }
 }
 みたいな
 */


$(function () {


    /*
     定数定義
     */

    var timer;
    var delay = 20;
    var RESULT_SIZE = 10;
    var socket = new io.connect('http://localhost:50000');
    var screenHeight = screen.height;
    var screenWidth = screen.width;
    var userSessionKey = 'mySession';
    var userSessionHistory = 'history';//書き換えないかん
    var query_word;

    var moveLeftArea = screenWidth / 4;
    var moveRightArea = screenWidth - moveLeftArea;
    var blurflg = true;
    var webViewLayer = [
        {lid: 'weblayer0', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer1', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer2', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer3', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer4', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer5', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer6', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer7', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer8', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
        {lid: 'weblayer9', initX: 0, initY: 0, Width: screenWidth / 3, height: screenHeight / 3, url: ""},
    ];
    webViewLayer.forEach(function (value, index, arr) {
        value.initY = screenHeight * 2 / 3 - index * (screenHeight / 3 + 50);//screenHeight * 2 / 3 - index * (screenHeight / 3 + 50);
        value.initX = 0;//screenWidth / 8 - (screenHeight / 3 + (RESULT_SIZE) * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) * (screenHeight / 3 + (RESULT_SIZE) * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) / 400
    });
    var layer_id = 'refer1';

    //var web_setting_layer = 'http://apps.wisdomweb.net/swb/0.0.12/swb-setting.html';
    var web_setting_layer = "http://localhost:50000/setting";
    var web_preview_layer = 'http://apps.wisdomweb.net/swb/0.0.12/swb-preview.html';
    //var web_preview_layer = '';
    var screenshot_layer = 'http://localhost:50000/screenshot';
    var screenshot_id = 'screenshotter';
    var result_list = new Array();


    setInputFormPosition();

    /*
     定数定義終了
     */


    /*
     Telepathyサーバ
     */

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


    /*
     SWB初期設定
     */
    $(function () {
        /*swb.setCallback('SWBConnector.receiveMessage', function (request, response) {

         swb.position({left: 0, top: 0, width: screenWidth, height: screenHeight}, function (req, res) {
         console.log(req);
         swb.level(20, function (req, res) {

         });
         });


         });*/
        swb.initialize(function () {
            swb.position({left: 0, top: 0, width: screenWidth, height: screenHeight}, function (req, res) {
                console.log(req);
                swb.level(10, function (req, res) {
                    /*swb.transmitRequest({
                     S: '.',
                     D: '../../../',
                     C: 'add-layer',
                     P: {
                     value: {
                     id: screenshot_id,
                     name: screenshot_id,
                     shared: false,
                     movable: {
                     frame: {
                     origin: {
                     x: -100,//-screenWidth,
                     y: -100//-screenHeight
                     },
                     size: {
                     width: screenWidth / 3,
                     height: screenHeight / 3
                     }
                     }
                     },
                     setting: {
                     url: screenshot_layer
                     },
                     preview: {
                     url: web_preview_layer
                     },
                     browser: {
                     url: 'http://google.com'
                     }
                     }
                     }
                     }, function () {*/
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


                        swb.transmitRequest({
                            S: swb.currentPath,
                            D: '../',
                            C: 'get-all-properties',
                            P: {}
                        }, function (req, res) {

                            telepath.on('connect', function (event) {

                                telepath.hello({from: res.P.value.id}, function (req, res) {
                                    if (res.status == 200) {
                                        // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));
                                        //telepath.observe({key: myPreviewID}, function () {

                                        // });
                                        console.log('hello');
                                        telepath.get({key: 'history'}, function (req, res) {
                                            var result = res.value;
                                            console.log(result);
                                            if (result != null && result != undefined && result.length != 0) {
                                                socket.emit('reqSuggest', result);
                                                /*
                                                 var prefixes= new Array();
                                                 prefixes = result;
                                                 var url_str = "http://ff.search.yahoo.com/gossip?output=json&command=";
                                                 result.forEach(function(val,index,arr){
                                                 var cuulr = url_str+val;
                                                 console.log(cuulr);
                                                 $.ajax({
                                                 url: cuulr,	//　http://から始まるURLを指定
                                                 success: function(xml,status){
                                                 //if(status!='success')return;
                                                 console.log(xml);
                                                 //通信できたら
                                                 $(xml).find('suggestion').each(function(){
                                                 //Suggestで得た単語をSuggest要素で追加

                                                 prefixes.push($(this).attr("data"));
                                                 console.log('suggestion');
                                                 });
                                                 }, //取得したXMLの処理
                                                 error:function(err,err2,err3){
                                                 console.error(err);
                                                 }
                                                 });
                                                 });
                                                 */


                                            }
                                        });
                                    }
                                });
                            });

                            telepath.on('message', function (message) {/*
                             if (msg.method == 'NOTIFY' && msg.key == myPreviewID) {
                             //データ変更時に文字をパースしてHTMLに反映させる
                             }*/
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


                        $('#input_query').focus();
                        $('#back').click(function () {
                            backHomeLayer({}, function () {
                            });
                        });

                        /* $('#input_query').blur(function () {
                         if (blurflg) {

                         backHomeLayer({}, function () {
                         /!*deleteLayer({id: }, function () {

                         });*!/

                         });
                         }
                         });*/


                        //});


                    });

                });
            });

        });
    });


    /*
     SWB初期設定終了
     */


    /*
     DOMイベントリスナー
     */


    var search_for = function (e) {
        if (e.keyCode == 13) {
            blurflg = false;
            query_word = $('#input_query').val();
            if (query_word != null && query_word != "") {
                $('#input_query').css('visibility', 'hidden');
                $('#input_container').css('visibility', 'hidden');


                socket.emit('query', {query: query_word, count: RESULT_SIZE});

                telepath.get({key: 'history'}, function (req, res) {
                    var historys = res.value;
                    if (Object.keys(historys).length == 0) {
                        historys = new Array();
                    }
                    historys.push(query_word);
                    telepath.set({key: 'history', value: historys});
                });

                console.log(query_word);
            }
        }
    }


    function setInputFormPosition() {
        $('#input_container').css('margin-left', (screenWidth - 300) / 2);
        $('#input_container').css('margin-top', (screenHeight - 100) / 2);
        $('#prefix_area').css('margin-left', (screenWidth) / 4);
        $('#prefix_area').css('margin-top', (screenHeight - 100) / 2 + 50);
        $('#prefix_area').css('height', (screenHeight - 200) / 2);
        $('#prefix_area').css('width', screenWidth / 2);

    }


    $('#input_query').keydown(function (e) {

        search_for(e);


    });
    /*
     DOMイベントリスナー終了
     */


    /*
     socket.ioリスナー
     */

    socket.on('suggest', function (message) {
        console.log(message);
        var prefixes = message;
        prefixes.forEach(function (val1, index1, arr1) {
            var apdhtml =
                '<div id="prefix-box' + String(index1) + '" style="margin-top:5px;margin-left:5px;float:left;"></div>';
            $('#input_prefix').append(apdhtml);
            val1.forEach(function (val, index, arr) {


                var aphtml =
                    '<a id="pre' + String(index) + '"' + 'style="color:white;" >' +
                    val +
                    '</a><br>';
                $('#prefix-box' + String(index1)).append(aphtml);

                $('#pre' + String(index)).click(function (evt) {
                    blurflg = false;
                    query_word = val;
                    if (query_word != null && query_word != "") {
                        $('#input_query').css('visibility', 'hidden');
                        $('#input_container').css('visibility', 'hidden');
                        $('#input_prefix').css('visibility', 'hidden');

                        socket.emit('query', {query: query_word, count: RESULT_SIZE});

                        telepath.get({key: 'history'}, function (req, res) {
                            var historys = res.value;
                            if (Object.keys(historys).length == 0) {
                                historys = new Array();
                            }
                            historys.push(query_word);
                            telepath.set({key: 'history', value: historys});
                        });

                        console.log(prefixes);
                    }
                });
            });
        });
    });

    socket.on('responseRelationSearch', function (relation) {
        telepath.set({key: userSessionKey, value: relation}, function (req, res) {

        });
    });

    socket.on('result', function (data) {
        //  $('body').css('height', -screenHeight * 2 / 3 + (10 + 1) * (screenHeight / 3 + 50));

        /*
         {
         title:
         links:{
         title:
         link:
         sunipet:
         image:
         }
         }
         */

        $('#delarea').html('');
        //$('body').append('<a href="../search" class="btn btn-material-pink btn-fab btn-raised mdi-action-search"style="position: fixed; z-index: 30;bottom:16px;right:16px;"></a>');
        /*
         for (var i = 0; i < linkList.length; i++) {


         $('body').append(
         '<dir style="position:absolute;" id="item' +
         String(i) +
         '"><h2 class="h2">' +
         data.links[i].title + String(i) +
         '</h2><iframe src="' +
         data.links[i].link + //テスト用 本番は違う方法kana
         '"></iframe><p>' +
         data.links[i].sunipet +
         '</p>' +
         '<span id="linkdata' + +String(i) +
         '" style="visibility:hidden">' +
         data.links[i].link +
         '</span>' +
         '</dir>');

         $('#item' + String(i)).css({
         width: screenWidth / 4,
         height: screenWidth / (4 * 1.414),
         top: (screenHeight / 2) * (Math.sin(-90 - 360 * (i + 1 / linkList.length))) + screenHeight - screenWidth / (8 * 1.414),
         left: (screenWidth / 2) * (Math.cos(-90 - 360 * (i + 1 / linkList.length))) + screenWidth / 2 - screenWidth / 8,
         position: 'absolute'
         });


         }*/

        //円描画
        /*data.links.forEach(function (value, index, arr) {
         $('body').append(
         '<div class = "col-md-6" style="position:absolute;" id="item' +
         String(index) +
         '"><h2 class="h2">' +
         value.title + String(index) +
         '</h2><iframe src="' +
         value.link + //テスト用 本番は違う方法kana
         '"></iframe><p>' +
         value.sunipet +
         '</p>' +
         '<span id="linkdata' + +String(index) +
         '" style="visibility:hidden">' +
         value.link +
         '</span>' +
         '</div>');

         $('#item' + String(index)).css({
         width: screenWidth / 4,
         height: screenWidth / (4 * 1.414),
         top: (screenHeight / 2) * (Math.sin(-90 - 360 * (index + 1 / arr.length))) + screenHeight - screenWidth / (8 * 1.414),
         left: (screenWidth / 2) * (Math.cos(-90 - 360 * (index + 1 / arr.length))) + screenWidth / 2 - screenWidth / 8,
         position: 'absolute'
         });
         });*/

        var sendobj = {
            id: layer_id,
            x: screenWidth / 2 + 15,
            y: screenHeight / 10,
            width: screenWidth * 2 / 5,
            height: screenHeight * 4 / 5,
            url: data.result

        };

        result_list = data.links;
        createLayer(sendobj, function () {


        });
        gridlayout(data);

        //genelateLayer(data);
        //setScrollListener();

        /*
         var obj = {id: 'mamamamamamamamamam2', url: 'http://localhost'};
         swb.createWindow(obj, function () {
         var obj2 = {id: 'mamamamamamamamamam1', url: 'http://localhost'};
         swb.createWindow(obj2, function () {
         });
         }
         );*/
        /*async.series([
         function (cb) {
         createLayer({
         id: 'mvivi1',
         x: 0,
         y: 0,
         url: 'http://localhost'

         });
         },
         function (cb) {
         createLayer({
         id: 'mvivi2',
         x: 100,
         y: 100,
         url: 'http://localhost'

         })
         },
         function (cb) {
         createLayer({
         id: 'mvivi3',
         x: 200,
         y: 200,
         url: 'http://localhost'

         })
         }
         ],
         function (err, values) {
         // do somethig with the err or values v1/v2/v3
         }
         );*/
        //var id = 'moving';
        /* createLayer('moving1',
         function (req, res) {
         console.log('create!!');
         console.log(res);
         console.log(req);
         createLayer('moving2', function (req, res) {
         });
         });*/

        /* $('body').css(
         {
         width: screenWidth,
         height: screenHeight
         }
         );
         */

        // canvasLoop();


    });

    socket.on('result_image', function (obj) {
        /*
         obj{
         imageurl:
         relation:
         }
         */
        /*   for (var i = 0; i < RESULT_SIZE; i++) {
         $('#item' + String(i) + ',img').attr('src', './images/result'+String(i)+'.png');
         $('body').append('./images/result'+String(i)+'.png');
         }*/

        var im = new Image();

        var canvas = $('#image' + String(obj.relation));

        canvas[0].width = screenWidth / 4;
        canvas[0].height = screenHeight / 4;


        var cvx = canvas[0].getContext("2d");
        im.onload = function () {
            cvx.drawImage(im, 0, 0);


        }


        im.src = './images/result' + String(obj.relation) + '.png';

        // $('#image'+String(obj.relation)).append(im);
        //  $('#item'+String(obj.relation)+' img').attr('src',obj.imageurl);


        //TODO relationで対応付けを行い画像を表示する
        /*    for (var i = 0; i < RESULT_SIZE; i++) {

         }*/

    });

    /*
     socket.ioリスナー終了
     */


    /*
     SWBリスナー
     */


    swb.handleRequest('resultShot', function (req, res) {
        console.log('resultShot');
        console.log(req);
        swb.transmitResponse(req);

    });
    /*
     SWBリスナー終了
     */


    /*
     DOM生成
     */

    function gridlayout(data) {

        var htmlsrc = '';

        //$('body').append('<div class="col-md-6">');
        htmlsrc += '<a id="toui" class="btn btn-material-pink btn-fab btn-raised mdi-navigation-close"style="position: fixed; z-index: 30;bottom:16px;right:16px;"></a>';
        htmlsrc += '<a id="touileave" class="btn btn-material-pink btn-fab btn-raised mdi-navigation-check"style="position: fixed; z-index: 30;bottom:80px;right:16px;"></a>';
        htmlsrc += '<a id="tosearch" class="btn btn-material-pink btn-fab btn-raised mdi-action-search" style="position: fixed; z-index: 30;bottom:144px;right:16px;"></a>';
        htmlsrc += '<div class="col-md-6" style="padding-top:100px;">';
        //  htmlsrc += '<div class="col-md-12" style="position:fixed;"> <input id="input_query" class="form-control floating-label" placeholder="search" style="color: #ffffff;"' +
        //    'value="' + data.title + '"></div>';
        data.links.forEach(function (value, index, arr) {
                /*$('body').append(
                 '<div class = "col-md-6"" id="item' +
                 String(index) +
                 '"><h2 class="h2">' +
                 value.title + String(index) +
                 '</h2><iframe src="' +
                 value.link + //テスト用 本番は違う方法kana
                 '"></iframe><p>' +
                 value.sunipet +
                 '</p>' +
                 '<span id="linkdata' + +String(index) +
                 '" style="visibility:hidden">' +
                 value.link +
                 '</span>' +
                 '</div>');*/
                htmlsrc += '<div id="item' +
                    String(index) +
                    '" style="cursor:pointer;height:' + String(screenHeight / 3) +
                    'px;width:' + String(screenWidth / 3) +
                    'px;position:absolute;transform:translate3d(' + String(
                        screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) / 400
                    ) +
                    'px,0px,0px);-webkit-transform:translate3d(' + String(
                        screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) / 400
                    ) +
                    'px,0px,0px);translation-timing-function:1s ease-in-out;-webkit-translation-timing-function:1s ease-in-out;will-change:transform;' +
                    'top:' + String(
                        screenHeight / 3 + index * (screenHeight / 3 + 50)
                    ) +
                    'px"><h2 id="title' + String(index) +
                    '" class="h2" style="color:#dddddd">' +
                    value.title +
                    '</h2>' +
                        /*'<div style="width:' + String(screenWidth / 4) +
                         'px;height:' + String(screenHeight / 4) +
                         'px;">' +
                         '<div style="width:' + String(screenWidth) +
                         'px;height:' + String(screenHeight) +
                         'px;">' +
                         '<iframe id="frame' + String(index) +
                         '" src="' +
                         value.link + //テスト用 本番は違う方法kana
                         '" style="over-flow:hidden;width:100%;height:100%;transform:scale(0.25);-webkit-transform:scale(0.25);transform-origin:0 0;-webkit-transform-origin:0 0;' +
                         '"></iframe></div></div>' +
                         */
                    '<div style="height:' + String(screenHeight / 4) +
                    ';width:' + String(screenWidth / 4) +
                    ';">' +
                    '<canvas id="image' + String(index) +
                    '"></canvas>' +

                    '</div>' +
                    '<p style="color:#ffffff;">' +
                    value.sunipet +
                    '</p>' +
                    '<span id="linkdata' + +String(index) +
                    '" style="visibility:hidden">' +
                    value.link +
                    '</span>' +
                    '</div>';

            }
        )
        ;
        htmlsrc += '<div id="itemnull' +
            '" style="height:' + String(screenHeight / 3) +
            'px;width:' + String(screenWidth / 3) +
            'px;position:absolute;left:' + String(
                screenWidth / 8 - (screenHeight / 3 + (RESULT_SIZE) * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) * (screenHeight / 3 + (RESULT_SIZE) * (screenHeight / 3 + 50) - (screenHeight / 2 - 200)) / 400
            ) +
            'px;top:' + String(
                screenHeight / 3 + (RESULT_SIZE) * (screenHeight / 3 + 50)
            ) +
            'px"></div>';

        //$('body').append('</div>');
        htmlsrc += "</div>";


        // $('body').append('<div class="col-md-6">');
        htmlsrc += '<div class="col-md-6">';


        //$('body').append('<div class="col-md-9" id="page_preview">');
        htmlsrc += '<div class="col-md-10" id="page_preview" style="padding:30px 50px;">';

        /*  htmlsrc += '<iframe id="preview" src="' + data.links[0].link +
         '" style="position:fixed; width:40%;height:95%;"></iframe>';
         */

        // $('body').append('</div>');
        htmlsrc += '</div>';
        // $('body').append('<div class="col-md-3" id="page_command">');
        htmlsrc += '<div class="col-md-2" id="page_command">';

        //$('body').append('</div>');
        htmlsrc += '</div>';


//        $('body').append('</div>');
        htmlsrc += '</div>';


        $('body').append(htmlsrc);

        setting_listener();

    }


    function setting_listener() {
        $('#item0').click(function () {
            //window.location.href = $('#linkdata0').text();
            var lilink = $('#linkdata0').text();
            // $('#preview').attr('src', lilink);
            // setLayerURL({id: 'screenshotter', url: lilink}, function () {
            setLayerURL({id: layer_id, url: lilink}, function () {
                //telepath.send({to: 'screenshotter', body: {url: lilink, num: 0}});
                /* swb.transmitRequest({S:'.',D:'.',C:'get-path',P:{}},function(req,res){
                 console.log('this id is '+ res.P.value)

                 });*/


                /*
                 swb.transmitRequest({
                 D:'/root/private/screenshotter/setting',
                 S:'.',
                 C:'getS',
                 R:'request',
                 P:{
                 url:lilink,
                 num:0
                 }
                 },function(req,res){
                 console.log(res);
                 console.log('response!!');
                 });
                 */

                var canvas = $('#image0')[0];


                var testlist = {url: lilink, title: $('#title0').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });

            //});
            // console.log('bbbv');
        });
        $('#item1').click(function () {
            //window.location.href = $('#linkdata1').text();
            var lilink = $('#linkdata1').text();
            //$('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {


                var canvas = $('#image1')[0];
                var testlist = {url: lilink, title: $('#title1').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/

            });

            // console.log('bbbv');
        });
        $('#item2').click(function () {
            var lilink = $('#linkdata2').text();
//            $('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image2')[0];
                var testlist = {url: lilink, title: $('#title2').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });

            //window.location.href = $('#linkdata2').text();
            // console.log('bbbv');
        });
        $('#item3').click(function () {
            var lilink = $('#linkdata3').text();
//            $('#preview').attr('src', lilink);

            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image3')[0];
                var testlist = {url: lilink, title: $('#title3').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});

                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });
            //window.location.href = $('#linkdata3').text();
            //console.log($('#linkdata3').text());
        });
        $('#item4').click(function () {
            var lilink = $('#linkdata4').text();
//            $('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image4')[0];
                var testlist = {url: lilink, title: $('#title4').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });

            //window.location.href = $('#linkdata4').text();
            //  console.log('bbbv');
        });
        $('#item5').click(function () {
            var lilink = $('#linkdata5').text();
//            $('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image5')[0];
                var testlist = {url: lilink, title: $('#title5').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });

            //window.location.href = $('#linkdata5').text();
            // console.log('bbbv');
        });
        $('#item6').click(function () {
            var lilink = $('#linkdata6').text();
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image6')[0];
                var testlist = {url: lilink, title: $('#title6').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });
            //$('#preview').attr('src', lilink);

            //window.location.href = $('#linkdata6').text();
            ///console.log('bbbv');
        });
        $('#item7').click(function () {
            var lilink = $('#linkdata7').text();
//            $('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image7')[0];
                var testlist = {url: lilink, title: $('#title7').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });

            //window.location.href = $('#linkdata7').text();
            // console.log('bbbv');
        });
        $('#item8').click(function () {
            var lilink = $('#linkdata8').text();
//            $('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image8')[0];
                var testlist = {url: lilink, title: $('#title8').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });

//            window.location.href = $('#linkdata8').text();
            // console.log('bbbv');
        });
        $('#item9').click(function () {
            var lilink = $('#linkdata9').text();
//            $('#preview').attr('src', lilink);
            setLayerURL({id: layer_id, url: lilink}, function () {
                var canvas = $('#image9')[0];
                var testlist = {url: lilink, title: $('#title9').text(), img: canvas.toDataURL('image/png')};
                telepath.set({key: layer_id, value: testlist});
                /*telepath.get({key: 'history'}, function (req, res) {
                 var result = res.value;
                 //console.log(res.value);
                 console.log(Object.keys(result).length);
                 if (Object.keys(result).length == 0) {
                 result = new Array();
                 }
                 result.push(testlist);

                 telepath.set({key: 'history', value: result});
                 });*/
            });
            //window.location.href = $('#linkdata9').text();
            //console.log('bbbv');
        });
        $('#input_query').keydown(function (e) {
            search_for(e);
        });
        $('#toui').click(function (e) {
            backHomeLayer({}, function () {

                deleteLayer({id: layer_id}, function () {
                    deleteLayer({id: screenshot_id}, function () {


                    });
                });
            });

        });
        $('#touileave').click(function (e) {
            telepath.send({to: layer_id, body: {act: 'capture'}}, function (req, res) {
                backHomeLayer({}, function () {
                    deleteLayer({id: screenshot_id}, function () {
                    });
                });

            });

        });
        $('#tosearch').click(function (e) {
            backSearchLayer({}, function () {
                deleteLayer({id: layer_id}, function () {
                    deleteLayer({id: screenshot_id}, function () {
                    });
                });
            });

        });


        setScrollListener();

    };
    function setScrollListener() {


        $(window).scroll(function () {

            domScrollListener();
            // swbScrollListener();

        });


    };


    function domScrollListener() {

        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        arr.forEach(function (value, index, array) {
            var scrolly = $(window).scrollTop;


            console.log("aaaaaaaaaa");
            var scrolly = $(this).scrollTop();
            /*  $('#item'+String(index)).css(
             'left',
             screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) -scrolly - (screenHeight / 2 - 200)) * (screenHeight /3 + index * (screenHeight / 3 + 50)-scrolly - (screenHeight / 2 - 200))/400

             );*/
            $('#item' + String(index)).css(
                'transform', 'translate3d(' + String(
                    screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400
                ) + 'px,0px,0px)'
            ).css(
                '-webkit-transform', 'translate3d(' + String(
                    screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400
                ) + 'px,0px,0px)'
            );
        });

    };


    /*
     DOM生成終了
     */


    /*
     SWBメソッド
     */

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
                                width: screenWidth / 3,
                                height: screenHeight / 3
                            }
                        }
                    }
                }
            }
        }, callback);

    };


    function createLayer(opt, callback) {
        swb.transmitRequest({
            S: '.',
            D: '../../../',
            C: 'add-layer',
            P: {
                value: {
                    id: opt.id,
                    name: opt.id,
                    shared: false,
                    movable: {
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
                        url: web_setting_layer
                    },
                    preview: {
                        url: web_preview_layer
                    },
                    browser: {
                        url: opt.url
                    }
                }
            }
        }, callback);

    };

    function setLayerPosition(opt, callback) {
        /*
         opt={
         id,left,top,width,height
         }
         */
        swb.transmitRequest({
            S: '.',
            D: '../' + opt.id,
            C: 'set-properties',
            P: {
                value: {
                    browser: {
                        frame: {
                            origin: {
                                x: opt.left,
                                y: opt.top
                            },
                            size: {
                                width: opt.width,
                                height: opt.height
                            }
                        }
                    }
                }
            }
        }, callback);


    };
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

    function backHomeLayer(opt, callback) {

        callback = (typeof callback == 'function' ? callback : function () {
        });
        swb.transmitRequest({
            S: '.',
            D: '../',
            C: 'set-properties', P: {
                value: {
                    browser: {
                        url: ''
                    },
                    preview: {
                        url: ''
                    },
                    setting: {
                        url: 'http://localhost:50000/ui'
                    }
                }
            }
        }, function (request, response) {
            callback();
        });

    }

    function backSearchLayer(opt, callback) {
        callback = (typeof callback == 'function' ? callback : function () {
        });
        swb.transmitRequest({
            S: '.',
            D: '../',
            C: 'set-properties', P: {
                value: {
                    browser: {
                        url: ''
                    },
                    preview: {
                        url: ''
                    },
                    setting: {
                        url: 'http://localhost:50000/search'
                    }
                }
            }
        }, function (request, response) {
            callback();
        });


    }


    function deleteLayer(opt, callback) {
        /*
         opt={id}
         */

        callback = (typeof callback == 'function' ? callback : function () {
        });
        swb.transmitRequest({
            S: '.',
            D: '/root/private/' + opt.id,
            C: 'close',
            P: {}
        }, function (req, res) {
            console.log('deleteCallback');
            callback();
        });

    }


    function setLayerURL(opt, callback) {

        /*
         opt={
         id,url
         }
         */
        callback = (typeof callback == 'function' ? callback : function () {
        });

        telepath.send({to: opt.id, body: {act: 'set-url', url: opt.url}}, function (req, res) {
            callback(req, res);
        });
        /* swb.transmitRequest({
         S: '.',
         D: '/root/private/' + opt.id,
         C: 'set-properties', P: {
         value: {
         browser: {
         url: opt.url
         }
         }
         }
         }, function (request, response) {
         callback();
         });
         */

    };


    function getAllProperties(callback) {
        swb.transmitRequest({S: '.', D: '../', C: 'get-all-properties', P: {}}, function (request2, response2) {
            var properties = response2.P.value;
            var pro_id = properties.id;

            callback();
        });
    }

    function setLayerMenu(opt, callback) {

        /*
         opt={
         id,value
         }
         */
        callback = (typeof callback == 'function' ? callback : function () {
        });
        if (opt.value) {
            swb.transmitRequest({
                S: swb.path,
                D: '../' + opt.id + '/setting',
                C: 'activate',
                P: {}
            }, function (request1, response1) {
                swb.transmitRequest({
                    S: swb.path,
                    D: '../' + opt.id + '/setting',
                    C: 'show-corner',
                    P: {}
                }, function (request2, response2) {
                    swb.transmitRequest({
                        S: swb.path,
                        D: '../../' + opt.id,
                        C: 'set-properties',
                        P: {movable: {alphaValue: 1.00}}
                    }, function (request3, response3) {
                        callback();
                    });
                });
            });
        } else {
            swb.transmitRequest({
                S: swb.path,
                D: '../' + opt.id + '/setting',
                C: 'deactivate',
                P: {}
            }, function (request1, response1) {
                swb.transmitRequest({
                    S: swb.path,
                    D: '../' + opt.id + '/setting',
                    C: 'hide-corner',
                    P: {}
                }, function (request2, response2) {
                    swb.transmitRequest({
                        S: swb.path,
                        D: '../' + opt.id,
                        C: 'set-properties',
                        P: {movable: {alphaValue: 0.00}}
                    }, function (request3, response3) {
                        callback();
                    });
                });
            });
        }
    };

    /*
     SWBメソッド終了
     */


    /*
     製作段階で生まれたいらないソースコード
     */


    //ここからSWBレイヤーの生成及びスクロール制御
    /*

     function genelateLayer(data) {
     /!*
     data={title,
     links:{
     title,link,sunipet,image
     }
     }
     *!/
     //var sendobj = new Array();

     /!*   var sendobj = {
     id: 'vivivi',
     x: 0,
     y: 0,
     url: data.links[0].link

     };
     createLayer(sendobj);
     *!/
     /!*
     webViewLayer.forEach(function (value, index, arr) {


     value.url = data.links[index].link;
     var sendobj = {
     id: value.lid,
     x: 0,
     y: 0,
     url: data.links[index].link

     };
     console.log('webview');
     createLayer(sendobj,function(){});

     });*!/

     var sendobj = {
     id: webViewLayer[0].lid,
     x: webViewLayer[0].initX,
     y: webViewLayer[0].initY,
     url: data.links[0].link
     };

     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[1].lid,
     x: webViewLayer[1].initX,
     y: webViewLayer[1].initY,
     url: data.links[1].link
     };

     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[2].lid,
     x: webViewLayer[2].initX,
     y: webViewLayer[2].initY,
     url: data.links[2].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[3].lid,
     x: webViewLayer[3].initX,
     y: webViewLayer[3].initY,
     url: data.links[3].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[4].lid,
     x: webViewLayer[4].initX,
     y: webViewLayer[4].initY,
     url: data.links[4].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[5].lid,
     x: webViewLayer[5].initX,
     y: webViewLayer[5].initY,
     url: data.links[5].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[6].lid,
     x: webViewLayer[6].initX,
     y: webViewLayer[6].initY,
     url: data.links[6].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[7].lid,
     x: webViewLayer[7].initX,
     y: webViewLayer[7].initY,
     url: data.links[7].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[8].lid,
     x: webViewLayer[8].initX,
     y: webViewLayer[8].initY,
     url: data.links[8].link
     };


     createLayer(sendobj, function () {

     var sendobj = {
     id: webViewLayer[9].lid,
     x: webViewLayer[9].initX,
     y: webViewLayer[9].initY,
     url: data.links[9].link
     };


     });

     });

     });

     });

     });

     });

     });

     });


     });


     };


     function swbScrollListener() {

     var scrolly = $(window).scrollTop();

     var sendobj = {
     lid: '../' + webViewLayer[0].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[0].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[1].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[1].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[2].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[3].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[4].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[4].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[5].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[5].initY - scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[6].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[6].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[7].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[7].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[8].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[8].initY + scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {
     var sendobj = {
     lid: '../' + webViewLayer[9].lid,
     dx: 0,//screenWidth / 8 - (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) * (screenHeight / 3 + index * (screenHeight / 3 + 50) - scrolly - (screenHeight / 2 - 200)) / 400,
     dy: webViewLayer[9].initY - scrolly//value.initX + scrolly
     };
     moveLayer(sendobj, function () {

     });
     });
     });
     });
     });
     });
     });
     });
     });


     }*/
    //SWBの生成及びスクロール制御ここまで


    //DOM円回転ここから
    /*

     /!*
     //円表示の時のイベント
     window.document.onmousemove = function (e) {
     var mx = e.clientX;
     var my = e.clientY;


     if (mx < moveLeftArea) {
     moveLeftItemsLooper();
     } else if (moveRightArea < mx) {
     moveRightItemsLooper();

     } else {
     clearTimeout(timer);
     }


     }*!/

     ////////////////////////////
     /!*var x = 0;
     var y = 0;
     var radi = 0;
     *!/
     function canvasLoop(image) {
     radi++;
     console.log(radi % 360);

     x = Math.cos((radi) / 50) * 200 + screenWidth / 2 - 200;
     y = Math.sin((radi) / 50) * 200 + screenHeight / 2 - 200;
     console.log(y);
     drawLink(radi);

     clearTimeout(timer);
     timer = setTimeout(canvasLoop, delay);
     }


     function drawLink(ra) {
     //   console.log(linkList);
     /!*ctx.clearRect(0,0,screenWidth,screenHeight);
     ctx.drawImage(image,x,y);*!/
     /!*$('#image').css({
     top: y,
     left: x
     });*!/
     for (var i = 0; i < linkList.length; i++) {
     $('#item' + String(i)).css({
     top: (screenHeight / 2) * (Math.sin(-90 - 360 * (i + 1 / linkList.length) - ra / 100)) + screenHeight - screenWidth / (8 * 1.414),
     left: (screenWidth / 2) * (Math.cos(-90 - 360 * (i + 1 / linkList.length) - ra / 100)) + screenWidth / 2 - screenWidth / 8
     });
     }
     }


     function moveLeftItemsLooper() {
     radi++;
     drawLink(radi);
     clearTimeout(timer);
     timer = setTimeout(moveLeftItemsLooper, delay);
     }

     function moveRightItemsLooper() {
     radi--;
     drawLink(radi);
     clearTimeout(timer);
     timer = setTimeout(moveRightItemsLooper, delay);
     }


     //////////////////////////////////////////////////////

     */

    //DOM円回転ここまで


    /*
     製作段階で生まれたいらないソースコード終了
     */


})
;


