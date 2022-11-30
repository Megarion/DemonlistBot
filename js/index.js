// Main code
jQuery(function() {
    $("img").on("click", function() {
        if ($(this).hasClass("imgInspect")) {
            $(".imgPopup").fadeIn(100);
            $(".imgPopup .content img").attr("src", $(this).attr("src"));
        } else if ($(this).attr("id") == "closePopup") {
            $(".imgPopup").fadeOut(100);
        }
    });
});