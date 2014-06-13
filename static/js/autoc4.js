$(function(){
	Raphael.colorwheel($("#dmxcolorplenar") ,250).color("#F00");
	Raphael.colorwheel($("#dmxcolorwohnzimmer") ,250).color("#F00");
	Raphael.colorwheel($("#dmxcolorfnordcenter") ,250).color("#F00");

	$(".btn-light").click(function (e) {
		$(this).toggleClass("on");
	});
});
