
let articulos = [];

let operacion_ganapierde = 0; // 0 equivale a compra, 1 a reposición

$(document).ready(function () {


    // Borra y recarga abl con el maestro del inventario. 
    function refrescarListado() {

        $.get("http://my-json-server.typicode.com/desarrollo-seguro/dato/solicitudes",
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


    /* Función de vuelco de valores en funcción de en qué renglón se presiona un botón dado. 
    * Implementado para Compras y Reposición. Edición es distinto. 
    * @param event: El evento del click en el renglón especñifico de la trabla. Si no, no lo hereda. 
    * @param texto: El String con el que se desea rellenar el <legend> de compra_venta.
    **/
    function vuelcoValores(event, texto) {

        if (event) event.preventDefault();

        let $row = $(event.target).closest('tr');
        let prodId = $row.find('td').eq(0).text();
        let prodNombre = $row.find('td').eq(1).text();
        let prodCantidad = $row.find('td').eq(3).text();

        $("#legend_compraventa").text(texto);
        $("#id_compraventa").val(prodId);
        $("#nombre_compraventa").val(prodNombre);
        $("#nombre_compraventa").prop('disabled', true);
        $("#cantidad_compraventa").val(prodCantidad);
        escondeDetalles();
        $("#compraventa").show();

        window.vuelcoValores = vuelcoValores;

    }

    //Esconde todos los detalles. Llamada por todos los procesos de invocado de detalle para luego solo llamar
    //el que interesa a la operación. 
    function escondeDetalles() {

        $("#edicion").hide();
        $("#nuevo").hide();
        $("#compraventa").hide();

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

        // Accionar de click del botón de reposición. 
        $('#listado').on("click", ".boton_pierde", function (event) {
            event.preventDefault();
            operacion_ganapierde = 1;
            vuelcoValores(event, "Reposición")
        });

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
        let prodId = $row.find('td').eq(0).text();
        let prodNombre = $row.find('td').eq(1).text();
        let prodDescripcion = $row.find('td').eq(2).text();
        let prodCantidad = $row.find('td').eq(3).text();
        let prodPrecio = $row.find('td').eq(4).text();

        escondeDetalles();
        let $precio = $("#edicion").show();

        $("#id_edicion").val(prodId);
        $("#nombre_edicion").val(prodNombre);
        $("#descripcion_edicion").val(prodDescripcion);
        $("#cantidad_edicion").val(prodCantidad);
        $("#precio_edicion").val(prodPrecio);

    });

    // Graba el cambio de precio enviando petición al servidor.
    $("#boton_graba_edicion").on("click", function (event) {

        event.preventDefault();

        let $precio = $("#edicion");
        let prodId = Number($("#id_edicion").val());
        let prodNombre = $("#nombre_edicion").val();
        let prodDescripcion = $("#descripcion_edicion").val();
        let prodPrecio = Number($("#precio_edicion").val());
        let prodCantidad = Number($("#cantidad_edicion").val());

        if (prodNombre.length > 0 &&
            prodDescripcion.length > 0 &&
            prodPrecio > 0 &&
            prodCantidad >= 0) {


            let envio = { id: prodId, precio: prodPrecio, nombre: prodNombre, descripcion: prodDescripcion, cantidad: prodCantidad };
            $.ajax({
                url: 'http://localhost:1234/api/productos/edicion',
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(envio),
                success: function (result) {
                    console.log('Respuesta: ' + result);
                    $precio.hide();
                    refrescarListado();
                },
                error: function (xhr, status, error) {
                    console.log('Error: ' + error);
                }
            });
        } else {

            if (prodNombre.length == 0 ||
                prodDescripcion.length == 0) {

                alert("Todos los campos deben ser completados.");

            } else {

                alert("Precio no puede ser 0 o menor. La cantidad no puede ser negativa.")
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


    // Graba los datos del registro a dar de alta. 
    $("#boton_graba_nuevo").on("click", function (event) {
        event.preventDefault();

        let partido_nuevo = $("#partido_nuevo").val();
        let descripcion_nuevo = $('#descripcion_nuevo').val();
        let deporte_nuevo = $('#deporte_nuevo').val();
        let resultado_nuevo = $('#resultado_nuevo').val();
        let apuesta_nuevo = $("#apuesta_nuevo").val();

        console.log(partido_nuevo);
        console.log(descripcion_nuevo);
        console.log(deporte_nuevo);
        console.log(resultado_nuevo);
        console.log(apuesta_nuevo);

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
