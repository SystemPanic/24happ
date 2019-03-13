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

    // submit
    $('.f1').on('submit', function(e) {

        var that = this;

        var valid = true;

        // fields validation
        $(this).find('input').each(function() {
            if( $(this).val() == "" ) {
                $(this).addClass('input-error');
                valid = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        // fields validation

        var data = {
            "user": $('#f1-username').val(),
            "password": $('#f1-password').val()
        };

        if(valid) {
            $.ajax({
                type: 'POST',
                url: './customers/signin',
                data: JSON.stringify(data),
                dataType: 'json',
                cache: false,
                contentType: 'application/json;charset=UTF-8'
            }).done(function (result) {
                location.href="./service/controlPanel";
            }).fail(function (jqxhr, msg, status) {
                alert("Usuario / Contraseña erroneos");
            });
        }

        e.preventDefault();
        e.stopPropagation();
        return false;

    });

});


