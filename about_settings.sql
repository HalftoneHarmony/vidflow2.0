-- Improved About Page Settings SQL
-- This version uses formatted JSON for better database readability.

INSERT INTO general_settings (key, value)
VALUES 
('about_hero_subtitle', 'The premier engine for high-performance visual storytelling and elite production management.'),
('about_narrative_title', 'Built for Impact.'),
('about_narrative_subtext', 'WE DON''T DO "STORYTELLING". WE DO VISUAL ARCHITECTURE.'),
('about_stats', '[
  {
    "label": "Elite Productions",
    "value": "500+"
  },
  {
    "label": "Global Reach",
    "value": "24"
  },
  {
    "label": "Design Awards",
    "value": "12"
  },
  {
    "label": "Visionaries",
    "value": "150+"
  }
]'),
('about_manifesto_title', 'The Code of Excellence'),
('about_manifesto_items', '[
  {
    "title": "Industrial Precision",
    "desc": "Every frame is a calculation of emotional and technical mass. We don''t miss."
  },
  {
    "title": "Extreme Aesthetic",
    "desc": "If it''s not beautiful, it''s garbage. We pursue the absolute peak of visual hierarchy."
  },
  {
    "title": "Radical Sovereignty",
    "desc": "We own our process, our vision, and our impact. We lead from the front."
  }
]'),
('about_cta_title', 'Ready to Flow?'),
('about_cta_desc', 'Join the ranks of high-performance athletes and directors who trust VidFlow for their most critical productions.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
