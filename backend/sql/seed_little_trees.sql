-- =============================================================================
-- Semilla: Little Trees (aromatizantes / ambientadores para auto) — marca pino
-- Categorías por familia de olores. Precio en unidades genéricas; ajustar moneda.
-- Uso: psql -h 127.0.0.1 -p 5223 -U inventario -d inventario-db -f seed_little_trees.sql
-- O desde pgAdmin: ejecutar este archivo.
-- =============================================================================
/*
  TÍTULO: Little Trees – aromatizantes originales
  Refresca tu auto con estilo. Fragancias intensas y diseños icónicos.
  Categorías: dulces/frutales, florales, frescos, intensos, ediciones especiales.
*/

BEGIN;

-- Categorías (olores agrupados)
INSERT INTO categoria (nombre) VALUES
  ('Dulces y frutales'),
  ('Florales y suaves'),
  ('Frescos y naturales'),
  ('Intensos y especiales'),
  ('Diseños y ediciones especiales')
ON CONFLICT (nombre) DO NOTHING;

-- Productos: Dulces y frutales
INSERT INTO producto (nombre, precio, stock, categoria_id) SELECT v.nombre, v.precio, v.stock, c.categoria_id
FROM categoria c,
(VALUES
  ('Cereza / Wild Cherry', 3.50, 80),
  ('Fresa', 3.20, 100),
  ('Manzana y Canela', 3.40, 90),
  ('Sandía', 3.30, 75),
  ('Piña Colada', 3.60, 70),
  ('Coco Playa / Coco Naranja', 3.55, 65),
  ('Algodón de Azúcar', 3.25, 85),
  ('Bubble Gum', 3.15, 95),
  ('Peachy Peach / Peach Ginger Spritz', 3.45, 60),
  ('Margarita', 3.50, 55),
  ('Torta de Cumpleaños', 3.40, 50),
  ('Pitahaya Morada', 3.60, 45)
) AS v(nombre, precio, stock)
WHERE c.nombre = 'Dulces y frutales'
  AND NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

-- Florales y suaves
INSERT INTO producto (nombre, precio, stock, categoria_id) SELECT v.nombre, v.precio, v.stock, c.categoria_id
FROM categoria c,
(VALUES
  ('Cherry Blossom Honey', 3.45, 70),
  ('Flores Rosas (Mañana)', 3.35, 75),
  ('Rosa Roja', 3.30, 80),
  ('Jazmín', 3.40, 65),
  ('Lavanda', 3.35, 88),
  ('Rainshine', 3.50, 60)
) AS v(nombre, precio, stock)
WHERE c.nombre = 'Florales y suaves'
  AND NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

-- Frescos y naturales
INSERT INTO producto (nombre, precio, stock, categoria_id) SELECT v.nombre, v.precio, v.stock, c.categoria_id
FROM categoria c,
(VALUES
  ('Morning Fresh', 3.40, 100),
  ('Fresh Shave', 3.35, 90),
  ('Royal Pine', 3.55, 120),
  ('True North', 3.50, 85),
  ('Limón Amarillo / Lemon Grove', 3.30, 95),
  ('Summer Linen', 3.45, 70),
  ('Rainforest Mist', 3.50, 75),
  ('Bayside Breeze', 3.45, 68)
) AS v(nombre, precio, stock)
WHERE c.nombre = 'Frescos y naturales'
  AND NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

-- Intensos y especiales
INSERT INTO producto (nombre, precio, stock, categoria_id) SELECT v.nombre, v.precio, v.stock, c.categoria_id
FROM categoria c,
(VALUES
  ('Ice Black', 3.60, 55),
  ('Be King', 3.65, 50),
  ('Gold', 3.70, 40),
  ('No Smoke', 3.50, 62),
  ('Leather', 3.55, 48),
  ('Blackberry Clove', 3.50, 58),
  ('Calabaza, Anís y Canela', 3.45, 45),
  ('Copper Canyon', 3.55, 52),
  ('Atardecer', 3.40, 64),
  ('Super Nova', 3.60, 42),
  ('New Car', 3.75, 100)
) AS v(nombre, precio, stock)
WHERE c.nombre = 'Intensos y especiales'
  AND NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

-- Diseños y ediciones especiales
INSERT INTO producto (nombre, precio, stock, categoria_id) SELECT v.nombre, v.precio, v.stock, c.categoria_id
FROM categoria c,
(VALUES
  ('Bandera Americana', 3.50, 70),
  ('Bandera Americana Vanilla Pride', 3.55, 45),
  ('Barco Turquesa', 3.45, 50),
  ('Calavera Negra Tatuaje', 3.60, 40),
  ('Corset Negro (Morado)', 3.50, 38),
  ('Moroccan Mint Tea', 3.55, 55),
  ('Metal', 3.45, 60)
) AS v(nombre, precio, stock)
WHERE c.nombre = 'Diseños y ediciones especiales'
  AND NOT EXISTS (SELECT 1 FROM producto p WHERE p.nombre = v.nombre);

COMMIT;

-- Verificación (opcional):
-- SELECT cat.nombre AS categoria, COUNT(*) AS productos FROM producto p JOIN categoria cat ON p.categoria_id = cat.categoria_id GROUP BY cat.categoria_id, cat.nombre ORDER BY cat.nombre;
