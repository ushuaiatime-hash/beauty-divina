-- =============================================
-- SCHEMA — Beauty Divina Turnos
-- Pegar en Supabase > SQL Editor > Run
-- =============================================

CREATE TABLE businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  phone         TEXT,
  address       TEXT,
  logo_url      TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0d0a0e',
  accent_color  TEXT NOT NULL DEFAULT '#ff6eb4',
  panel_pin     TEXT NOT NULL DEFAULT '1234',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE professionals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  initials      TEXT NOT NULL DEFAULT 'XX',
  photo_url     TEXT,
  specialty     TEXT,
  is_active     BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0
);

CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  price            NUMERIC(10,2) NOT NULL,
  category         TEXT DEFAULT 'General',
  is_active        BOOLEAN DEFAULT true,
  display_order    INT DEFAULT 0
);

-- availability supports multiple blocks per day via JSON
CREATE TABLE availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_active       BOOLEAN DEFAULT true,
  -- blocks: [{"start":"09:00","end":"12:00"},{"start":"15:00","end":"18:00"}]
  blocks          JSONB NOT NULL DEFAULT '[{"start":"09:00","end":"18:00"}]'
);

CREATE TABLE blocked_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  blocked_date    DATE NOT NULL,
  start_time      TIME,
  end_time        TIME,
  reason          TEXT
);

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  professional_id  UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id       UUID REFERENCES services(id) ON DELETE SET NULL,
  client_name      TEXT NOT NULL,
  client_phone     TEXT NOT NULL,
  client_email     TEXT,
  appointment_date DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','cancelled','completed','rescheduling')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX ON appointments(business_id);
CREATE INDEX ON appointments(appointment_date);
CREATE INDEX ON appointments(status);
CREATE INDEX ON services(business_id);
CREATE INDEX ON professionals(business_id);
CREATE INDEX ON availability(professional_id);

-- RLS permisivo MVP
ALTER TABLE businesses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all" ON businesses    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all" ON professionals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all" ON services      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all" ON availability  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all" ON blocked_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all" ON appointments  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- DATOS DEMO — slug: beauty-divina
-- =============================================
DO $$
DECLARE biz UUID; p1 UUID; p2 UUID;
BEGIN
  INSERT INTO businesses (slug,name,description,phone,address,accent_color,panel_pin)
  VALUES ('beauty-divina','Beauty Divina Turnos',
          'Salón de belleza & estética premium 💅',
          '5491155550001','Monte Grande, Buenos Aires',
          '#ff6eb4','1234')
  RETURNING id INTO biz;

  INSERT INTO professionals (business_id,name,initials,specialty,display_order)
  VALUES (biz,'Valentina Ruiz','VR','Uñas & Manicuria',1) RETURNING id INTO p1;

  INSERT INTO professionals (business_id,name,initials,specialty,display_order)
  VALUES (biz,'Camila Torres','CT','Facial & Depilación',2) RETURNING id INTO p2;

  INSERT INTO services (business_id,name,description,duration_minutes,price,category,display_order)
  VALUES
    (biz,'Manicuria Semipermanente','Esmaltado semi + diseño incluido',60,3500,'Uñas',1),
    (biz,'Pedicuría Completa','Tratamiento completo de pies',75,4200,'Uñas',2),
    (biz,'Limpieza Facial Profunda','Limpieza + hidratación + mask',90,6500,'Facial',3),
    (biz,'Depilación Piernas Completas','Cera fría premium',50,3000,'Depilación',4);

  INSERT INTO availability (business_id,professional_id,day_of_week,blocks)
  VALUES
    (biz,p1,1,'[{"start":"09:00","end":"18:00"}]'),
    (biz,p1,2,'[{"start":"09:00","end":"18:00"}]'),
    (biz,p1,3,'[{"start":"09:00","end":"18:00"}]'),
    (biz,p1,4,'[{"start":"09:00","end":"18:00"}]'),
    (biz,p1,5,'[{"start":"09:00","end":"16:00"}]'),
    (biz,p2,1,'[{"start":"10:00","end":"19:00"}]'),
    (biz,p2,2,'[{"start":"10:00","end":"19:00"}]'),
    (biz,p2,3,'[{"start":"10:00","end":"19:00"}]'),
    (biz,p2,4,'[{"start":"10:00","end":"19:00"}]'),
    (biz,p2,6,'[{"start":"10:00","end":"15:00"}]');
END $$;
