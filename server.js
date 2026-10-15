// Solución a posibles bloqueos/errores de DNS SRV en entornos locales
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Conexión a MongoDB Atlas con tus credenciales actualizadas
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado exitosamente a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// Esquema Mongoose con soporte GeoJSON para el Polígono
const geofenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    geometry: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // Coordenadas [longitud, latitud]
        required: true,
      },
    },
  },
  { timestamps: true },
);

geofenceSchema.index({ geometry: "2dsphere" });

const Geofence = mongoose.model("Geofence", geofenceSchema);

// Endpoint 1: Obtener la última geocerca guardada
app.get("/api/geofence", async (req, res) => {
  try {
    const geofence = await Geofence.findOne().sort({ updatedAt: -1 });
    if (!geofence)
      return res.status(404).json({ message: "No hay geocerca registrada" });

    res.json({
      type: "Feature",
      id: geofence._id,
      properties: { name: geofence.name },
      geometry: geofence.geometry,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 2: Guardar o actualizar la geocerca
app.post("/api/geofence/save", async (req, res) => {
  try {
    const { id, name, geometry } = req.body;

    if (id) {
      const updated = await Geofence.findByIdAndUpdate(
        id,
        { name, geometry },
        { new: true },
      );
      return res.json({
        message: "Geocerca actualizada en Atlas",
        data: updated,
      });
    } else {
      const created = await Geofence.create({ name, geometry });
      return res
        .status(201)
        .json({ message: "Geocerca guardada en Atlas", data: created });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar Servidor en el puerto 3000
app.listen(3000, () =>
  console.log("🚀 Servidor ejecutándose en http://localhost:3000"),
);
