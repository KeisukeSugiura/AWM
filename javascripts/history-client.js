/**
 * Created by kyoshida on 15/05/31.
 */
$(function () {
    var telepath = new TelepathyClient();
    var url_list = new Array();
    swb.initialize(function () {
        swb.level(20, function () {
            /*
             Telepathyサーバ
             */


            telepath.on('connect', function (event) {
                telepath.hello({from: 'history'}, function (req, res) {
                    if (res.status == 200) {
                        //          telepath.send(({to: 'searcher', body: {act: 'test', text: 'hello world'}}));


                        telepath.get({key: 'history'}, function (req, res) {
                            var result = res.value;
                            var ary = new Array();

                            //console.log(result);
                            console.log(result.length);
                            //[{title,img,url},{title,img,url}]
                            for (var i = 0; i < result.length; i++) {
                                var aphtml = '';
                                aphtml += '<div id="his' + String(i) +
                                    '"><h2 class="h2" style="color: white;">' + result[i].url +
                                    '</h2><img src="' + result[i].img +
                                    '">' +
                                    '</div>';
                                $('#list').append(aphtml);
                                url_list.push(result[i].url);

                                ary.push(i);
                            }
                            ary.forEach(function (element, index, arr) {
                                $('#his' + String(element)).click(function () {
                                    //TODO クリエイトれいやーする
                                    window.location.href = url_list[element];
                                    console.log(element);
                                    console.log(url_list[element]);
                                });
                            });


                        });
                    }
                });
            })
        });

        telepath.on('message', function (message) {

        });


        telepath.on('result', function (message) {


        });

        telepath.connect('ws://apps.wisdomweb.net:64260/ws/mik', 'kyoshida', 'Pad:5538');


        /*
         Telepathyサーバ終了
         */


    });


    $('#back').click(function () {
        backHomeLayer();
    });


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


});