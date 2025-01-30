
let articulos = [];

let operacion_compraventa = 0; // 0 equivale a compra, 1 a reposición

$(document).ready(function () {


    // Borra y recarga abl con el maestro del inventario. 
    function refrescarListado() {

        $.get("http://my-json-server.typicode.com/desarrollo-seguro/dato/solicitudes",
            function (result) {

                $.get("http://localhost:1234/api/productos", function (data) {

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
                        $linea.append($('<td class="renglon mt-3md-3 text-right">').text(x.cantidad));
                        $linea.append($('<td class="renglon mt-3md-3 text-right">').text(x.precio.toFixed(2)));
                        $linea.append($('<td class="text-center">').append($(`<button class="btn btn-success btn-lg botonera text-center boton_compra">Compra
                                </button><button class="btn btn-info btn-lg botonera boton_reposicion">Reposición</button>
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


    /* Función de vuelco de valores en funcciójn de en qué renglón se presiona un botón dado. 
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

        // Accionar tras botón de compra
        $('#listado').on("click", ".boton_compra", function (event) {
            event.preventDefault();
            operacion_compraventa = 0;
            vuelcoValores(event, "Compra")

        });

        // Accionar de clinck del botón de reposición. 
        $('#listado').on("click", ".boton_reposicion", function (event) {
            event.preventDefault();
            operacion_compraventa = 1;
            vuelcoValores(event, "Reposición")
        });

        // Acckonar del botón de grabación sea de reposición o venta. 
        $("#boton_graba_compraventa").on("click", function (event) {
            event.preventDefault();

            let prodId = $("#id_compraventa").val();
            let prodCantidad = $("#cantidad_compraventa").val();

            let envio = { id: prodId, precio: 0, nombre: "", descripcion: "", cantidad: prodCantidad };

            if (operacion_compraventa == 0) {
                $.ajax({
                    url: 'http://localhost:1234/api/productos/compra',
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(envio),
                    success: function (result) {
                        console.log("resultado de la compra: " + result);
                    },
                    error: function (xhr, status, error) {
                        console.log("resultado de la compra: " + error);
                        alert("La compra excedería la cantidad en inventario");
                    }
                });
            }

            if (operacion_compraventa == 1) {
                $.ajax({
                    url: 'http://localhost:1234/api/productos/reposicion',
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(envio),
                    success: function (result) {
                        console.log("resultado de la reposición: " + result);
                    },
                    error: function (xhr, status, error) {
                        console.log("resultado de la reposición: " + error);
                    }
                });
            }

            refrescarListado(); // Make sure this function doesn't cause a page reload
        });
    });

    // Cancela operación de cambio de precio. Borra el detalle y refresca el maestro. 
    $("#boton_cancela_compraventa").on("click", function (event) {
        event.preventDefault();
        escondeDetalles();
    });


    // Habilita los controles para el cambio de precio
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

                alert("Todos los campos deben ser completados. Can");

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


    // Dar de baja un producto. 
    $('#listado').on("click", ".boton_baja", function (event) {

        event.preventDefault()

        let $row = $(this).closest('tr');
        let solId = $row.find('td').eq(0).text();

        console.log("Id es: " + solId);

        if (confirm("Está seguro de que desea BORRAR este registro?")) {
            $.ajax({
                url: 'http://localhost:1234/api/productos/' + solId,
                method: "DELETE",
                contentType: "application/json",
                success: function (result) {

                    console.log("resultado de la compra: " + result)

                },
                error: function (xhr, status, error) {

                    console.log("resultado de la compra: " + error)

                }
            });
        } else {
            // If the user clicked "Cancel", do nothing
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

        let nombre_nuevo = $("#nombre_nuevo").val();
        let descripcion_nuevo = $('#descripcion_nuevo').val();
        let cantidad_nuevo = $('#cantidad_nuevo').val();
        let precio_nuevo = $("#precio_nuevo").val();

        if (nombre_nuevo != "" &&
            descripcion_nuevo != "" &&
            cantidad_nuevo != "" &&
            precio_nuevo != "" &&
            cantidad_nuevo >= 0 &&
            precio_nuevo > 0) {

            let envio = {
                id: 0,
                nombre: nombre_nuevo,
                descripcion: descripcion_nuevo,
                cantidad: cantidad_nuevo,
                precio: precio_nuevo
            };

            console.log(JSON.stringify(envio));

            $.ajax({
                url: 'http://localhost:1234/api/productos/alta', // Adjusted by Parcel to remove "/api"
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

            if (nombre_nuevo == "" ||
                descripcion_nuevo == "" ||
                cantidad_nuevo == "" ||
                precio_nuevo == "") {

                alert("Todos los campos deben ser completados.");
            }

            if (cantidad_nuevo < 0 || precio_nuevo <= 0) {

                alert("Precio no puede ser cero o menor. Cantida no puede ser negativa")
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
