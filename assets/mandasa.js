$(document).ready(function () {
    $(".heading_box_tab_columns .tab-item").on("click", function () {
        var current_tab = $(this);
        var current_tab_title = $(this).attr("data-tab-item");
        $(current_tab).closest('.tabs').find('.active').removeClass('active');
        $(current_tab).addClass('active');

        $(this).closest('.section-columns').find('.grid-item').each(function () {
            var tab_title = $(this).attr("tab-item");
            if(current_tab_title == 'All'){
                $(this).show();
            } else if (tab_title == current_tab_title) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});