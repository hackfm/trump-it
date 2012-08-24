io = require('socket.io').listen 80
EventEmitter = require('events').EventEmitter

class Game extends EventEmitter
    contructor: ->
        @setMaxListeners 0

        @feature = @pickRandomFeature();

        # Game Timer
        setInterval =>
            # Pick category
            @feature = @pickRandomFeature();

            # Send event
            @emit 'start', @feature

            # Wait for the game to end
            setTimeout =>
                @emit 'results', @users[0], {track: 'Down Under', artist: 'Men at Work', feature: @feature, value: 123}
            ,15
        , 30;

        # User List, fake for now
        @users = [
            {
                name: 'Davw'
                image: 'http://userserve-ak.last.fm/serve/126s/68728476.jpg'
                score: 14
            },
            {
                name: 'Marekventur'
                image: 'http://userserve-ak.last.fm/serve/126s/68293968.jpg'
                score: 10
            }
        ]

    getUsers: =>
        # TODO Sort
        return @users

    pickRandomFeature: =>
        return 'BPM'        

game = new Game();

# Sockets 
io.sockets.on 'connection', (socket) ->
    game.on 'start', (feature)->
        socket.emit 'start', feature

    game.on 'results', (user, track)->
        socket.emit 'results', user, track

    #socket.on 'my other event', (data) ->
    #    console.log data
