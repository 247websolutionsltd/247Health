insert into public.specialties (slug, name)
values
  ('general', 'General'),
  ('cardiology', 'Cardiology'),
  ('dental', 'Dental'),
  ('pediatrics', 'Pediatrics'),
  ('eye-care', 'Eye Care'),
  ('neurology', 'Neurology'),
  ('dermatology', 'Dermatology'),
  ('ortho', 'Ortho')
on conflict (slug) do update
set name = excluded.name;

insert into public.doctors (
  id,
  specialty_id,
  full_name,
  clinic_name,
  rating,
  review_count,
  years_experience,
  consultation_fee_minor,
  currency_code,
  biography,
  is_bookable
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    (select id from public.specialties where slug = 'cardiology'),
    'Dr. Amara Okafor', 'Lagoon Heart Centre', 4.9, 312, 14, 4500, 'USD',
    'Consultant cardiologist focused on preventive heart care, hypertension and post-cardiac rehabilitation.', true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    (select id from public.specialties where slug = 'general'),
    'Dr. Daniel Mensah', 'CityCare Clinic', 4.8, 540, 9, 2500, 'USD',
    'Family physician helping patients with everyday illness, chronic conditions and routine check-ups.', true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    (select id from public.specialties where slug = 'pediatrics'),
    'Dr. Zainab Bello', 'Little Steps Hospital', 4.9, 288, 11, 3500, 'USD',
    'Paediatrician caring for infants, children and teens, with a special interest in child nutrition and vaccines.', true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    (select id from public.specialties where slug = 'dental'),
    'Dr. Chidi Eze', 'BrightSmile Dental', 4.7, 201, 8, 3000, 'USD',
    'Dental surgeon offering cleaning, restorative care and cosmetic dentistry in a calm, friendly setting.', false
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    (select id from public.specialties where slug = 'dermatology'),
    'Dr. Ifeoma Adeyemi', 'ClearSkin Studio', 4.8, 175, 10, 4000, 'USD',
    'Dermatologist treating acne, eczema, pigmentation and hair loss with evidence-based care.', true
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    (select id from public.specialties where slug = 'ortho'),
    'Dr. Tunde Balogun', 'MoveWell Ortho Hospital', 4.6, 143, 16, 5000, 'USD',
    'Orthopaedic specialist for joint pain, sports injuries and mobility recovery.', true
  )
on conflict (id) do update
set specialty_id = excluded.specialty_id,
    full_name = excluded.full_name,
    clinic_name = excluded.clinic_name,
    rating = excluded.rating,
    review_count = excluded.review_count,
    years_experience = excluded.years_experience,
    consultation_fee_minor = excluded.consultation_fee_minor,
    currency_code = excluded.currency_code,
    biography = excluded.biography,
    is_bookable = excluded.is_bookable;