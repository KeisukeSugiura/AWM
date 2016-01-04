$(function () {
    var telepath = new TelepathyClient();
    var url_list = new Array();
    var favorites = new Array();
    var web_setting_layer = "http://localhost:50000/ui/browse";
    var makeLayerLeft = screen.width / 2 + 15;
    var makeLayerTop = screen.height / 10;
    var makeLayerWidth = screen.width * 2 / 5;
    var makeLayerHeight = screen.height * 4 / 5;
    var dragOnX = 50;
    var dragOnY = 50;
    var layer_id = 'layer00';
    var home_layer_id;
    var myId='';
    var manageLayer_id;
    var thumbnailsLayer_id=null;
    var thumbnailList = {};//idで登録してく,
    
    //var screenEdgeMap = [];
    var sendThumbnailIndex = 0;

    /*
        thumbnailContext={
            id
            img
            url
            width
            height
        }
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

    var hiddenFlg = true;

    swb.initialize(function () {
        swb.transmitRequest({
            S: swb.currentPath,
            D: '../',
            C: 'set-properties',
            P: {
                value: {
                    browser: {
                        level:20,
                        alphaValue: 0.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false,
                        //level: -2147483623
                    },
                    setting: {
                        level: 20,
                        alphaValue:1.0
                        //alphaValue:0.5
                    },
                    movable: {
                        level: 20,
                        frame: {
                            origin: {
                                x: 0,
                                y: 0
                            },
                            size: {
                                width: 300,
                                height: screen.height
                            }
                        },
                        alphaValue: 0.0,
                        ignoresMouseEvents: true,
                        movableByWindowBackground: false,
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
                        //console.error(res);
                        myId=res.P.value.id;
                    /*
                     Telepathyサーバ
                     */
                    telepath.on('connect', function (event) {


                        telepath.hello({from:'boardLayer'}, function (req, res) {
                            if (res.status == 200) {
                                // telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));

                            telepath.get({key: 'manageLayer'}, function (req, res) {
                                    manageLayer_id = res.value;
        
                                });
                            }

                        });
                    });

                    telepath.on('message', function (message) {
                        if (message.body.act == 'call') {
                            fowardLayerLevel(function () {
                            });
                        }

                        if(message.body.act == 'addThumbnail'){
                            setBoardItem(message.body.thumbnail);
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

                        if(message.body.act == 'switch_show_hidden'){
                            switchShowHidden();
                        }

                        if(message.body.act == 'showClippingOnFoot'){
                            sendImageOnFootSwitch();
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

    function setBoardItem(thumbnail){
        //url,img,idのサムネイルをサムネイルボードにセット
        //thumbnail={id,url,img}
        //var boardElm = document.getElementById('thumbnail_board');
        console.log(thumbnail);

        thumbnailList[thumbnail.id] = thumbnail;

        var addImg = new Image();
        addImg.onload = function(e){

            if(addImg.width > $('#thumbnail_board').width()){

                addImg.height = addImg.height * ($('#thumbnail_board').width() / addImg.width );
                addImg.width = $('#thumbnail_board').width();
            }
            addImg.className = 'thumbnail';
            //addImg.style.position = 'absolute';
            addImg.id = thumbnail.id;

            $('#thumbnail_board').append(addImg);
            console.log(thumbnail.id);
            console.log(addImg.id);            
            $('#'+thumbnail.id).css({'opacity':0.5});
            if(hiddenFlg){
                $('#'+thumbnail.id).css({'visibility':'hidden'});
            }else{
                $('#'+thumbnail.id).css({'visibility':'visible'});
            }
            $('#'+thumbnail.id).dblclick(function(e){
                telepath.send({to:manageLayer_id,body:{url:thumbnail.url,act:'createWindow'}},function(req,res){

                });
            });
            $('#'+thumbnail.id).draggable({
                start:function(e,ui){

                        var ix = $('#'+thumbnail.id).offset().left;
                        var iy = $('#'+thumbnail.id).offset().top;
                        dragOnX = e.pageX - ix;
                        dragOnY = e.pageY - iy;

                    swb.transmitRequest({
                        S: swb.currentPath,
                        D: '../',
                        C: 'set-properties',
                        P: {
                            value:{
                                movable: {
                                    frame: {
                                        size: {
                                            width: screen.width,
                                            height: screen.height
                                        }
                                    }
                                }
                            }
                        }
                    }, function (req, res) {
                        //console.error('aaaa');
                        // var dragId = ui.draggable.attr("id");
                        // var ix = $('#'+dragId).css('left')+ $(window).scrollLeft();
                        // var iy = $('#'+dragId).css('top')+ $(window).scrollTOp();
                        // dragOnX = e.pageX - ix;
                        // dragOnY = e.pageY - iy;

              
                    });
            //         var dropArea = document.createElement('div');
            //         dropArea.style.height = screen.height;
            //         dropArea.style.width = screen.width-300;
            //         dropArea.style.top = 0;
            //         dropArea.style.left = 300;
            //         dropArea.id = 'dropArea';
            //         document.getElementById('main_board').appendChild(dropArea);
            //         $('#dropArea').droppable({
            //             drop:function(e,ui){
            //                 console.log('aaa');
            //                 var dragId = ui.draggable.attr("id");
            //                 var image = document.getElementById(dragId);
            //                 var canvas = document.createElement('canvas');
            //                 canvas.getContext('2d').drawImage(image,0,0);
            //                 var sendObj = {
            //                     id:dragId,
            //                     img:canvas.toDataURL('image/png'),
            //                     left:$('#'+dragId).offset().left,
            //                     top:$('#'+dragId).offset().top,
            //                     width:$('#'+dragId).attr().width,
            //                     height:$('#'+drag).attr().height,
            //                     act:'addImage'                            
            //                 }
            //                 if(thumbnailsLayer_id == null){
            //                     telepath.get({key:'thumbnailsLayer'},function(req,res){
            //                         thumbnailsLayer_id = res.value;     
            //                         telepath.send({to:thumbnailsLayer_id,body:sendObj},function(req,res){
            //                             $('#dropArea').remove();
            //                         });
            //                     });
            //                 }else{
            //                     telepath.send({to:thumbnailsLayer_id,body:sendObj},function(req,res){
            //                         $('#dropArea').remove();
            //                     });
            //                 }

            //             }
            //         });
            //     },
            //     helper:'clone',
            //     appendto:'#dropArea'
                },
                helper:function(){
                    var ii = thumbnailList[thumbnail.id];
                   return $('#'+thumbnail.id).clone().attr({'height':ii.height,'width':ii.width});
                },
                appendto:'#dropArea'
            });
        }
        addImg.src = thumbnail.img;



        
    }

    $('#dropArea').css({
        width:screen.width-300,
        height:screen.height
    });

    $('#dropArea').droppable({
            drop:function(e,ui){

                        //console.error('aaaa');
                        var dragId = ui.draggable.attr("id");
                        var image = document.getElementById(dragId);
                        console.log(dragId);
                        var canvas = document.createElement('canvas');
                        canvas.width = thumbnailList[dragId].width;
                        canvas.height = thumbnailList[dragId].height;
                        canvas.getContext('2d').drawImage(image,0,0,thumbnailList[dragId].width,thumbnailList[dragId].height);
                        //console.log(canvas.toDataURL('image/png'));
                        //console.log('abc');
                        //console.error($('#'+dragId).width());
                       // console.error($('#'+dragId).offset().left);
                        var sendObj = {
                            id:dragId,
                            img:canvas.toDataURL('image/png'),
                            left:e.screenX-dragOnX,
                            top:e.screenY-dragOnY,
                            width:thumbnailList[dragId].width,
                            height:thumbnailList[dragId].height                            
                        };
                        // if(thumbnailsLayer_id == null){
                        //    // telepath.get({key:'thumbnailsLayer'},function(req,res){
                        //         thumbnailsLayer_id = res.value;     
                        //         console.log(thumbnailsLayer_id);
                        //         telepath.send({to:thumbnailsLayer_id,body:sendObj},function(req,res){
                        //            // $('#dropArea').remove();
                        //             console.log(thumbnailsLayer_id);
                        //         });
                        //     //});
                        // }else{
                        //    // telepath.send({to:thumbnailsLayer_id,body:sendObj},function(req,res){
                        //         //$('#dropArea').remove();
                            
                        //    // });
                        //}
                        telepath.send({to:'thumbnailsLayer',body:{act:'addImage',thumbnail:sendObj}},function(req,res){
                                //$('#dropArea').remove();
                            //console.error('thumbnailsLayer');    
                            //console.error(sendObj) 
                             swb.transmitRequest({
                        S: swb.currentPath,
                        D: '../',
                        C: 'set-properties',
                        P: {
                            value:{
                                movable: {
                                    frame: {
                                        size: {
                                            width: screen.width,
                                            height: screen.height
                                        }
                                    }
                                }
                            }
                        }
                    }, function (req, res) {
                       
              
                    });           
                        });    
            },
        helper:'clone',
        accept:'.thumbnail'
    });

  

    $('#switch_board').click(function(e){
         if(hiddenFlg){
            $('.thumbnail').css({'visibility':'visible'});
            document.getElementById('switch_board').className='btn btn-material-deep-purple btn-fab btn-raised mdi-action-history';
            hiddenFlg=false;
        }else{
            $('.thumbnail').css({'visibility':'hidden'});
            document.getElementById('switch_board').className='btn btn-material-purple btn-fab btn-raised mdi-action-history';

            hiddenFlg=true;
        }
    });


    function sendImageOnFootSwitch(){
        if(Object.keys(thumbnailList).length == 0){

        }else{
            var listArray = Object.keys(thumbnailList);
            var sendThumbnailId = listArray[sendThumbnailIndex];
            var sendThumbnailContext = thumbnailList[sendThumbnailId];
            var sendObj = {
                            id:sendThumbnailId,
                            img:sendThumbnailContext.img,
                            width:thumbnailList[sendThumbnailId].width,
                            height:thumbnailList[sendThumbnailId].height                            
            };


            telepath.send({to:'thumbnailsLayer',body:{act:'semiAutoImageSet',thumbnail:sendObj}},function(req,res){
                sendThumbnailIndex++;
                if(sendThumbnailIndex >= Object.keys(thumbnailList).length){
                    sendThumbnailIndex = 0;
                }
            });    
        }

    }


     // var test = {
     //     img:'../../images/ahiru.jpg',
     //     id:'ahiruahiru',
     //     url:'http://google.com',
     //     width:300,
     //     height:300
     // }
     // setBoardItem(test);




    
});