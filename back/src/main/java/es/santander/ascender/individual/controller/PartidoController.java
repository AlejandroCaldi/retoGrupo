package es.santander.ascender.individual.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import es.santander.ascender.individual.model.Partido;
import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "/partidos")
public class PartidoController {
    // Sin Base de Datos verdadera, no pretende ser ni tan siquiera seguro respecto a hilos
    private Map<Long, Partido> partidos = new HashMap<>();

    public PartidoController() {
        partidos.put(1l, new Partido(1, "Partido A", "Descripción A", "Futbol", 0, 55.5f));
        partidos.put(2l, new Partido(2, "Partido B", "Descripción B", "Tenis", 1, 10.0f));
        partidos.put(3l, new Partido(3, "Partido C", "Descripción C", "Tenis", -1, 10.0f)); // Partido ya perdido
    }


    @GetMapping("/{id}")
    public HttpEntity<Partido> get(@PathVariable("id") long id) {
        if (!partidos.containsKey(id)) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok().body(partidos.get(id));
        }
    }

    @GetMapping
    public HttpEntity<Collection<Partido>> get() {
        return ResponseEntity.ok().body(partidos.values());
    }

    @PostMapping
    public ResponseEntity<Partido> create(@RequestBody Partido partido) {
        long cuenta = partidos.values().size();
        
        long maxId = 0;
        if (cuenta != 0) {
            maxId = partidos.values().stream()
                                .map(p -> p.getId())
                                .mapToLong(id -> id)
                                .max()
                                .orElse(0);
        }
        // No seguro respecto a hilos
        partido.setId(maxId + 1);

        partidos.put(partido.getId(), partido);

        return ResponseEntity.status(HttpStatus.CREATED).body(partido);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Partido> update(@PathVariable Long id, @Valid @RequestBody Partido partidoActualizado) {
        Partido partidoExistente = partidos.get(id);
        
        if (partidoExistente == null) {
            return ResponseEntity.notFound().build();
        }
    
        partidoExistente.setNombre(partidoActualizado.getNombre());
        partidoExistente.setDescripcion(partidoActualizado.getDescripcion());
        partidoExistente.setDeporte(partidoActualizado.getDeporte());
        partidoExistente.setResultado(partidoActualizado.getResultado());
        partidoExistente.setApuesta(partidoActualizado.getApuesta());
        
        return ResponseEntity.ok(partidoExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Partido partidoExistente = partidos.get(id);

        if (partidoExistente == null) {
            return ResponseEntity.notFound().build();
        }

        partidos.remove(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/gana")
    public ResponseEntity<String> gana(@PathVariable Long id) {
        Partido partido = partidos.get(id);

        if (partido == null) {
            return ResponseEntity.notFound().build();
        }

        if (partido.getResultado() > 0) {
            return ResponseEntity.badRequest().body("No se puede superar 1");
        }

        partido.setResultado(partido.getResultado() + 1);

        return ResponseEntity.ok("Gana: " + partido.getNombre());
    }

    @PostMapping("/{id}/pierde")
    public ResponseEntity<String> pierde(@PathVariable Long id) {
        Partido partido = partidos.get(id);

        if (partido == null) {
            return ResponseEntity.notFound().build();
        }

        if (partido.getResultado() < 0) {
            return ResponseEntity.badRequest().body("No se puede bajar de -1");
        }

        partido.setResultado(partido.getResultado() - 1);

        return ResponseEntity.ok("Pierde: " + partido.getNombre());
    }

    // Exponemos un endpoint donde se pueden subir ficheros que en base al nombre del fichero (prestando atención 
    // a que no haya problemas de seguridad) y que se almacenen en la carpeta temporal del sistema operativo.
    // Para ello, se puede utilizar la clase MultipartFile de Spring.
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("id") long id) {
        try {
            // Guardar el archivo en la carpeta temporal del sistema operativo
            String tempDir = System.getProperty("java.io.tmpdir");
            Path tempFile = Paths.get(tempDir, file.getOriginalFilename());
            Files.write(tempFile, file.getBytes());

            // Guardar el nombre del fichero en el partido identificado por id
            Partido partido = partidos.get(id);
            partido.setNombreFichero(file.getOriginalFilename());

            return ResponseEntity.ok("Fichero subido con éxito: " + file.getOriginalFilename());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al subir el fichero: " + e.getMessage());
        }
    }   

    // Y ahora descargamos el fichero subido
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestParam("id") long id) {
        // Recogemos el fichero del partido
        Partido partido = partidos.get(id);
        if (partido == null) {
            return ResponseEntity.notFound().build();
        }   
        
        try {
            // Leer el archivo de la carpeta temporal del sistema operativo
            String tempDir = System.getProperty("java.io.tmpdir");
            Path tempFile = Paths.get(tempDir, partido.getNombreFichero());
            byte[] contenido = Files.readAllBytes(tempFile);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + partido.getNombreFichero())
                    .body(contenido);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    public Map<Long, Partido> getPartidos() {
        return partidos;
    }

    public void setPartidos(Map<Long, Partido> partidos) {
        this.partidos = partidos;
    }    
}
