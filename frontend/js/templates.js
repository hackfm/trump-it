var templates=function() {

    function trackElement(artist,title,image,value,feature,user) {
        var element = $("#templates .track").clone();
        element.find(".artist").text(artist);
        element.find(".title").text(title);
        element.find("img").attr("src",image);
        element.find(".display_score").text(feature+": "+value);
        element.data("score",value);
        if (user) {
            element.find('.user').show().text('choosen by '+user);
        }
        return element;
    }

    function userForLeaderboardElement(name,image,score) {
        var element = $("#templates .userForLeaderboard").clone();
        element.find(".score").text(score);
        element.find("img").attr("src",image);
        if (name.indexOf('guest_') == 0) {
            element.attr('href', '');
        }
        else
        {
            element.attr('href', 'http://www.last.fm/user/'+encodeURIComponent(name));
        }
        element.find("img").attr("alt",name);
        
        element.attr('title', name);
        return element;
    }
    
    return {
        "trackElement":trackElement,
        "userForLeaderboardElement":userForLeaderboardElement
    };  
}();
