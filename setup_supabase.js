// Run this once to set up tables in Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bvdxpticernfggvaczdb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ELEmxIw9Nde-WWvhhj4CZg_4Mh4QdTZ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Testing Supabase connection...');

  // Try to read from hospital_overrides to check if table exists
  const { data, error } = await supabase
    .from('hospital_overrides')
    .select('hospital_id')
    .limit(1);

  if (error) {
    console.error('ERROR - Tables do not exist yet!');
    console.error('Message:', error.message);
    console.log('\n--- Please run this SQL in your Supabase SQL Editor ---');
    console.log(`
CREATE TABLE IF NOT EXISTS hospital_overrides (
  hospital_id TEXT PRIMARY KEY,
  ward_beds JSONB DEFAULT '{}',
  blood_stock JSONB DEFAULT '{}',
  total_nurses INTEGER DEFAULT 24,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_holds (
  hold_id TEXT PRIMARY KEY,
  hospital_id TEXT NOT NULL,
  otp TEXT NOT NULL,
  patient_name TEXT DEFAULT 'Emergency Patient',
  symptom TEXT DEFAULT 'Acute Triage',
  ward_code TEXT DEFAULT 'adult_icu',
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '15 minutes',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ADMITTED','EXPIRED','CANCELLED'))
);

CREATE TABLE IF NOT EXISTS admitted_patients (
  id TEXT PRIMARY KEY,
  hospital_id TEXT NOT NULL,
  patient_name TEXT,
  symptom TEXT,
  ward_code TEXT,
  ward_label TEXT,
  admitted_at TIMESTAMPTZ DEFAULT NOW(),
  otp TEXT
);

ALTER PUBLICATION supabase_realtime ADD TABLE hospital_overrides;
ALTER PUBLICATION supabase_realtime ADD TABLE active_holds;
ALTER PUBLICATION supabase_realtime ADD TABLE admitted_patients;

INSERT INTO hospital_overrides (hospital_id, ward_beds, blood_stock, total_nurses) VALUES
('hosp-ils-nagerbazar',   '{"cardiac_icu":4,"adult_icu":2,"pediatric_icu":2,"general_ward":6}',  '{"O-":6,"O+":14,"A+":12,"B+":18,"AB+":5}', 24),
('hosp-tmc-newtown',      '{"cardiac_icu":2,"adult_icu":4,"pediatric_icu":2,"general_ward":8}',  '{"O-":4,"O+":12,"A+":10,"B+":14,"AB+":5}', 28),
('hosp-charnock-vip',     '{"cardiac_icu":3,"adult_icu":5,"pediatric_icu":2,"general_ward":10}', '{"O-":8,"O+":16,"A+":14,"B+":20,"AB+":6}', 30),
('hosp-ohio-newtown',     '{"cardiac_icu":2,"adult_icu":4,"pediatric_icu":3,"general_ward":7}',  '{"O-":5,"O+":10,"A+":8,"B+":12,"AB+":4}',  20),
('hosp-hcg-newtown',      '{"cardiac_icu":2,"adult_icu":3,"pediatric_icu":1,"general_ward":5}',  '{"O-":3,"O+":8,"A+":6,"B+":10,"AB+":3}',   18),
('hosp-dumdum-municipal', '{"cardiac_icu":1,"adult_icu":2,"pediatric_icu":1,"general_ward":4}',  '{"O-":2,"O+":6,"A+":5,"B+":8,"AB+":2}',    14)
ON CONFLICT (hospital_id) DO NOTHING;
    `);
    process.exit(1);
  }

  console.log('✅ Tables exist! Rows found:', data?.length || 0);

  // Seed data if empty
  if (!data || data.length === 0) {
    console.log('Seeding initial data...');
    const { error: seedErr } = await supabase.from('hospital_overrides').upsert([
      { hospital_id: 'hosp-ils-nagerbazar',   ward_beds: {"cardiac_icu":4,"adult_icu":2,"pediatric_icu":2,"general_ward":6},  blood_stock: {"O-":6,"O+":14,"A+":12,"B+":18,"AB+":5}, total_nurses: 24 },
      { hospital_id: 'hosp-tmc-newtown',      ward_beds: {"cardiac_icu":2,"adult_icu":4,"pediatric_icu":2,"general_ward":8},  blood_stock: {"O-":4,"O+":12,"A+":10,"B+":14,"AB+":5}, total_nurses: 28 },
      { hospital_id: 'hosp-charnock-vip',     ward_beds: {"cardiac_icu":3,"adult_icu":5,"pediatric_icu":2,"general_ward":10}, blood_stock: {"O-":8,"O+":16,"A+":14,"B+":20,"AB+":6}, total_nurses: 30 },
      { hospital_id: 'hosp-ohio-newtown',     ward_beds: {"cardiac_icu":2,"adult_icu":4,"pediatric_icu":3,"general_ward":7},  blood_stock: {"O-":5,"O+":10,"A+":8,"B+":12,"AB+":4},  total_nurses: 20 },
      { hospital_id: 'hosp-hcg-newtown',      ward_beds: {"cardiac_icu":2,"adult_icu":3,"pediatric_icu":1,"general_ward":5},  blood_stock: {"O-":3,"O+":8,"A+":6,"B+":10,"AB+":3},   total_nurses: 18 },
      { hospital_id: 'hosp-dumdum-municipal', ward_beds: {"cardiac_icu":1,"adult_icu":2,"pediatric_icu":1,"general_ward":4},  blood_stock: {"O-":2,"O+":6,"A+":5,"B+":8,"AB+":2},    total_nurses: 14 },
    ], { onConflict: 'hospital_id' });
    if (seedErr) console.error('Seed error:', seedErr.message);
    else console.log('✅ Seed data inserted!');
  } else {
    console.log('✅ Data already present. Rows:', data.map(r => r.hospital_id));
  }

  // Verify active_holds table
  const { error: holdsErr } = await supabase.from('active_holds').select('hold_id').limit(1);
  if (holdsErr) console.error('active_holds table missing:', holdsErr.message);
  else console.log('✅ active_holds table OK');

  const { error: admErr } = await supabase.from('admitted_patients').select('id').limit(1);
  if (admErr) console.error('admitted_patients table missing:', admErr.message);
  else console.log('✅ admitted_patients table OK');

  console.log('\n🎉 Supabase setup complete! Ready to deploy.');
}

main().catch(console.error);
