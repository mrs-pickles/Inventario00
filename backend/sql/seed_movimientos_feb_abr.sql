-- =============================================================================
-- Datos de prueba: movimientos (ENTRADA / SALIDA) de febrero a abril → hasta hoy
-- Requisitos: seed_little_trees.sql y al menos 1 fila en usuario.
-- No recalcula stock en producto (solo historial para reportes y dashboard).
-- =============================================================================

BEGIN;

DO $$
DECLARE
  y int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  d0 date;
  d1 date;
  uid int;
  pcnt int;
BEGIN
  d0 := make_date(y, 2, 1);
  IF CURRENT_DATE < d0 THEN
    y := y - 1;
    d0 := make_date(y, 2, 1);
  END IF;
  d1 := LEAST(CURRENT_DATE, make_date(y, 4, 30));
  IF d0 > d1 THEN
    RAISE NOTICE 'Sin rango: d0=% d1=% (¿fecha del sistema?)', d0, d1;
    RETURN;
  END IF;

  SELECT usuario_id INTO uid FROM usuario ORDER BY usuario_id LIMIT 1;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios. Cree al menos un usuario antes de este script.';
  END IF;

  SELECT COUNT(*)::int INTO pcnt FROM producto;
  IF pcnt = 0 THEN
    RAISE EXCEPTION 'No hay productos. Ejecute antes sql/seed_little_trees.sql';
  END IF;

  INSERT INTO movimiento (tipo, cantidad, fecha, producto_id, usuario_id)
  SELECT
    CASE WHEN random() < 0.82 THEN 'SALIDA' ELSE 'ENTRADA' END,
    1 + (random() * 6)::int,
    day0::timestamp
      + (random() * interval '12 hours')
      + (random() * interval '45 minutes'),
    (SELECT p.producto_id
     FROM producto p
     ORDER BY p.producto_id
     OFFSET floor(random() * pcnt)::int
     LIMIT 1),
    uid
  FROM (
    SELECT gs.d::date AS day0
    FROM generate_series(d0, d1, '1 day'::interval) AS gs(d)
  ) days
  JOIN LATERAL (
    SELECT g.i
    FROM generate_series(
      1,
      1 + floor(random() * 2.5)::int
    ) AS g(i)
  ) reps ON true;

  RAISE NOTICE 'Movimientos demo insertados: % a % (usuario_id=%).', d0, d1, uid;
END $$;

COMMIT;
