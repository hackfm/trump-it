$(function() {
    var socket = io.connect('http://ec2-46-137-143-82.eu-west-1.compute.amazonaws.com:8080',
        function() {
            console.log('connected');
        });

    socket.on('start', function (category) {
        console.log('start', category);
    });

    socket.on('results', function (track, user) {
        console.log('result', track, user);
    });
});
