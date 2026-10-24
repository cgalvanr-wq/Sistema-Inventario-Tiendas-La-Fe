import { useState, useEffect } from "react";

function Login({ setLogueado }) {
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [recordarme, setRecordarme] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
    const [correoRecuperar, setCorreoRecuperar] = useState("");

    // ✅ Cargar correo recordado al iniciar
    useEffect(() => {
        const correoGuardado = localStorage.getItem("correoRecordado");
        if (correoGuardado) {
            setCorreo(correoGuardado);
            setRecordarme(true);
        }
    }, []);

    const login = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8081/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, password }),
            });

            const data = await response.json();

            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("rol", data.rol);
                localStorage.setItem("nombre", data.nombre);
                localStorage.setItem("correo", data.correo);

                // ✅ Recordar correo si está marcado
                if (recordarme) {
                    localStorage.setItem("correoRecordado", correo);
                } else {
                    localStorage.removeItem("correoRecordado");
                }

                setLogueado(true);
            } else {
                setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
            }
        } catch (err) {
            setError("Error conectando con el servidor. Intenta de nuevo.");
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const recuperarPassword = () => {
        if (!correoRecuperar) {
            setError("Por favor ingresa tu correo electrónico");
            return;
        }

        alert(`✅ Se envió un enlace de recuperación a:\n\n${correoRecuperar}\n\nRevisa tu bandeja de entrada.`);
        setMostrarRecuperar(false);
        setCorreoRecuperar("");
        setError("");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #343a40 0%, #007bff 100%)",
            padding: "20px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                background: "white",
                padding: "45px 40px",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                maxWidth: "420px",
                width: "100%",
                border: "3px solid #ffc107"
            }}>
                {/* LOGO Y TÍTULO */}
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <div style={{
                        fontSize: "65px",
                        marginBottom: "10px"
                    }}>
                        🏪
                    </div>
                    <h1 style={{
                        fontSize: "28px",
                        color: "#343a40",
                        margin: "0",
                        fontWeight: "bold",
                        letterSpacing: "1px"
                    }}>
                        Tiendas La Fe
                    </h1>
                    <p style={{
                        color: "#007bff",
                        fontSize: "13px",
                        margin: "5px 0 0 0",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "2px"
                    }}>
                        Sistema de Inventario
                    </p>
                    <div style={{
                        width: "60px",
                        height: "3px",
                        background: "#ffc107",
                        margin: "15px auto 0",
                        borderRadius: "2px"
                    }} />
                </div>

                {/* MENSAJE DE ERROR */}
                {error && (
                    <div style={{
                        background: "#fee",
                        color: "#c00",
                        padding: "12px 15px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        marginBottom: "20px",
                        border: "1px solid #fcc",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* MODAL DE RECUPERAR CONTRASEÑA */}
                {mostrarRecuperar ? (
                    <div>
                        <h2 style={{ fontSize: "20px", color: "#343a40", marginBottom: "10px" }}>
                            🔑 Recuperar Contraseña
                        </h2>
                        <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{
                                display: "block",
                                color: "#343a40",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                            }}>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={correoRecuperar}
                                onChange={(e) => setCorreoRecuperar(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && recuperarPassword()}
                                style={{
                                    width: "100%",
                                    padding: "12px 15px",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    outline: "none",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => {
                                    setMostrarRecuperar(false);
                                    setError("");
                                }}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={recuperarPassword}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    background: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                }}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                ) : (
                    /* FORMULARIO DE LOGIN */
                    <form onSubmit={login}>
                        {/* CORREO */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{
                                display: "block",
                                color: "#343a40",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                            }}>
                                📧 Correo Electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="admin@gmail.com"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                                autoComplete="email"
                                style={{
                                    width: "100%",
                                    padding: "12px 15px",
                                    border: "2px solid #e0e0e0",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    transition: "all 0.3s",
                                    outline: "none",
                                    boxSizing: "border-box"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#007bff"}
                                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                            />
                        </div>

                        {/* CONTRASEÑA */}
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{
                                display: "block",
                                color: "#343a40",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                            }}>
                                🔒 Contraseña
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={mostrarPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{
                                        width: "100%",
                                        padding: "12px 45px 12px 15px",
                                        border: "2px solid #e0e0e0",
                                        borderRadius: "10px",
                                        fontSize: "14px",
                                        transition: "all 0.3s",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#007bff"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPassword(!mostrarPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "18px"
                                    }}
                                >
                                    {mostrarPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* RECORDARME Y OLVIDÉ CONTRASEÑA */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "25px",
                            fontSize: "13px"
                        }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#555",
                                cursor: "pointer"
                            }}>
                                <input
                                    type="checkbox"
                                    checked={recordarme}
                                    onChange={(e) => setRecordarme(e.target.checked)}
                                    style={{ cursor: "pointer" }}
                                />
                                Recordarme
                            </label>
                            <button
                                type="button"
                                onClick={() => setMostrarRecuperar(true)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#007bff",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    textDecoration: "underline"
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* BOTÓN DE LOGIN */}
                        <button
                            type="submit"
                            disabled={cargando}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: cargando ? "#999" : "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: cargando ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 4px 15px rgba(0, 123, 255, 0.4)"
                            }}
                            onMouseEnter={(e) => !cargando && (e.target.style.transform = "translateY(-2px)")}
                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                        >
                            {cargando ? "⏳ Ingresando..." : "🔓 Iniciar Sesión"}
                        </button>

                        <p style={{
                            textAlign: "center",
                            fontSize: "11px",
                            color: "#999",
                            marginTop: "10px"
                        }}>
                            Presiona <strong>Enter</strong> para iniciar sesión
                        </p>
                    </form>
                )}

                {/* INFO DE USUARIOS */}
                <div style={{
                    marginTop: "25px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                    fontSize: "11px",
                    color: "#666",
                    textAlign: "center"
                }}>

                </div>

                {/* FOOTER */}
                <p style={{
                    textAlign: "center",
                    fontSize: "10px",
                    color: "#aaa",
                    margin: "15px 0 0 0"
                }}>
                    © 2026 Tiendas La Fe - Todos los derechos reservados
                </p>
            </div>
        </div>
    );
}

export default Login;