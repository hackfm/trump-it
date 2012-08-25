var templates=function() {

    function trackElement(artist,title,image,value) {
        var element = $("#templates .track").clone();
        element.find(".artist").text(artist);
        element.find(".title").text(title);
        element.find("img").attr("src",image);
        element.data("score",value);
        return element;
    }
    
    return {trackElement:trackElement};  
}();
