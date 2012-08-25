function shuffle(v){
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
}

var SOCKET_IO_ADDR = 'http://ec2-46-137-143-82.eu-west-1.compute.amazonaws.com:8080';
var socket;

$(function() {
    
    function selectTracks(tracklist, category, callback) {
        selectedTracks=[tracklist.pop(),tracklist.pop(),tracklist.pop()];
        startRound(selectedTracks,category);
    }
    
    function startRound(selectedTracks,category) {
        $("article").hide();
        $("#mainscreen").show();

        countdown($('.countdown_game'), 15);
        
        $("#round_description").html(features.getDescription(category.feature,category.parity=="-"));
        
        $("#tracks").empty();
        $.each(selectedTracks, function(i, trk) {
            $("#tracks").append(templates.trackElement(trk.artist,trk.track,trk.image,trk.features[category.feature],category.feature));
        });
        $("#tracks").find(".track").click(function() {
            var title = $(this).find(".title").text();
            var artist = $(this).find(".artist").text();
            var value = $(this).data("score");
            var image = $(this).find("img").attr("src");
            $("#tracks").find(".track").not(this).fadeOut("slow");
            $(this).find(".display_score").fadeIn("fast");
            socket.emit("pick", 
                {
                  "artist":artist,
                  "title":title,
                  "image":image,
                  "value":value,
                  "feature":category.feature
                },
                value);
            console.log("track_click", artist,title,value);
        });


    }
    

    var tracksWithData=[];
    function fetchFeatures(topTracks) {
        if (topTracks.length==0) {
            return;
        }
        var trk=topTracks.pop();
        features.getFeatures(trk.artist,trk.track, function(feat) {
            if (feat!=null) {
                tracksWithData.push($.extend({},trk,{features: feat}));
            }
            fetchFeatures(topTracks);
        });
    }

    function showResults(winners, users) {
        if ($('#mainscreen').is(':visible')) {
            $('#mainscreen').hide();
            if (winners.length > 0) {
                var winner = winners[0];
                $('#winner').show();
                $('#winning_user img').attr('src', winner.image);
                $('#winning_user .username').text(winner.name);
                var $tracklist = $('#winner .track_container').empty();

                var len = winners.length;
                for (var i=0; i<len; i++) {
                    if (i > 0) {
                        var element = templates.trackElement(
                            winners[i].track.title, 
                            winners[i].track.artist,
                            winners[i].track.image, 
                            winners[i].track.value, 
                            winners[i].track.feature,
                            winners[i].name
                        );
                    }
                    else
                    {
                        var element = templates.trackElement(
                            winners[i].track.title, 
                            winners[i].track.artist,
                            winners[i].track.image, 
                            winners[i].track.value, 
                            winners[i].track.feature
                        );
                    }

                    element.addClass('winner'+(i+1));

                    $tracklist.append(element);
                }
                    
                $('#winner .track_container .display_score').show();
                countdown($('.countdown_winner'), 15);
            }
            else
            {
                $('#no_winner').show();
                countdown($('.countdown_no_winner'), 15);
            }

            
        }
    }

    function countdown($element, time) {
        var timeLeft = time;
        var frameCountdown = function() {
            $element.text(timeLeft);
            if (timeLeft > 0) {
                timeLeft--;
                setTimeout(frameCountdown, 1000);
            }
        }
        frameCountdown();

    }

    function updateLeaderboard(users) {
        var $footer = $('footer').empty();
        var len = users.length;
        for (var i=0; i<len; i++) {
            var user = users[i];
            $footer.append(templates.userForLeaderboardElement(user.name, user.image, user.score));
        }    
    }
    function start(tt,username,image) {
        // We only need to connect after all that data-stuff is sorted 
        socket = io.connect(SOCKET_IO_ADDR);
        socket.on('connect', function() {
            socket.emit('join', {"name": username, "image": image});

            $('#spinner_text').text('Please wait for the next round to start...');

            var topTracks = shuffle(tt);
            fetchFeatures(topTracks);
            socket.on('start', function (feature,parity) {
                var category = {"feature":feature, "parity":parity};
                if (tracksWithData.length<3) return;
                console.log('start');
                selectTracks(tracksWithData, category);
            });

            socket.on('results', function (winners, users) {
                console.log('result', winners, users);
                showResults(winners, users);
            });

            socket.on('users', function (users) {
                console.log('users, count:', users)
                updateLeaderboard(users);
            });

            socket.on('removeUser', function (usernameRemoved) {
                console.log('removeUser:', usernameRemoved)
                if (username == usernameRemoved) {
                    window.location.reload()
                }
            });

            socket.on('preview', function (url) {
                //Audio
                console.log('preview', url);
                $('#preview_audio').attr('src', url).get(0);
            });

            socket.on('previewPlay', function () {
                console.log('previewPlay');
                $('#preview_audio').get(0).play();
            });

            socket.on('disconnect', function() {
                // window.location.reload();
            });
        });
    }
    
    function logInLastfm() {
        // Start spinner
        $('#login_form_container').hide();
        $('#login_spinner').show();

        var username=$("#username").val();

        // TODO: Add "wrong-username"-callback
        lastfm.getUserImage(username, function(image) {
            lastfm.getTopTracks(username, function(tt) {
                start(tt,username,image);
            });
        });
        return false;
    }
    
    function logInAnon() {  // Start spinner
        $('#login_form_container').hide();
        $('#login_spinner').show();
        
        var username="Guest_"+ Math.floor(Math.random()*2000);
        var image = "http://placekitten.com/g/64/64";
        
        lastfm.getGlobalTracks(function(tt) {
            start(tt,username,image);
        });
    }
    
    
    $("#login_form").submit(function() {
        logInLastfm();
        return false;
    });
    
    $("#anon_button").click(function() {
        logInAnon();
    });
    
    $("#login").show();
    $("#mainscreen").hide();

});
