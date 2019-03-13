var userLocation = null;

$(document).ready(function(){

    fillSearchOptions();


    $.('.form').submit(function(){
        doFormUpload();
    });

});

function fillSearchOptions(){

}

function doSearch(){
    var machineType;
    var aProducts;
    var aFeatures;

    if(!location) {

        return;
    }

    $.ajax("", {

    })
        .done(function(data){
            processSearchResults(data)
        })
        .fail(function(jqXHR, textStatus, errorThrown){

    });


}

function processSearchResults(data){

}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setLocation, locationError);
    } else {
        $('.modal-body').html("La localización no está soportada por tu navegador.");
        $('#errorModal').modal();
    }
}

// Lat Long
function setLocation(location) {
    userLocation[0] = location.coords.latitude;
    userLocation[1] = location.coords.longitude;
}

function locationError(error) {
    var errorToPrint;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            //User denied the request for Geolocation.
            errorToPrint = "El usuario ha denegado la geolocalización. <br/><br/>Recuerda que tu navegador guarda la elección que previamente has hecho sobre proveer o no la localización a este servicio y la recordará para todas las veces que intentes entrar hasta que lo vuelvas a permitir.";
            break;
        case error.POSITION_UNAVAILABLE:
            //Location information is unavailable.
            errorToPrint = "La información de geolocalización no está disponible. Por favor, comprueba tu conexión a internet y el estado de los servicios de geolocalización (dispositivos móviles) y vuélvelo a intentar de nuevo. <br/><br/> Si el error persiste, por favor, revisa si has revocado el permiso de acceso a la geolocalización a este servicio desde el navegador";
            break;
        case error.TIMEOUT:
            //The request to get user location timed out.
            errorToPrint = "La petición a tu dispositivo de proveer tu geolocalización a este servicio a caducado. Inténtelo de nuevo.";
            break;
        case error.UNKNOWN_ERROR:
            errorToPrint = "Ha sucedido un error inesperado. Por favor, comprueba tu conexión a internet y el estado de los servicios de geolocalización (dispositivos móviles) y vuélvelo a intentar de nuevo. <br/><br/> Si el error persiste, por favor, revisa si has revocado el permiso de acceso a la geolocalización a este servicio desde el navegador"
            break;
    }

    $('.modal-body').html(errorToPrint);
    $('#errorModal').modal();
}

