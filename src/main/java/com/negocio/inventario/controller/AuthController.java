package com.negocio.inventario.controller;

import com.negocio.inventario.dto.LoginRequest;
import com.negocio.inventario.entity.Usuario;
import com.negocio.inventario.repository.UsuariosRepository;
import com.negocio.inventario.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UsuariosRepository usuariosRepository;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {

        String correo = request.getCorreo();
        String password = request.getPassword();

        Map<String, String> response = new HashMap<>();

        Usuario usuario = usuariosRepository.findByCorreo(correo);

        if (usuario != null && usuario.getPassword().equals(password)) {

            // ✅ Generar token CON el rol
            String token = JwtUtil.generarToken(usuario.getCorreo(), usuario.getRol());

            response.put("token", token);
            response.put("rol", usuario.getRol());
            response.put("nombre", usuario.getNombre());
            response.put("correo", usuario.getCorreo());
            response.put("mensaje", "Login exitoso");

            return response;
        }

        response.put("mensaje", "Credenciales incorrectas");
        return response;
    }
}