-- Crear tabla evaluaciones
CREATE TABLE evaluaciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  whatsapp    TEXT NOT NULL,
  ciudad      TEXT,
  peso        INTEGER,
  altura      INTEGER,
  objetivo    TEXT,
  situacion   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activar RLS (Row Level Security)
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- Solo el service role (API del servidor) puede insertar y leer
-- El cliente nunca toca esta tabla directamente
CREATE POLICY "Solo service role puede insertar"
  ON evaluaciones FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Solo service role puede leer"
  ON evaluaciones FOR SELECT
  TO service_role
  USING (true);
