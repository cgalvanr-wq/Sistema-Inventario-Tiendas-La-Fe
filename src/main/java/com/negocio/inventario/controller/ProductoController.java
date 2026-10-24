package com.negocio.inventario.controller;

import com.negocio.inventario.entity.MovimientoInventario;
import com.negocio.inventario.entity.Producto;
import com.negocio.inventario.repository.MovimientoInventarioRepository;
import com.negocio.inventario.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @GetMapping("/publicos")
    public List<Producto> listarPublicos() {
        return productoRepository.findAll();
    }

    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto) {
        try {
            // Validar duplicados
            List<Producto> existentes = productoRepository.findAll();
            for (Producto p : existentes) {
                if (p.getNombre().equalsIgnoreCase(producto.getNombre().trim())) {
                    throw new RuntimeException("Ya existe un producto con el nombre '" + producto.getNombre() + "'");
                }
            }

            // Validaciones
            if (producto.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a 0");
            }
            if (producto.getPrecioCompra() <= 0) {
                throw new RuntimeException("El precio de compra debe ser mayor a 0");
            }
            if (producto.getCategoria() == null || producto.getCategoria().getId() == null) {
                throw new RuntimeException("Debes seleccionar una categoría válida");
            }

            // ✅ CÁLCULO CORRECTO: precioCompra es TOTAL → dividir entre cantidad
            double precioUnitario = producto.getPrecioCompra() / producto.getCantidad();

            producto.setPrecioBase(precioUnitario);
            producto.setPrecioDetal(precioUnitario * 1.35);
            producto.setPrecioMayor(precioUnitario * 1.20);
            producto.setGanancia((precioUnitario * 1.35 - precioUnitario) * producto.getCantidad());
            producto.setFechaRegistro(LocalDate.now());

            // Guardar producto
            Producto guardado = productoRepository.save(producto);

            // Registrar movimiento ENTRADA
            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(guardado);
            movimiento.setTipoMovimiento("ENTRADA");
            movimiento.setCantidad(guardado.getCantidad());
            movimiento.setStockAnterior(0);
            movimiento.setStockNuevo(guardado.getCantidad());
            movimiento.setMotivo("Registro inicial del producto");
            movimiento.setFecha(LocalDateTime.now());
            movimientoRepository.save(movimiento);

            return guardado;

        } catch (Exception e) {
            throw new RuntimeException("No se pudo guardar el producto: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Producto actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        Producto existente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        int stockAnterior = existente.getCantidad();

        // Actualizar campos básicos
        existente.setNombre(producto.getNombre());
        existente.setCantidad(producto.getCantidad());
        existente.setPrecioCompra(producto.getPrecioCompra());
        existente.setCategoria(producto.getCategoria());

        if (producto.getProveedor() != null && producto.getProveedor().getId() != null) {
            existente.setProveedor(producto.getProveedor());
        }

        // ✅ CÁLCULO CORRECTO: precioCompra es TOTAL → dividir entre cantidad
        double precioUnitario = producto.getPrecioCompra() / producto.getCantidad();

        existente.setPrecioBase(precioUnitario);
        existente.setPrecioDetal(precioUnitario * 1.35);
        existente.setPrecioMayor(precioUnitario * 1.20);
        existente.setGanancia((precioUnitario * 1.35 - precioUnitario) * producto.getCantidad());

        // Manejar oferta
        if (producto.getOfertaActiva() != null && producto.getOfertaActiva()) {
            existente.setOfertaActiva(true);
            existente.setMotivoSugerido(
                    producto.getMotivoSugerido() != null && !producto.getMotivoSugerido().isEmpty()
                            ? producto.getMotivoSugerido()
                            : "Próximo a vencer"
            );
            existente.setPrecioSugerido(precioUnitario * 1.15);
            existente.setPrecioMinimo(precioUnitario * 1.10);
        } else {
            existente.setOfertaActiva(false);
            existente.setMotivoSugerido(null);
            existente.setPrecioSugerido(null);
            existente.setPrecioMinimo(null);
        }

        Producto actualizado = productoRepository.save(existente);

        // Registrar movimiento si la cantidad cambió
        int stockNuevo = actualizado.getCantidad();
        if (stockNuevo != stockAnterior) {
            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(actualizado);
            movimiento.setCantidad(Math.abs(stockNuevo - stockAnterior));
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockNuevo(stockNuevo);

            if (stockNuevo > stockAnterior) {
                movimiento.setTipoMovimiento("ENTRADA");
                movimiento.setMotivo("Reabastecimiento de producto");
            } else {
                movimiento.setTipoMovimiento("AJUSTE");
                movimiento.setMotivo("Ajuste manual de inventario");
            }

            movimiento.setFecha(LocalDateTime.now());
            movimientoRepository.save(movimiento);
        }

        return actualizado;
    }

    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Long id) {
        try {
            List<MovimientoInventario> todosMovimientos = movimientoRepository.findAll();
            for (MovimientoInventario mov : todosMovimientos) {
                if (mov.getProducto() != null && mov.getProducto().getId().equals(id)) {
                    movimientoRepository.delete(mov);
                }
            }
            productoRepository.deleteById(id);
            System.out.println("Producto " + id + " eliminado");
        } catch (Exception e) {
            throw new RuntimeException("No se pudo eliminar el producto: " + e.getMessage());
        }
    }
}