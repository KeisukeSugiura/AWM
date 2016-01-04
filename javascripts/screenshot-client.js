/**
 * Created by kyoshida on 15/05/29.
 */
$(function () {
    var screenHeight = screen.height;
    var screenWidth = screen.width;
    swb.initialize(function () {
        swb.position({
            x: -screenWidth,
            y: -screenHeight,
            height: screenHeight / 3,
            width: screenWidth / 3
        }, function () {

        });

    });

    var telepath = new TelepathyClient();
    telepath.on('connect', function (event) {
        telepath.hello({from: 'screenshotter'}, function (req, res) {
            if (res.status == 200) {
                // telepath.send({to: 'screenShotter', body: {text: 'hello world'}});
            }
        });
    });

    telepath.on('message', function (message) {


        /*
         swb.transmitRequest({
         S: '.',
         D: '/root/private/screenshotter',
         C: 'set-properties',
         P: {
         value: {
         browser: {
         url: message.url
         }
         }
         }
         }, function (request, response){*/
        swb.transmitRequest({
            D: '..',
            C: 'screenshot',
            P: {
                value: {
                    left: -100,
                    top: screenHeight + 100 - screenHeight / 3,
                    width: screenWidth / 3,
                    height: screenHeight / 3,
                    type: 'image/jpeg'
                }
            }
        }, function (requet, response) {
            var dataurl = response.P.value.data;
            // console.log(dataurl);
            var image = new Image();
            image.style.border = '1px solid red';
            image.onload = function () {
                swb.transmitRequest({
                    D: '/root/private/refer/setting',
                    C: 'resultShot',
                    P: {
                        img: dataurl,
                        num: message.num
                    }
                }, function (req, res) {
                    console.log(res.text);
                });


                //document.body.appendChild(image);
                telepath.send({to: 'searcher', body: {act: 'screenshot', img: dataurl, num: message.num}})
            }
            image.src = dataurl;
        });
   // });

    console.log(message.body.text);
     });


    swb.handleRequest('getS', function (req) {
        console.log('request');
        swb.transmitResponse(req, {P: {respon: 'respon'}});
        /*swb.transmitRequest({
         S: '.',
         D: '..',
         C: 'set-properties', P: {
         value: {
         browser: {
         url:req.P.url
         }
         }
         }
         }, function (request, response){
         swb.transmitRequest({
         S:'.',
         D: '..',
         C: 'screenshot',
         P: {
         value: {
         left: 0,
         top: 0,
         width: screenWidth / 3,
         height: screenHeight / 3,
         type: 'image/jpeg'
         }
         }
         }, function (requet, response) {
         var dataurl = response.P.value.data;
         // console.log(dataurl);
         var image = new Image();
         image.style.border = '1px solid red';
         image.onload = function () {
         //          swb.transmitResponse(req,{P: {value:{respon:'respon'}}});


         //     document.body.appendChild(image);
         //   telepath.send({to: 'searcher', body: {act:'screenshot',img: image, num: message.num}})
         }
         image.src = dataurl;
         });
         });*/

    });

    telepath.connect('ws://apps.wisdomweb.net:64260/ws/mik', 'kyoshida', 'Pad:5538');


});