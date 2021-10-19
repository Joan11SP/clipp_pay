function enviarMailGenerico(idAplicativo, to, asunto, valores) {
    var AMBIENTE_DESARROLLO = '';
    var name = 'Clipp ';
    if (IS_DESARROLLO) {
        AMBIENTE_DESARROLLO = '<tr><td>Ambiente: </td> <td style="font-weight: bold;">Desarrollo</td></tr>';
    }
    let htmlAux = '';
    for (var i = 0; i < valores.length; i++) {
        htmlAux = htmlAux +
            '<tr><td>' + valores[i]['clave'] + ': </td>' + '<td style="font-weight: bold;">' + valores[i]['valor'] + '</td></tr>';
    }

    var FECHA = MOMENT().tz('America/Guayaquil').format().replace(/T/, ' ').replace(/\..+/, '').substring(0, 19);

    elegirMail(idAplicativo, function (mailEnvio) {
        var html = mailEnvio['encabezado']

            '<img class="imagenencabezado" src = "' + mailEnvio['url'] + 'KTAXI.png" > ' +

                '<table style = "width: 100%" > ' + AMBIENTE_DESARROLLO + " " + htmlAux

            + '<tr>< td > Fecha: </td >< td style = "font-weight: bold;" > ' + FECHA + '</td ></tr ></table > ' + mailEnvio['pie'] + ' + </body > </html > ';

        if (mailEnvio['FromJET']) {
            var To = [{
                "Email": to,
                "Name": name
            }];
            /* var Bcc = [{
            "Email": "<ricardojh05@gmail.com>",
            "Name": "Bruno Valarezo"
            }]; */
            /* var Bcc = [{
            "Email": "<ricardojh05@gmail.com>",
            "Name": "Ricardo"
            }]; */
            var Bcc = 0;
            return enviarMailJet(asunto, html, mailEnvio['FromJET'], To, Bcc);
        }
        mailEnvio['mail'].sendMail({
            from: mailEnvio['from'],
            to: to,
            subject: asunto,
            html: html
        }, function () { });
    });
}




function elegirMail(idAplicativo, calback) {
    switch (parseInt(idAplicativo)) {
        case ID_APLICATIVO_CLIPP:
            json = {
                FromJET: {
                    "Email": "clipp@kradac.com",
                    "Name": "Clipp"
                },
                url: urImg + 'clipp/',
                mail: mail_clipp,
                nombre: 'Clipp, Delivery y Movilidad en tus manos',
                from: 'CLIPP <clipp@kradac.com>',
                to: 'Bruno Valarezo<ricardojh05@gmail.com>',
                bcc: 'Bruno Valarezo <ricardojh05@gmail.com>>',
                br: '<hr color="blue"/>',
                encabezado: encabezadoClipp,
                pie: pieClipp,
                saludoCliente: 'Estimado cliente somos del APP CLIPP, ',
                saludoUsuario: 'Estimado asistente somos del AP CLIPP, '
            };
            return calback(json);
        case ID_APLICATIVO_PUNTUALL:
            json = {
                FromJET: {
                    "Email": "puntuall@kradac.com",
                    "Name": "Puntuall"
                },
                url: urImg + 'puntuall/',
                mail: mail_clipp,
                nombre: '¡Sé tú mismo el observador de la puntualidad!',
                from: 'PUNTUALL <puntuall@kradac.com>',
                to: 'Bruno Valarezo<ricardojh05@gmail.com>',
                bcc: 'Bruno Valarezo <ricardojh05@gmail.com>',
                br: '<hr color="blue"/>',
                encabezado: encabezadoPuntuall,
                pie: piePuntuall,
                saludoCliente: '¡Hola estimado cliente! Somos Puntuall App, ',
                saludoUsuario: 'Estimado usuario, somos Puntuall App, '
            };
            return calback(json);
        default:
            json = {
                FromJET: {
                    "Email": "clipp@kradac.com",
                    "Name": "Clipp"
                },
                url: urImg + 'clipp/',
                mail: mail_clipp,
                nombre: 'CLIPP',
                from: 'CLIPP <clipp@kradac.com>',
                to: 'Bruno Valarezo<ricardojh05@gmail.com>',
                bcc: 'Bruno Valarezo <ricardojh05@gmail.com>',
                br: '<hr color="blue"/>',
                encabezado: encabezadoClipp,
                pie: pieClipp,
                saludoCliente: 'Estimado cliente somos del APP CLIPP, ',
                saludoUsuario: 'Estimado asistente somos del AP CLIPP, '
            };
            return calback(json);
    }
}



