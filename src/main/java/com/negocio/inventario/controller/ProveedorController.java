package com.negocio.inventario.controller;

import com.negocio.inventario.entity.Proveedor;
import com.negocio.inventario.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/proveedores")
@CrossOrigin(origins = "http://localhost:3000")
public class ProveedorController {

    @Autowired
    private ProveedorRepository repository;

    @GetMapping
    public List<Proveedor> listar() {

        return repository.findAll();
    }

    @PostMapping
    public Proveedor guardar(@RequestBody Proveedor p) {
        return repository.save(p);
    }
    @GetMapping("/{id}")
    public Proveedor obtenerPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Proveedor actualizar(@PathVariable Long id, @RequestBody Proveedor p) {
        p.setId(id);
        return repository.save(p);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}