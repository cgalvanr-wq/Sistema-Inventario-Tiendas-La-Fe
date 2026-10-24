package com.negocio.inventario.repository;

import com.negocio.inventario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuariosRepository extends JpaRepository<Usuario, Long> {

    Usuario findByCorreo(String correo);
}