package com.negocio.inventario.controller;

import com.negocio.inventario.entity.MovimientoInventario;
import com.negocio.inventario.entity.Producto;
import com.negocio.inventario.entity.Venta;
import com.negocio.inventario.entity.Cliente;
import com.negocio.inventario.entity.Usuario;
import com.negocio.inventario.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ventas")
@CrossOrigin(origins = "http://localhost:3000")
public class VentaController {

    @Autowired private VentaRepository ventaRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private MovimientoInventarioRepository movimientoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private UsuariosRepository usuariosRepository;

    @GetMapping
    public List<Venta> listarVentas() {
        return ventaRepository.findAll();
    }

    @PostMapping
    public Map<String, Object> guardarVenta(@RequestBody List<Venta> ventas) {
        if (ventas == null || ventas.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        try {
            long count = ventaRepository.count() + 1;
            String numFacturaCompartida = String.format("FAC2026%04d", count);

            Cliente datosCliente = ventas.get(0).getCliente();
            if (datosCliente != null && datosCliente.getCedula() != null) {
                Cliente clienteGuardado = clienteRepository.findByCedula(datosCliente.getCedula());
                if (clienteGuardado == null) {
                    clienteGuardado = clienteRepository.save(datosCliente);
                }
                datosCliente = clienteGuardado;
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String correoVendedor = (auth != null && auth.getName() != null) ? auth.getName() : "admin@gmail.com";
            Usuario usuario = usuariosRepository.findByCorreo(correoVendedor);
            String nombreVendedor = (usuario != null) ? usuario.getNombre() : correoVendedor;

            for (Venta venta : ventas) {
                venta.setNumeroFactura(numFacturaCompartida);
                venta.setCliente(datosCliente);
                venta.setVendedor(nombreVendedor);

                Producto producto = productoRepository.findById(venta.getProducto().getId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

                if (producto.getCantidad() < venta.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
                }

                double precioVenta = (venta.getTipoVenta().equals("mayor"))
                        ? producto.getPrecioMayor()
                        : (producto.getOfertaActiva() ? producto.getPrecioSugerido() : producto.getPrecioDetal());

                double subtotal = venta.getCantidad() * precioVenta;

                double ivaPorcentaje = 0.19;
                String categoria = producto.getCategoria().getNombre() != null ? producto.getCategoria().getNombre().trim() : "";
                String subcategoria = producto.getSubcategoria() != null ? producto.getSubcategoria().trim().toLowerCase() : "";

                if (categoria.equalsIgnoreCase("Tienda") || categoria.toLowerCase().contains("tienda")) {
                    if (subcategoria.equals("granos") || subcategoria.equals("huevos") || subcategoria.equals("panela") || subcategoria.equals("lácteos")) ivaPorcentaje = 0.00;
                    else if (subcategoria.equals("aceites") || subcategoria.equals("limpieza")) ivaPorcentaje = 0.19;
                    else if (subcategoria.equals("otros")) ivaPorcentaje = 0.05;
                } else if (categoria.equalsIgnoreCase("Papeleria") || categoria.toLowerCase().contains("papeler")) {
                    if (subcategoria.equals("cuadernos") || subcategoria.equals("lápices")) ivaPorcentaje = 0.00;
                    else ivaPorcentaje = 0.19;
                } else if (categoria.equalsIgnoreCase("Licorera") || categoria.toLowerCase().contains("licor")) {
                    ivaPorcentaje = 0.19;
                }

                double iva = subtotal * ivaPorcentaje;
                double total = subtotal + iva;

                venta.setSubtotal(subtotal);
                venta.setIva(iva);
                venta.setTotal(total);
                venta.setGanancia((precioVenta - producto.getPrecioBase()) * venta.getCantidad());
                venta.setFecha(LocalDate.now());
                venta.setProducto(producto);

                int stockAnterior = producto.getCantidad();
                int stockNuevo = stockAnterior - venta.getCantidad();
                producto.setCantidad(stockNuevo);
                productoRepository.save(producto);

                ventaRepository.save(venta);

                MovimientoInventario mov = new MovimientoInventario();
                mov.setProducto(producto);
                mov.setTipoMovimiento("SALIDA");
                mov.setCantidad(venta.getCantidad());
                mov.setStockAnterior(stockAnterior);
                mov.setStockNuevo(stockNuevo);
                mov.setMotivo("Venta - Factura: " + numFacturaCompartida);
                mov.setFecha(LocalDateTime.now());
                movimientoRepository.save(mov);
            }

            List<Venta> ventasGuardadas = ventaRepository.findByNumeroFactura(numFacturaCompartida);
            double subtotalTotal = 0;
            double ivaTotal = 0;
            double totalTotal = 0;

            for (Venta v : ventasGuardadas) {
                subtotalTotal += (v.getSubtotal() != null) ? v.getSubtotal() : 0;
                ivaTotal += (v.getIva() != null) ? v.getIva() : 0;
                totalTotal += (v.getTotal() != null) ? v.getTotal() : 0;
            }

            // ✅ USAMOS MAP PARA QUE SPRING CREE EL JSON PERFECTO
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("numeroFactura", numFacturaCompartida);
            respuesta.put("subtotal", subtotalTotal);
            respuesta.put("iva", ivaTotal);
            respuesta.put("total", totalTotal);

            return respuesta;

        } catch (Exception e) {
            throw new RuntimeException("No se pudo guardar la venta: " + e.getMessage());
        }
    }
    // ✅ ENDPOINT PARA EL HISTORIAL (Filtra por fecha)
    @GetMapping("/historial")
    public List<Venta> obtenerHistorial(@RequestParam(required = false) String fecha) {
        List<Venta> todas = ventaRepository.findAll();

        if (fecha != null && !fecha.isEmpty()) {
            LocalDate fechaBusqueda = LocalDate.parse(fecha);
            return todas.stream()
                    .filter(v -> v.getFecha() != null && v.getFecha().equals(fechaBusqueda))
                    .collect(java.util.stream.Collectors.toList());
        }

        return todas;
    }
}