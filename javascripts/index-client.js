/**
 * Created by kyoshida on 15/04/30.
 */


$(function () {


    var createWindow = function (id, callback) {
        swb.transmitRequest({
            S: '.',
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
                                width: 1280,
                                height: 720
                            }
                        }
                    },
                    setting: {
                        url: 'http://apps.wisdomweb.net/swb/0.0.12/swb-setting.html?off'
                    },
                    preview: {
                        url: 'http://apps.wisdomweb.net/swb/0.0.12/swb-preview.html'
                    },
                    browser: {
                        url: 'http://localhost'
                    }
                }
            }
        });

    };


    $('#left_button').click(function () {
        var id = 'moving';
        console.log('fafaf');
        createWindow(id,
            function () {
                console.log('create!!');
                console.log(res);
                console.log(req);
                createWindow(id, function () {
                });
            });
        // window.location.href="../search";
    });

});
