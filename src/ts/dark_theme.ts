/**
 * @description A simple script adding a "dark" class to the body
 * if certain conditions are met. Can be used for creating a dark
 * mode based on SearchParams and LocalStorage. 
 * @author Necro
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */

(function(window, $){
    let $body = $("body");
    let searchParams = new URLSearchParams(window.location.search);
    const LSKEY = "DARK_THEME_ENABLED";

    try{
        if(searchParams.get('dark')!=null){
            localStorage.setItem(LSKEY, "true");
            $body.addClass("dark");
        }else if(searchParams.get('light')!=null){
            localStorage.setItem(LSKEY, "false");
            $body.removeClass("dark");
        }
        if(localStorage.getItem("DARK_THEME_ENABLED")==="true")
            $body.addClass("dark");
        else
            $body.removeClass("dark");
    } catch {
        if(searchParams.get('dark')!=null)
            $body.addClass("dark");
        else
            $body.removeClass("dark");
    }
        
    $(function(){
        $body.on("click","[data-toggle=theme]",function(){
            try{
                localStorage.setItem("DARK_THEME_ENABLED",localStorage.getItem("DARK_THEME_ENABLED")==="true"?"false":"true");
                $body.toggleClass("dark");
            } catch {
                if($body.hasClass("dark")){
                    searchParams.delete("dark");
                    searchParams.set("light","");
                }else{
                    searchParams.delete("light");
                    searchParams.set("dark","");
                }
                window.location.search = searchParams.toString();
            }
        });
    })
})(window, jQuery)