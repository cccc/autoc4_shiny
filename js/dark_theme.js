(function(window, $){
    var $body = $("body");
    var searchParams = new URLSearchParams(window.location.search);

    if(searchParams.get('dark')!=null)
        $body.addClass("dark");
    $(function(){
        $body.on("click","[data-toggle=theme]",function(){
            if($body.hasClass("dark"))
                searchParams.delete("dark");
            else
                searchParams.set("dark","");
            window.location.search = searchParams.toString();
        });
    })
})(window, jQuery)