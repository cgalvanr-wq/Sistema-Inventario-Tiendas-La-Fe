package com.negocio.inventario.controller;

import com.negocio.inventario.entity.MovimientoInventario;
import com.negocio.inventario.repository.MovimientoInventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/movimientos")
@CrossOrigin(origins = "http://localhost:3000")
public class MovimientoController {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    // ✅ ENDPOINT PARA EL HISTORIAL CON FILTRO POR TIPO
    @GetMapping("/historial")
    public List<MovimientoInventario> obtenerHistorial(@RequestParam(required = false) String tipo) {
        List<MovimientoInventario> todos = movimientoRepository.findAll();

        // Ordenar del más reciente al más antiguo
        todos.sort((a, b) -> b.getFecha().compareTo(a.getFecha()));

        if (tipo != null && !tipo.isEmpty()) {
            return todos.stream()
                    .filter(m -> m.getTipoMovimiento().equalsIgnoreCase(tipo))
                    .collect(Collectors.toList());
        }

        return todos;
    }
}