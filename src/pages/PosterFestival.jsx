import React from 'react';
import cityImg from "../assets/City.svg";
import beachImg from "../assets/Beach.svg";
import desertImg from "../assets/Desert.svg";

// Utilidad para obtener los nombres de los días y fechas próximas
const diasSemana = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
function getDiasFestival(numDias) {
    const hoy = new Date();
    return Array.from({ length: numDias }, (_, i) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        const nombre = diasSemana[fecha.getDay()];
        const fechaStr = fecha.toLocaleString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
        return { nombre, fecha: fechaStr, idx: i };
    });
}

// Agrupa artistas por día
function agruparArtistasPorDia(artistas, dias) {
    return dias.map((dia, idx) => {
        const artistasDia = artistas.filter(a => a.dia === `Día ${idx + 1}`);
        return {
            ...dia,
            artistas: artistasDia.map(a => a.nombre)
        };
    });
}

const PosterFestival = ({ festival, backgroundType = "city" }) => {
    if (!festival) return null;

    // Fondo según tipo
    let backgroundImg = cityImg;
    if (backgroundType === "beach") backgroundImg = beachImg;
    if (backgroundType === "desert") backgroundImg = desertImg;

    // Definición de días y artistas
    const dias = getDiasFestival(festival.days || 1);
    const artistas = Array.isArray(festival.artistas) ? festival.artistas : [];
    const hasAnyArtists = artistas.length > 0;
    const diasAgrupados = agruparArtistasPorDia(artistas, dias);

    const MAX_ARTISTS_PER_DAY = 15;

    // --- COLORES ---
    const colorHeadlinerStart = "#FFF500"; 
    const colorHeadlinerEnd = "#FF9900";   
    const colorSecundario = "#FF55B5";     
    
    const POSTER_WIDTH = 1080;
    const POSTER_HEIGHT = 1920;
    const FOOTER_HEIGHT = 140;

    // --- LÓGICA DE FUENTES ---
    const nombreFestival = festival.name || "Mi Festival";
    
    // Mantenemos la lógica de tamaño solo para que se vea bonito, 
    // pero ya no afecta la posición (eso lo hace Flexbox).
    let fontSizeTitulo = 125;
    if (nombreFestival.length > 32) fontSizeTitulo = 70;
    else if (nombreFestival.length > 24) fontSizeTitulo = 85;
    else if (nombreFestival.length > 18) fontSizeTitulo = 100;
    else if (nombreFestival.length > 12) fontSizeTitulo = 115;

    // Seguridad extra para palabras muy largas
    const longestToken = nombreFestival.split(/\s+/).reduce((a, b) => (a.length > b.length ? a : b), "");
    if (longestToken.length >= 14) fontSizeTitulo = Math.min(fontSizeTitulo, 80);

    const CONTENT_PADDING = "0 40px";
    const HEADLINER_PADDING = "0 100px";

    // --- RENDER LIST HELPER ---
    const renderArtistList = (list, fontSize, marginTop) => (
        <div style={{
            marginTop: marginTop,
            fontFamily: "Secuela, Montserrat, sans-serif",
            fontSize: fontSize,
            color: "#EEE", 
            textShadow: "0 2px 4px rgba(0,0,0,0.9)",
            fontWeight: 600, 
            padding: CONTENT_PADDING,
            boxSizing: "border-box",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            lineHeight: 1.35
        }}>
            {list.map((art, i) => (
                <span key={i}>
                    {art}
                    {i < list.length - 1 && (
                        <span style={{ 
                            color: colorSecundario, 
                            margin: "0 10px", 
                            fontWeight: 400, 
                            opacity: 0.9,
                            display: "inline-block" 
                        }}>•</span>
                    )}
                </span>
            ))}
        </div>
    );

    return (
        <div
            style={{
                width: POSTER_WIDTH,
                height: POSTER_HEIGHT,
                backgroundColor: "#050014", 
                position: "relative",
                overflow: "hidden",
                padding: 0,
            }}
        >
            {/* 1. IMAGEN DE FONDO */}
            <img
                src={backgroundImg} alt=""
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8, zIndex: 0 }}
            />

            {/* 2. OVERLAY */}
            <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1,
                background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.85) 100%)"
            }}></div>

            {/* --- CONTENEDOR PRINCIPAL FLEXIBLE (LA SOLUCIÓN AL SOLAPAMIENTO) --- */}
            {/* Este contenedor ocupa todo el alto y apila los elementos automáticamente */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
                paddingTop: 70, // Espacio superior inicial
                boxSizing: "border-box"
            }}>

                {/* A. TÍTULO (Ahora es relativo, empujará lo de abajo) */}
                <div
                    style={{
                        width: "100%", 
                        textAlign: "center",
                        fontFamily: "Ganache, 'Bebas Neue', sans-serif",
                        fontSize: fontSizeTitulo,
                        color: "#fff",
                        textShadow: "0 4px 10px rgba(0,0,0,0.8)",
                        fontWeight: 900,
                        letterSpacing: 2,
                        lineHeight: 0.95,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        textTransform: "uppercase",
                        padding: "0 40px", // Margen lateral para que no toque bordes
                        boxSizing: "border-box",
                        marginBottom: 30 // Espacio asegurado debajo del título
                    }}
                >
                    {nombreFestival}
                </div>

                {/* B. FECHAS (Debajo del título sí o sí) */}
                <div
                    style={{
                        width: "100%",
                        textAlign: "center",
                        fontFamily: "Secuela, Montserrat, sans-serif",
                        fontSize: 42, 
                        color: colorSecundario,
                        fontWeight: 600,
                        letterSpacing: 4,
                        textTransform: "uppercase",
                        textShadow: "0 2px 4px rgba(0,0,0,1)",
                        marginBottom: 50 // Espacio antes de los artistas
                    }}
                >
                    {dias.map(d => d.fecha).join("  //  ")} 
                </div>

                {!hasAnyArtists && (
                    <div style={{ width: "100%", textAlign: "center", marginTop: 100 }}>
                        <h1 style={{color: colorHeadlinerStart, fontSize: 60, fontFamily: "Secuela, sans-serif", textTransform: "uppercase", letterSpacing: 2}}>Lineup Vacío</h1>
                    </div>
                )}

                {/* C. LISTA DE ARTISTAS (Ocupa el espacio restante) */}
                {hasAnyArtists && (
                    <div style={{
                        width: "100%",
                        // flex: 1 permite que esto ocupe el espacio que sobre,
                        // pero controlamos el padding inferior para no chocar con el footer
                        flex: 1, 
                        display: "flex",
                        flexDirection: "column", 
                        gap: "60px", 
                        paddingBottom: FOOTER_HEIGHT + 40, // Dejamos espacio para el footer flotante
                    }}>
                        {diasAgrupados.map((dia, idx) => {
                            const artistasDiaOriginal = dia.artistas;
                            const artistasDia = artistasDiaOriginal.slice(0, MAX_ARTISTS_PER_DAY);
                            const overflow = artistasDiaOriginal.length - artistasDia.length;

                            return (
                                <div key={dia.nombre + idx} style={{ position: "relative", width: "100%" }}>
                                    
                                    {/* Etiquetas Laterales */}
                                    <div style={{ 
                                        position: "absolute", top: '20px', left: '0', width: "120px", textAlign:"center",
                                        fontFamily: "Secuela, Montserrat, sans-serif", fontSize: 40, color: colorSecundario, fontWeight: 700,
                                        textShadow: "0 2px 4px rgba(0,0,0,1)"
                                    }}>
                                        {dia.nombre}
                                    </div>
                                    <div style={{ 
                                        position: "absolute", top: '20px', right: '0', width: "180px", textAlign:"center",
                                        fontFamily: "Secuela, Montserrat, sans-serif", fontSize: 40, color: colorSecundario, fontWeight: 700,
                                        textShadow: "0 2px 4px rgba(0,0,0,1)"
                                    }}>
                                        {dia.fecha}
                                    </div>

                                    <div style={{ width: "100%", textAlign: "center" }}>
                                        
                                        {/* Headliner */}
                                        {artistasDia.length > 0 && (
                                            <div style={{
                                                fontFamily: "'Passion One', Impact, sans-serif",
                                                fontSize: 85, 
                                                background: `linear-gradient(180deg, ${colorHeadlinerStart} 10%, ${colorHeadlinerEnd} 90%)`,
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                filter: "drop-shadow(0px 5px 0px rgba(0,0,0,0.6))",
                                                textTransform: "uppercase",
                                                fontWeight: 900,
                                                letterSpacing: 0, 
                                                padding: HEADLINER_PADDING, 
                                                boxSizing: "border-box",
                                                lineHeight: 0.9, 
                                                whiteSpace: "normal",
                                                overflowWrap: "break-word",
                                                marginBottom: "10px"
                                            }}>
                                                {artistasDia[0]}
                                            </div>
                                        )}

                                        {/* Secundarios */}
                                        {artistasDia.length > 1 && renderArtistList(artistasDia.slice(1, 4), 52, "10px")}
                                        {artistasDia.length > 4 && renderArtistList(artistasDia.slice(4, 9), 44, "15px")}
                                        {artistasDia.length > 9 && renderArtistList(artistasDia.slice(9, 14), 38, "10px")}

                                        {overflow > 0 && (
                                            <div style={{ marginTop: "15px", fontFamily: "Secuela, Montserrat, sans-serif", fontSize: 25, color: "#aaa", fontWeight: 500 }}>
                                                ...y {overflow} más
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- FOOTER FLOTANTE --- */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: FOOTER_HEIGHT + 40, 
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end", 
                    zIndex: 20, // Mayor Z-Index asegura que esté encima del contenido scrolleable si fuera el caso
                    paddingBottom: 40,
                    boxSizing: "border-box"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                        fontFamily: "Secuela, Montserrat, sans-serif",
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 300,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        opacity: 0.9,
                        textShadow: "0 2px 4px rgba(0,0,0,1)"
                    }}>
                        Crea tu propio lineup en
                    </span>
                </div>

                <span style={{
                    fontFamily: "'Passion One', Impact, sans-serif",
                    color: "#fff",
                    fontSize: 45,
                    fontWeight: 400,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginTop: 5,
                    textShadow: "0 4px 8px rgba(0,0,0,0.8)"
                }}>
                    MIFESTIVAL<span style={{ color: colorSecundario }}>.WEB.APP</span>
                </span>
            </div>
        </div>
    );
};

export default PosterFestival;