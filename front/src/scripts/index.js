
let articulos = [];

$(document).ready(function () {


    // Borra y recarga abl con el maestro de apuestas. 
    function refrescarListado() {

        $.get("http://my-json-server.typicode.com/desarrollo-seguro/dato/solicitudes", // Esto queda por la implementación de parcel?
            function (result) {

                $.get("http://localhost:1234/api/partidos", function (data) {

                    console.log(data);
                    let $padre = $('#listado');
                    let $maestro = $("maestro");

                    $padre.empty();

                    data.forEach(x => {
                        console.log("Processing item:", x);
                        let $linea = $('<tr>');

                        articulos.push({ id: x.id, nombre: x.nombre });
                        $linea.append($('<td class="renglon mt-3 md-3" style=display:none>').text(x.id));
                        $linea.append($('<td class="renglon mt-3 md-3">').text(x.nombre));
                        $linea.append($('<td class="renglon mt-3md-3">').text(x.descripcion));
                        $linea.append($('<td class="renglon mt-3md-3 text-right">').text(x.deporte));
                        $linea.append($('<td class="renglon mt-3md-3 text-right">').text(x.resultado));
                        $linea.append($('<td class="renglon mt-3md-3 text-right">').text(x.apuesta.toFixed(2)));
                        $linea.append($('<td class="text-center">').append($(`<button class="btn btn-success btn-lg botonera text-center boton_gana">Gana
                                </button><button class="btn btn-info btn-lg botonera boton_pierde">Pierde</button>
                                </button><button class="btn btn-warning btn-lg botonera boton_edicion">Editar</button>
                                </button><button class="btn btn-danger btn-lg botonera boton_baja">Borrar</button>
                                `)));

                        $padre.append($linea);

                    });

                    escondeDetalles();
                    $maestro.show();
                    $padre.show();

                    console.log(articulos);

                }).fail(function () {

                    console.log("Error");
                });

            });

        window.refrescarListado = refrescarListado;


    };

    //Esconde todos los detalles. Llamada por todos los procesos de invocado de detalle para luego solo llamar
    //el que interesa a la operación. 
    function escondeDetalles() {

        $("#edicion").hide();
        $("#nuevo").hide();
        $("#editaapuesta").hide();

        window.escondeDetalles = escondeDetalles;

    }

    refrescarListado();

    // Refresca el detalle
    $("#boton_lista").on("click", function (event) {
        event.preventDefault();
        refrescarListado();

    });


    // Definiciones de eventos. (Clicks)

    $(document).ready(function () {

        // Accionar del botón de Gana.  
        $(document).on("click", ".boton_gana", function (event) {
            event.preventDefault();

            let $row = $(event.target).closest('tr');
            let id = $.trim($row.find('td').eq(0).text());

            if (!id) {
                console.error("No se encontró un ID válido en la fila.");
                alert("No se encontró un ID válido.");
                return;
            }

            $.ajax({
                url: `http://localhost:1234/api/partidos/${id}/gana`,
                type: "POST",
                success: function (response) {
                    console.log("Ha cambiado el valor del resultado: " + response);
                    refrescarListado();
                },
                error: function (xhr, status, error) {
                    console.error("Ha habido un problema en registrar el cambio: " + xhr.responseText);
                    alert("Ha habido un problema en registrar el cambio: " + xhr.responseText);
                }
            });
        });

    });

    // Accionar del botón de pierde.  
    $(document).on("click", ".boton_pierde", function (event) {
        event.preventDefault();

        let $row = $(event.target).closest('tr');
        let id = $.trim($row.find('td').eq(0).text());

        if (!id) {
            console.error("No se encontró un ID válido en la fila.");
            alert("No se encontró un ID válido.");
            return;
        }

        $.ajax({
            url: `http://localhost:1234/api/partidos/${id}/pierde`,
            type: "POST",
            success: function (response) {
                console.log("Ha cambiado el valor del resultado: " + response);
                refrescarListado();
            },
            error: function (xhr, status, error) {
                console.error("Ha habido un problema en registrar el cambio: " + xhr.responseText);
                alert("Ha habido un problema en registrar el cambio: " + xhr.responseText);
            }
        });
    });


    // Habilita los controles para la edición de los valores de un registro. 
    $('#listado').on("click", ".boton_edicion", function (event) {
        event.preventDefault();

        let $row = $(this).closest('tr');
        let edicionId = $row.find('td').eq(0).text();
        let edicionPartido = $row.find('td').eq(1).text();
        let edicionDescripcion = $row.find('td').eq(2).text();
        let edicionDeporte = $row.find('td').eq(3).text();
        let edicionResultado = $row.find('td').eq(4).text();
        let edicionApuesta = $row.find('td').eq(5).text();

        escondeDetalles();
        let $edicion = $("#edicion").show();

        $("#id_edicion").val(edicionId);
        $("#partido_edicion").val(edicionPartido);
        $("#descripcion_edicion").val(edicionDescripcion);
        $("#deporte_edicion").val(edicionDeporte);
        $("#resultado_edicion").val(edicionResultado);
        $("#apuesta_edicion").val(edicionApuesta);

    });

    // Graba los datos editados.
    $("#boton_graba_edicion").on("click", function (event) {

        event.preventDefault();

        let $precio = $("#edicion");
        let edicionId = Number($("#id_edicion").val());
        let edicionPartido = $("#partido_edicion").val();
        let edicionDescripcion = $("#descripcion_edicion").val();
        let edicionDeporte = $("#deporte_edicion").val();
        let edicionResultado = Number($("#resultado_edicion").val());
        let edicionApuesta = parseFloat($("#apuesta_edicion").val());

        if (edicionPartido.length > 0 &&
            edicionDescripcion.length > 0 &&
            edicionDeporte != "" &&
            edicionApuesta > 0.00) {

            if(edicionResultado == "") {

                edicionResultado = 0;
            }   

            let envio = { id: edicionId, nombre: edicionPartido, descripcion: edicionDescripcion, 
                         deporte: edicionDeporte, resultado: edicionResultado, apuesta: edicionApuesta};
            $.ajax({
                url: 'http://localhost:1234/api/partidos/' + edicionId,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(envio),
                success: function (result) {
                    console.log('Respuesta: ' + result);
                    $precio.hide();
                    refrescarListado();
                },
                error: function (xhr, status, error) {
                    let tipoError = JSON.parse(xhr.responseText);
                    console.log('Error: ' + error);
                    alert('Error: ' + error + ". " + tipoError.errors[0].objectName + ": "+ tipoError.errors[0].rejectedValue);
                }
            });
        } else {

            if (edicionDescripcion.length == 0 ||
                edicionPartido.length == 0 || 
                edicionDeporte == "" || 
                edicionResultado == "") {

                alert("Todos los campos deben ser completados.");

            } else {

                alert("Apuesta no puede ser 0 o menor.")
            }

        }
    });

    // Cancela operación de cambio de precio. Borra el detalle y refresca el maestro. 
    $("#boton_cancela_edicion").on("click", function (event) {
        event.preventDefault();
        escondeDetalles();
    });


    // Dar de baja una apuesta. 
    $('#listado').on("click", ".boton_baja", function (event) {

        event.preventDefault()

        let $row = $(this).closest('tr');
        let Id = $row.find('td').eq(0).text();

        console.log("Id es: " + Id);

        if (confirm("Está seguro de que desea BORRAR este registro?")) {
            $.ajax({
                url: 'http://localhost:1234/api/partidos/' + Id,
                method: "DELETE",
                contentType: "application/json",
                success: function (result) {

                    console.log("Resultado del borrado: " + result)

                },
                error: function (xhr, status, error) {

                    console.log("No se ha podido borrar el registro: " + error)

                }
            });
        } else {
            console.log("Operación de borrado cancelada.");
        }

        refrescarListado();

    });


    // Muestra los controles de detalle para la carga de datos del registro a dar de alta. 
    $("#boton_nuevo").on("click", function (event) {
        event.preventDefault();
        escondeDetalles();
        $("#nuevo").show();

    });


    // Graba los datos del registro a dar de alta de una apuesta. 
    $("#boton_graba_nuevo").on("click", function (event) {
        event.preventDefault();

        let partido_nuevo = $("#partido_nuevo").val();
        let descripcion_nuevo = $('#descripcion_nuevo').val();
        let deporte_nuevo = $('#deporte_nuevo').val();
        let resultado_nuevo = $('#resultado_nuevo').val();
        let apuesta_nuevo = $("#apuesta_nuevo").val();

        if (partido_nuevo != "" &&
            descripcion_nuevo != "" &&
            deporte_nuevo != "" &&
            resultado_nuevo != "" &&
            apuesta_nuevo >= 0 &&
            apuesta_nuevo > 0) {

            let envio = {
                id: 0,
                nombre: partido_nuevo,
                descripcion: descripcion_nuevo,
                deporte: deporte_nuevo,
                resultado: parseInt(resultado_nuevo),
                apuesta: parseFloat(apuesta_nuevo)
            };

            console.log(JSON.stringify(envio));

            $.ajax({
                url: 'http://localhost:1234/api/partidos', 
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(envio),
                success: function (result) {
                    console.log('Respuesta: ' + result);
                    refrescarListado();
                },
                error: function (xhr, status, error, envio) {
                    console.log('Error: ' + error + " . El envío era:" + JSON.stringify(envio));
                    alert(xhr.responseText);
                }
            });

        } else {

            if (partido_nuevo == "" ||
                descripcion_nuevo == "" ||
                deporte_nuevo == "" || 
                resultado_nuevo == "" ||
                apuesta_nuevo == "") {

                alert("Todos los campos deben ser completados.");
            }

            if (apuesta_nuevo <= 0) {

                alert("La apuesta no puede ser cero o menor.")
            }

        }
    });

    // Accionar del botón de Cancelar de la creaciñon de nuevo registro. 
    $("#boton_cancela_nuevo").on("click", function (event) {
        event.preventDefault();
        refrescarListado();
    });

    //Para el filtrado de la tabla. 
    $("#filtrado").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#listado tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });


});
