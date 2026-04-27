const { Company } = require('../models');

const obtener = async (req, res) => {
  try {
    let empresa = await Company.findOne();
    if (!empresa) {
      empresa = await Company.create({});
    }
    res.json({ empresa });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener datos de empresa', error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    let empresa = await Company.findOne();
    if (!empresa) {
      empresa = await Company.create(req.body);
    } else {
      await empresa.update(req.body);
    }
    res.json({ mensaje: 'Datos de empresa actualizados', empresa });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar empresa', error: error.message });
  }
};

module.exports = { obtener, actualizar };
