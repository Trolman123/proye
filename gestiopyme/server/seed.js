require('dotenv').config();
const { sequelize, User, Product, Client, Provider, Company } = require('./models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✓ Base de datos reiniciada');

    // Empresa
    await Company.create({
      nombre: 'GestioPYME Demo S.A.C.',
      documento: '20601234567',
      tipo_documento: 'RUC',
      direccion: 'Av. Principal 123, Lima, Perú',
      telefono: '+51 999 888 777',
      email: 'contacto@gestiopyme.com',
      moneda: 'PEN',
      simbolo_moneda: 'S/',
      impuesto_default: 18.00
    });

    // Usuarios
    const admin = await User.create({
      nombre: 'Mohamed Zaglout',
      email: 'admin@gestiopyme.com',
      password: 'admin123',
      rol: 'admin'
    });

    await User.create({
      nombre: 'Ana García',
      email: 'gerente@gestiopyme.com',
      password: 'gerente123',
      rol: 'gerente'
    });

    await User.create({
      nombre: 'Carlos López',
      email: 'empleado@gestiopyme.com',
      password: 'empleado123',
      rol: 'empleado'
    });

    // Productos
    const productosData = [
      { codigo: 'PROD-001', nombre: 'Laptop HP 15"', descripcion: 'Laptop HP 15 pulgadas, 8GB RAM, 256GB SSD', categoria: 'Tecnología', precio_compra: 1800, precio_venta: 2500, stock: 15, stock_minimo: 5 },
      { codigo: 'PROD-002', nombre: 'Mouse Logitech M170', descripcion: 'Mouse inalámbrico ergonómico', categoria: 'Tecnología', precio_compra: 35, precio_venta: 65, stock: 50, stock_minimo: 10 },
      { codigo: 'PROD-003', nombre: 'Teclado Mecánico Redragon', descripcion: 'Teclado mecánico RGB switches rojos', categoria: 'Tecnología', precio_compra: 120, precio_venta: 200, stock: 30, stock_minimo: 8 },
      { codigo: 'PROD-004', nombre: 'Monitor Samsung 24"', descripcion: 'Monitor Full HD IPS 75Hz', categoria: 'Tecnología', precio_compra: 550, precio_venta: 800, stock: 8, stock_minimo: 3 },
      { codigo: 'PROD-005', nombre: 'Cable HDMI 2m', descripcion: 'Cable HDMI 2.0 alta velocidad', categoria: 'Accesorios', precio_compra: 10, precio_venta: 25, stock: 100, stock_minimo: 20 },
      { codigo: 'PROD-006', nombre: 'Disco Duro Externo 1TB', descripcion: 'HDD externo USB 3.0 portátil', categoria: 'Almacenamiento', precio_compra: 150, precio_venta: 250, stock: 20, stock_minimo: 5 },
      { codigo: 'PROD-007', nombre: 'Webcam Logitech C920', descripcion: 'Cámara web Full HD 1080p', categoria: 'Tecnología', precio_compra: 200, precio_venta: 350, stock: 3, stock_minimo: 5 },
      { codigo: 'PROD-008', nombre: 'Audífonos JBL Tune 510', descripcion: 'Audífonos inalámbricos Bluetooth', categoria: 'Audio', precio_compra: 100, precio_venta: 180, stock: 25, stock_minimo: 8 },
      { codigo: 'PROD-009', nombre: 'USB Kingston 64GB', descripcion: 'Memoria USB 3.2', categoria: 'Almacenamiento', precio_compra: 20, precio_venta: 45, stock: 2, stock_minimo: 15 },
      { codigo: 'PROD-010', nombre: 'Silla Ergonómica Pro', descripcion: 'Silla de oficina ergonómica con soporte lumbar', categoria: 'Mobiliario', precio_compra: 400, precio_venta: 650, stock: 10, stock_minimo: 3 }
    ];

    for (const p of productosData) {
      await Product.create(p);
    }

    // Clientes
    const clientesData = [
      { tipo_documento: 'DNI', numero_documento: '45678901', nombre: 'María Fernández', email: 'maria@email.com', telefono: '999111222', direccion: 'Av. Arequipa 456, Lima' },
      { tipo_documento: 'RUC', numero_documento: '20551234567', nombre: 'Comercial Luna S.A.C.', email: 'ventas@luna.com', telefono: '01-4445566', direccion: 'Jr. Huancayo 789, Lima' },
      { tipo_documento: 'DNI', numero_documento: '70123456', nombre: 'Pedro Ramírez', email: 'pedro.r@email.com', telefono: '998877665', direccion: 'Calle Los Olivos 321' },
      { tipo_documento: 'DNI', numero_documento: '33445566', nombre: 'Lucía Torres', email: 'lucia.t@email.com', telefono: '977665544', direccion: 'Av. Brasil 654, Lima' },
      { tipo_documento: 'RUC', numero_documento: '20449876543', nombre: 'Tech Solutions E.I.R.L.', email: 'info@techsol.com', telefono: '01-5557788', direccion: 'Av. Javier Prado 1200, Lima' }
    ];

    for (const c of clientesData) {
      await Client.create(c);
    }

    // Proveedores
    const proveedoresData = [
      { tipo_documento: 'RUC', numero_documento: '20331112223', razon_social: 'Distribuidora TechImport S.A.', contacto: 'Roberto Sánchez', email: 'ventas@techimport.com', telefono: '01-3334455', direccion: 'Av. Argentina 2345, Callao', condiciones_pago: 'Crédito 30 días' },
      { tipo_documento: 'RUC', numero_documento: '20556667778', razon_social: 'MegaOffice Proveedores S.A.C.', contacto: 'Elena Vargas', email: 'pedidos@megaoffice.com', telefono: '01-6667788', direccion: 'Av. Petit Thouars 1500, Lima', condiciones_pago: 'Contado' },
      { tipo_documento: 'RUC', numero_documento: '20663334445', razon_social: 'AudioVisión Perú S.R.L.', contacto: 'Jorge Medina', email: 'contacto@audiovision.pe', telefono: '01-7778899', direccion: 'Jr. Cusco 890, Lima', condiciones_pago: 'Crédito 15 días' }
    ];

    for (const p of proveedoresData) {
      await Provider.create(p);
    }

    console.log('✓ Datos de prueba insertados correctamente');
    console.log('');
    console.log('Credenciales de acceso:');
    console.log('  Admin:    admin@gestiopyme.com / admin123');
    console.log('  Gerente:  gerente@gestiopyme.com / gerente123');
    console.log('  Empleado: empleado@gestiopyme.com / empleado123');

    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seed();
