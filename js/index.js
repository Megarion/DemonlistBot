// @ts-check

// Initialize
$("body").hide();
$(".imgPopup").hide();

// Main code
jQuery(function() {
    // Start
    $("body").fadeIn(1000);

    $("img").on("click", function() {
        if ($(this).hasClass("imgInspect")) {
            $(".imgPopup").fadeIn(100);
            $(".imgPopup .content img").attr("src", $(this).attr("src"));
        } else if ($(this).attr("id") == "closePopup") {
            $(".imgPopup").fadeOut(100);
        }
    });
});