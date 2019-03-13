var i18n = {
    "MSG_WELCOME":{
        "es" : "Bienvenido a 24h app",
        "en" : "Welcome to 24h app"
    }
};


function scroll_to_class(element_class, removed_height) {
    var scroll_to = $(element_class).offset().top - removed_height;
    if($(window).scrollTop() != scroll_to) {
        $('html, body').stop().animate({scrollTop: scroll_to}, 0);
    }
}

function bar_progress(progress_line_object, direction) {
    var number_of_steps = progress_line_object.data('number-of-steps');
    var now_value = progress_line_object.data('now-value');
    var new_value = 0;
    if(direction == 'right') {
        new_value = now_value + ( 100 / number_of_steps );
    }
    else if(direction == 'left') {
        new_value = now_value - ( 100 / number_of_steps );
    }
    progress_line_object.attr('style', 'width: ' + new_value + '%;').data('now-value', new_value);
}

jQuery(document).ready(function() {

    /*
     Fullscreen background
     */
    $.backstretch("img/backgrounds/1.jpg");

    $('#top-navbar-1').on('shown.bs.collapse', function(){
        $.backstretch("resize");
    });
    $('#top-navbar-1').on('hidden.bs.collapse', function(){
        $.backstretch("resize");
    });

    /*
     Form
     */
    $('.f1 fieldset:first').fadeIn('slow');

    $('.f1 input, .f1 textarea').on('focus', function() {
        $(this).removeClass('input-error');
    });

    // next step
    $('.f1 .btn-next').on('click', function() {
        var parent_fieldset = $(this).parents('fieldset');
        var next_step = true;
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        // fields validation
        parent_fieldset.find('input, textarea').each(function() {
            if( $(this).val() == "" ) {
                $(this).addClass('input-error');
                next_step = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        // fields validation

        if( next_step ) {
            parent_fieldset.fadeOut(400, function() {
                // change icons
                current_active_step.removeClass('active').addClass('activated').next().addClass('active');
                // progress bar
                bar_progress(progress_line, 'right');
                // show next step
                $(this).next().fadeIn();
                // scroll window to beginning of the form
                scroll_to_class( $('.f1'), 20 );
            });
        }

    });

    // previous step
    $('.f1 .btn-previous').on('click', function() {
        // navigation steps / progress steps
        var current_active_step = $(this).parents('.f1').find('.f1-step.active');
        var progress_line = $(this).parents('.f1').find('.f1-progress-line');

        $(this).parents('fieldset').fadeOut(400, function() {
            // change icons
            current_active_step.removeClass('active').prev().removeClass('activated').addClass('active');
            // progress bar
            bar_progress(progress_line, 'left');
            // show previous step
            $(this).prev().fadeIn();
            // scroll window to beginning of the form
            scroll_to_class( $('.f1'), 20 );
        });
    });

    // submit
    $('.f1').on('submit', function(e) {

        var that = this;

        var next_step = true;

        // fields validation
        $(this).find('input, textarea').each(function() {
            if( $(this).val() == "" ) {
                $(this).addClass('input-error');
                next_step = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        // fields validation

        var data = {
            "user": $('#f1-username').val(),
            "email": $('#f1-email').val(),
            "name": $('#f1-first-name').val(),
            "surname": $('#f1-last-name').val(),
            "phoneNumber": $('#f1-phone').val(),
            "password": $('#f1-password').val()
        };

        if(next_step) {

            $.ajax({
                type: 'POST',
                url: './customers/signup',
                data: JSON.stringify(data),
                dataType: 'json',
                cache: false,
                contentType: 'application/json;charset=UTF-8'
            }).done(function (result) {
                $('#resultado_registro').text("Se ha registrado con éxito. Verifique el correo proporcionado y siga las instrucciones para verificar su cuenta.")
            }).fail(function (jqxhr, msg, status) {
                $('#resultado_registro').text("Error al crear la cuenta. Inténtelo de nuevo más tarde.")
            }).complete(function () {
                var parent_fieldset = $(that).find('fieldset');
                // navigation steps / progress steps
                var current_active_step = $(that).find('.f1-step.active');
                var progress_line = $(that).find('.f1-progress-line');
                parent_fieldset.fadeOut(400, function () {
                    // change icons
                    current_active_step.removeClass('active').addClass('activated').next().addClass('active');
                    // progress bar
                    bar_progress(progress_line, 'right');
                    // show next step
                    $(this).next().fadeIn();
                    // scroll window to beginning of the form
                    scroll_to_class($('.f1'), 20);
                });
            });
        }

        e.preventDefault();
        e.stopPropagation();
        return false;

    });


});


