package com.negocio.inventario.controller;

import com.negocio.inventario.entity.Cliente;
import com.negocio.inventario.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "http://localhost:3000")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // ✅ Endpoint para el autocompletado
    @GetMapping("/buscar")
    public List<Cliente> buscar(@RequestParam String termino) {
        return clienteRepository.findByCedulaContainingIgnoreCaseOrNombreContainingIgnoreCase(termino, termino);
    }
}