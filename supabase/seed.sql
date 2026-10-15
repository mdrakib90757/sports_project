-- ==============================================================================
-- BENGAL SUPER CUP 2026 - DEMO SEED DATA
-- ==============================================================================

-- 1. TOURNAMENT
INSERT INTO public.tournaments (id, name, name_bn, season, logo_url, banner_url, status, format)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Kochnapur Premier League Season 3',
    'কচনাপুর প্রিমিয়ার লিগ সিজন ৩',
    'Season 3 (2026)',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=160&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&auto=format&fit=crop&q=80',
    'ongoing',
    'Group Stage + Knockout'
) ON CONFLICT (id) DO NOTHING;

-- 2. TEAMS (8 TEAMS)
INSERT INTO public.teams (id, name, name_bn, short_name, logo_url, primary_color, secondary_color, group_name, city, city_bn, coach, coach_bn, stadium, stadium_bn)
VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Kochnapur Riders', 'কচনাপুর রাইডার্স', 'KRD',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
    '#10b981', '#064e3b', 'Group A', 'Kochnapur North', 'কচনাপুর উত্তরপাড়া', 'Rafiqul Islam', 'রফিকুল ইসলাম', 'Kochnapur Central Ground', 'কচনাপুর কেন্দ্রীয় খেলার মাঠ'
),
(
    '11111111-1111-1111-1111-111111111102',
    'Kochnapur Kings', 'কচনাপুর কিংস', 'KKS',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=120&auto=format&fit=crop&q=80',
    '#ef4444', '#7f1d1d', 'Group A', 'Kochnapur South', 'কচনাপুর দক্ষিণপাড়া', 'Shah Alam', 'শাহ আলম', 'Kochnapur High School Field', 'কচনাপুর হাই স্কুল মাঠ'
),
(
    '11111111-1111-1111-1111-111111111103',
    'Kochnapur Tigers', 'কচনাপুর টাইগার্স', 'KTG',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=120&auto=format&fit=crop&q=80',
    '#f97316', '#7c2d12', 'Group A', 'Kochnapur East', 'কচনাপুর পূর্বপাড়া', 'Tarek Rahman', 'তারেক রহমান', 'Kochnapur Stadium Ground', 'কচনাপুর স্টেডিয়াম মাঠ'
),
(
    '11111111-1111-1111-1111-111111111104',
    'Kochnapur Stars', 'কচনাপুর স্টারস', 'KST',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=120&auto=format&fit=crop&q=80',
    '#06b6d4', '#164e63', 'Group A', 'Kochnapur Bazaar', 'কচনাপুর বাজার একাদশ', 'Kamal Hossain', 'কামাল হোসেন', 'Kochnapur College Ground', 'কচনাপুর কলেজ মাঠ'
),
(
    '11111111-1111-1111-1111-111111111105',
    'Kochnapur Warriors', 'কচনাপুর ওয়ারিয়র্স', 'KWR',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=120&auto=format&fit=crop&q=80',
    '#a855f7', '#581c87', 'Group B', 'Kochnapur West', 'কচনাপুর পশ্চিমপাড়া', 'Zakir Hossain', 'জাকির হোসেন', 'Kochnapur Railway Field', 'কচনাপুর রেলওয়ে মাঠ'
),
(
    '11111111-1111-1111-1111-111111111106',
    'Kochnapur Falcons', 'কচনাপুর ফ্যালকনস', 'KFL',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=120&auto=format&fit=crop&q=80',
    '#14b8a6', '#134e4a', 'Group B', 'Kochnapur Central', 'কচনাপুর মধ্যপাড়া', 'Mobarak Ali', 'মোবারক আলী', 'Kochnapur Mini Stadium', 'কচনাপুর মিনি স্টেডিয়াম'
),
(
    '11111111-1111-1111-1111-111111111107',
    'Kochnapur Super Giants', 'কচনাপুর সুপার জায়ান্টস', 'KSG',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
    '#84cc16', '#365314', 'Group B', 'Kochnapur New Town', 'কচনাপুর নতুনপাড়া', 'Masud Rana', 'মাসুদ রানা', 'Kochnapur Sports Park', 'কচনাপুর স্পোর্টস পার্ক'
),
(
    '11111111-1111-1111-1111-111111111108',
    'Kochnapur Fighters', 'কচনাপুর ফাইটার্স', 'KFT',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=120&auto=format&fit=crop&q=80',
    '#ec4899', '#831843', 'Group B', 'Kochnapur Colony', 'কচনাপুর কলোনি একাদশ', 'Ibrahim Khalil', 'ইব্রাহিম খলিল', 'Kochnapur Shanti Maidan', 'কচনাপুর শান্তি ময়দান'
) ON CONFLICT (id) DO NOTHING;

-- 3. PLAYERS (KEY STARS & SQUAD MEMBERS)
INSERT INTO public.players (id, team_id, name, name_bn, jersey_number, position, photo_url, is_captain, goals_count, assists_count, yellow_cards, appearances)
VALUES
-- Dhaka Dynamos
('22222222-2222-2222-2222-222222222101', '11111111-1111-1111-1111-111111111101', 'Anisur Rahman', 'আনিসুর রহমান', 1, 'GK', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', true, 0, 0, 0, 3),
('22222222-2222-2222-2222-222222222102', '11111111-1111-1111-1111-111111111101', 'Tariq Kazi', 'তারিক কাজী', 2, 'DEF', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', false, 0, 0, 1, 3),
('22222222-2222-2222-2222-222222222103', '11111111-1111-1111-1111-111111111101', 'Topu Barman', 'তপু বর্মন', 4, 'DEF', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', false, 1, 0, 0, 3),
('22222222-2222-2222-2222-222222222104', '11111111-1111-1111-1111-111111111101', 'Jamal Bhuyan', 'জামাল ভূঁইয়া', 8, 'MID', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', false, 2, 3, 0, 3),
('22222222-2222-2222-2222-222222222105', '11111111-1111-1111-1111-111111111101', 'Sohel Rana', 'সোহেল রানা', 6, 'MID', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', false, 0, 2, 1, 3),
('22222222-2222-2222-2222-222222222106', '11111111-1111-1111-1111-111111111101', 'Foysal Fahim', 'ফয়সাল ফাহিম', 7, 'FWD', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', false, 3, 1, 0, 3),
('22222222-2222-2222-2222-222222222107', '11111111-1111-1111-1111-111111111101', 'Shekh Morsalin', 'শেখ মোরসালিন', 9, 'FWD', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80', false, 5, 1, 0, 3),
('22222222-2222-2222-2222-222222222108', '11111111-1111-1111-1111-111111111101', 'Rakib Hossain', 'রাকিব হোসেন', 10, 'FWD', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80', false, 4, 2, 0, 3),

-- Chittagong Challengers
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 'Ashraful Islam Rana', 'আশরাফুল ইসলাম রানা', 1, 'GK', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', false, 0, 0, 0, 3),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Sushanto Tripura', 'সুশান্ত ত্রিপুরা', 3, 'DEF', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80', true, 0, 0, 0, 3),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'Yeasin Khan', 'ইয়াসিন খান', 5, 'DEF', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80', false, 0, 0, 2, 3),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'Biplo Ahmed', 'বিপলু আহমেদ', 8, 'MID', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80', false, 1, 2, 0, 3),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', 'Motin Mia', 'মতিন মিয়া', 9, 'FWD', 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=120&auto=format&fit=crop&q=80', false, 3, 0, 0, 3),
('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111102', 'Mahbubur Rahman Sufil', 'মাহবুবুর রহমান সুফিল', 11, 'FWD', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', false, 2, 2, 0, 3)
ON CONFLICT (id) DO NOTHING;

-- 4. MATCHES (1 LIVE MATCH, COMPLETED MATCHES, UPCOMING FIXTURES)
INSERT INTO public.matches (id, tournament_id, home_team_id, away_team_id, home_score, away_score, status, current_minute, is_clock_running, match_date, venue, venue_bn, round, round_bn, stage)
VALUES
-- LIVE MATCH
(
    '33333333-3333-3333-3333-333333333001',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111101', -- Dhaka
    '11111111-1111-1111-1111-111111111102', -- Chittagong
    2, 1, 'live_second_half', 68, true, NOW(),
    'Bangabandhu National Stadium, Dhaka', 'বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা',
    'Group Stage - Matchday 3', 'গ্রুপ পর্ব - ম্যাচডে ৩', 'group'
),
-- UPCOMING TODAY
(
    '33333333-3333-3333-3333-333333333002',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111105', -- Barisal
    '11111111-1111-1111-1111-111111111107', -- Rangpur
    0, 0, 'upcoming', 0, false, NOW() + INTERVAL '4 hours',
    'Abdur Rab Serniabat Stadium, Barisal', 'আব্দুর রব সেরনিয়াবাত স্টেডিয়াম, বরিশাল',
    'Group Stage - Matchday 3', 'গ্রুপ পর্ব - ম্যাচডে ৩', 'group'
),
-- FINISHED MATCH 1
(
    '33333333-3333-3333-3333-333333333003',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111103', -- Sylhet
    '11111111-1111-1111-1111-111111111104', -- Rajshahi
    3, 2, 'full_time', 90, false, NOW() - INTERVAL '1 day',
    'Sylhet District Stadium, Sylhet', 'সিলেট জেলা স্টেডিয়াম, সিলেট',
    'Group Stage - Matchday 2', 'গ্রুপ পর্ব - ম্যাচডে ২', 'group'
),
-- FINISHED MATCH 2
(
    '33333333-3333-3333-3333-333333333004',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111105', -- Barisal
    '11111111-1111-1111-1111-111111111106', -- Khulna
    1, 1, 'full_time', 90, false, NOW() - INTERVAL '2 days',
    'Abdur Rab Serniabat Stadium, Barisal', 'আব্দুর রব সেরনিয়াবাত স্টেডিয়াম, বরিশাল',
    'Group Stage - Matchday 2', 'গ্রুপ পর্ব - ম্যাচডে ২', 'group'
),
-- KNOCKOUT QUARTER FINAL 1
(
    '33333333-3333-3333-3333-333333333005',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111101', -- Dhaka
    '11111111-1111-1111-1111-111111111106', -- Khulna
    0, 0, 'upcoming', 0, false, NOW() + INTERVAL '5 days',
    'Bangabandhu National Stadium, Dhaka', 'বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা',
    'Quarter-Final 1', 'কোয়ার্টার-ফাইনাল ১', 'quarter_final'
)
ON CONFLICT (id) DO NOTHING;

-- 5. MATCH EVENTS FOR LIVE MATCH
INSERT INTO public.match_events (id, match_id, team_id, player_id, assist_player_id, event_type, minute, description)
VALUES
(
    '44444444-4444-4444-4444-444444444001',
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222107', -- Morsalin
    '22222222-2222-2222-2222-222222222104', -- Jamal Bhuyan
    'goal', 14, 'Thunderous strike into top corner from 22 yards after Jamal Bhuyan slipped a through ball!'
),
(
    '44444444-4444-4444-4444-444444444002',
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111102',
    '22222222-2222-2222-2222-222222222203', -- Yeasin Khan
    NULL,
    'yellow_card', 29, 'Tactical foul pulling down Rakib Hossain on the counter attack.'
),
(
    '44444444-4444-4444-4444-444444444003',
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111102',
    '22222222-2222-2222-2222-222222222205', -- Motin Mia
    '22222222-2222-2222-2222-222222222206', -- Sufil
    'goal', 42, 'Deft volley inside the six-yard box connecting with a pinpoint cross from Sufil!'
),
(
    '44444444-4444-4444-4444-444444444004',
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222108', -- Rakib Hossain
    '22222222-2222-2222-2222-222222222106', -- Foysal Fahim
    'goal', 57, 'Clinical finish under the goalkeeper following a rapid transition down the right flank!'
)
ON CONFLICT (id) DO NOTHING;

