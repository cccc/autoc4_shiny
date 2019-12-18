// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

(function(window, $){
    let $body = $("body");
    try{
        if(localStorage.getItem("DARK_THEME_ENABLED")==="true")
            $body.addClass("dark");
    } catch {
        let searchParams = new URLSearchParams(window.location.search);
        if(searchParams.get('dark')!=null)
            $body.addClass("dark");
    }
        
    $(function(){
        $body.on("click","[data-toggle=theme]",function(){
            try{
                localStorage.setItem("DARK_THEME_ENABLED",localStorage.getItem("DARK_THEME_ENABLED")==="true"?"false":"true");
                $body.toggleClass("dark");
            } catch {
                let searchParams = new URLSearchParams(window.location.search);
                if($body.hasClass("dark"))
                    searchParams.delete("dark");
                else
                    searchParams.set("dark","");
                window.location.search = searchParams.toString();
            }
        });
    })
})(window, jQuery)