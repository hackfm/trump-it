io = require('socket.io').listen 8080

EventEmitter = require('events').EventEmitter

class Game extends EventEmitter
    constructor: ->
        console.log 'construct'
        @setMaxListeners 0

        @feature = @pickRandomFeature();

        # Game Timer
        setInterval @gameStart, 30000;

        @gameStart();

        # User List, fake for now
        @users = [
            {
                name: 'Davw'
                image: 'http://userserve-ak.last.fm/serve/64s/68728476.jpg'
                score: 14
            },
            {
                name: 'Marekventur'
                image: 'http://userserve-ak.last.fm/serve/64s/68293968.jpg'
                score: 10
            }
        ]

    gameStart: =>
        

        # Pick category
        @feature = @pickRandomFeature();

        # Send event
        @emit 'start', @feature
        console.log 'start', @feature

        # Wait for the game to end
        setTimeout =>
            @emit 'results', @users[0], {track: 'Down Under', artist: 'Men at Work', feature: @feature, value: 123}
            console.log 'results', @users[0], {track: 'Down Under', artist: 'Men at Work', feature: @feature, value: 123}
        ,15000

    getUsers: =>
        # TODO Sort
        return @users

    pickRandomFeature: =>
        return 'BPM'        

# Start the game
game = new Game();

# Sockets 
io.sockets.on 'connection', (socket) ->
    game.on 'start', (feature) ->
        socket.emit 'start', feature

    game.on 'results', (user, track) ->
        socket.emit 'results', user, track

    #socket.on 'my other event', (data) ->
    #    console.log data

# Less debug
io.set('log level', 1);