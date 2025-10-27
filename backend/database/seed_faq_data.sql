-- Seed FAQ Categories and Articles
-- Initial FAQ data for WasteWise AI platform

-- Insert FAQ Categories
INSERT INTO faq_categories (name, description, icon, sort_order) VALUES
('Getting Started', 'Questions about setting up and using WasteWise AI', '🚀', 1),
('Integrations', 'Questions about connecting POS, ERP, CRM, and WFM systems', '🔌', 2),
('AI Features', 'Questions about AI forecasting, recommendations, and analytics', '🤖', 3),
('Billing & Plans', 'Questions about pricing, subscriptions, and billing', '💳', 4),
('Troubleshooting', 'Common issues and solutions', '🔧', 5),
('Account Management', 'Questions about user accounts and settings', '👤', 6)
ON CONFLICT (name) DO NOTHING;

-- Get category IDs
DO $$
DECLARE
    cat_getting_started UUID;
    cat_integrations UUID;
    cat_ai_features UUID;
    cat_billing UUID;
    cat_troubleshooting UUID;
    cat_account UUID;
BEGIN
    SELECT id INTO cat_getting_started FROM faq_categories WHERE name = 'Getting Started';
    SELECT id INTO cat_integrations FROM faq_categories WHERE name = 'Integrations';
    SELECT id INTO cat_ai_features FROM faq_categories WHERE name = 'AI Features';
    SELECT id INTO cat_billing FROM faq_categories WHERE name = 'Billing & Plans';
    SELECT id INTO cat_troubleshooting FROM faq_categories WHERE name = 'Troubleshooting';
    SELECT id INTO cat_account FROM faq_categories WHERE name = 'Account Management';

    -- Getting Started Articles
    INSERT INTO faq_articles (category_id, title, content, keywords, priority) VALUES
    (cat_getting_started, 'How do I get started with WasteWise AI?', 
     'Getting started is easy! Sign up for a free trial, connect your POS system (like StoreHub), and start tracking waste. Our AI will begin learning your patterns and providing recommendations within 30 days.',
     ARRAY['start', 'begin', 'setup', 'getting started', 'signup', 'trial'], 10),
    
    (cat_getting_started, 'How long does it take to see results?',
     'You can start tracking waste immediately. AI-powered recommendations typically begin appearing after 30 days of data collection. Most users see measurable waste reduction within 45-60 days.',
     ARRAY['results', 'time', 'how long', 'when', 'timeline', 'reduce'], 9),
    
    (cat_getting_started, 'What data do I need to provide?',
     'Minimum data required: sales transactions from your POS, inventory levels, and waste logs. Optional but recommended: supplier data, staff schedules, and customer data from CRM systems.',
     ARRAY['data', 'information', 'requirements', 'what data', 'need'], 8);

    -- Integration Articles
    INSERT INTO faq_articles (category_id, title, content, keywords, priority) VALUES
    (cat_integrations, 'How do I connect StoreHub POS?',
     'Navigate to Settings > Integrations > StoreHub. Enter your StoreHub API credentials (Store ID, API Key). Click "Test Connection" to verify, then "Sync Now" to import your sales data.',
     ARRAY['storehub', 'pos', 'connect', 'integration', 'sync', 'api'], 10),
    
    (cat_integrations, 'What POS systems are supported?',
     'We support StoreHub (Malaysia), Square, Lightspeed, and custom API integrations. More systems are added regularly based on user demand.',
     ARRAY['pos', 'systems', 'supported', 'which', 'compatible', 'compatibility'], 8),
    
    (cat_integrations, 'Can I connect multiple data sources?',
     'Yes! You can connect POS (sales), ERP (inventory/suppliers), CRM (customers), and WFM (staff) systems simultaneously. More data sources provide better AI recommendations.',
     ARRAY['multiple', 'sources', 'connect', 'data', 'several', 'many'], 7),
    
    (cat_integrations, 'How often does data sync?',
     'By default, data syncs in real-time for POS systems and hourly for ERP/CRM systems. You can adjust sync frequency in Integration Settings.',
     ARRAY['sync', 'frequency', 'how often', 'update', 'refresh', 'schedule'], 6);

    -- AI Features Articles
    INSERT INTO faq_articles (category_id, title, content, keywords, priority) VALUES
    (cat_ai_features, 'How accurate is the demand forecasting?',
     'Our AI forecasting achieves 75-85% accuracy after 30+ days of data. Accuracy improves over time as the system learns your patterns, peak hours, and seasonal trends.',
     ARRAY['forecast', 'accuracy', 'prediction', 'how accurate', 'precise'], 9),
    
    (cat_ai_features, 'What waste reduction can I expect?',
     'Typical waste reduction ranges from 15-30%, with enterprise clients achieving up to 35%. Results vary based on data quality, current waste levels, and implementation of recommendations.',
     ARRAY['reduction', 'waste', 'reduce', 'expect', 'results', 'savings'], 10),
    
    (cat_ai_features, 'How does the AI detect anomalies?',
     'Our AI uses statistical models (Z-score, Isolation Forest) to identify unusual patterns in sales, inventory, or waste. When anomalies are detected, root cause analysis suggests corrective actions.',
     ARRAY['anomaly', 'detect', 'issues', 'problems', 'alert', 'warning'], 8),
    
    (cat_ai_features, 'What recommendations does the AI provide?',
     'The AI provides prescriptive recommendations for: ingredient ordering (perpetual suggestions), labor scheduling (optimal staffing), inventory optimization (reorder points), and waste prevention strategies.',
     ARRAY['recommendations', 'suggestions', 'advice', 'tips', 'what', 'provide'], 7);

    -- Billing Articles
    INSERT INTO faq_articles (category_id, title, content, keywords, priority) VALUES
    (cat_billing, 'What are the pricing plans?',
     'We offer Free (1 outlet), Professional (5 outlets), Enterprise (unlimited), and Elite (custom). All plans include a 60-day free trial. See Pricing page for details.',
     ARRAY['pricing', 'price', 'cost', 'plans', 'subscription', 'how much'], 10),
    
    (cat_billing, 'Is there a free trial?',
     'Yes! All plans include a 60-day free trial with full features. No credit card required for trial signup.',
     ARRAY['trial', 'free', 'test', 'demo', 'no credit card'], 9),
    
    (cat_billing, 'Can I cancel anytime?',
     'Yes, you can cancel your subscription anytime from Account Settings. You''ll retain access until the end of your billing period.',
     ARRAY['cancel', 'unsubscribe', 'stop', 'end', 'terminate'], 8),
    
    (cat_billing, 'What payment methods are accepted?',
     'We accept credit cards, debit cards, and bank transfers (for enterprise plans). All payments are processed securely via Stripe.',
     ARRAY['payment', 'pay', 'methods', 'credit card', 'stripe', 'how to pay'], 7);

    -- Troubleshooting Articles
    INSERT INTO faq_articles (category_id, title, content, keywords, priority) VALUES
    (cat_troubleshooting, 'Why is my integration not syncing?',
     'Check: 1) API credentials are correct, 2) Integration status is "Active", 3) Check sync logs for errors. If issues persist, contact support.',
     ARRAY['sync', 'not working', 'failed', 'error', 'issue', 'problem'], 9),
    
    (cat_troubleshooting, 'My forecasts seem inaccurate',
     'Forecast accuracy requires 30+ days of consistent data. Ensure: 1) POS data is syncing regularly, 2) Historical data covers peak/off-peak periods, 3) Outliers are flagged correctly.',
     ARRAY['forecast', 'inaccurate', 'wrong', 'incorrect', 'not working'], 8),
    
    (cat_troubleshooting, 'How do I reset my password?',
     'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. The link expires in 1 hour.',
     ARRAY['password', 'reset', 'forgot', 'change', 'update'], 7);

    -- Account Management Articles
    INSERT INTO faq_articles (category_id, title, content, keywords, priority) VALUES
    (cat_account, 'How do I add team members?',
     'Go to Settings > Team Management. Click "Add Member", enter their email, and assign roles (Admin, Manager, or Viewer). They''ll receive an invitation email.',
     ARRAY['team', 'members', 'add', 'invite', 'users', 'collaborate'], 8),
    
    (cat_account, 'Can I change my plan?',
     'Yes! Upgrade or downgrade anytime from Settings > Billing. Changes take effect immediately, with prorated billing adjustments.',
     ARRAY['plan', 'upgrade', 'downgrade', 'change', 'switch'], 7),
    
    (cat_account, 'How do I export my data?',
     'Navigate to Analytics > Reports. Select your date range and data type, then click "Export" to download CSV or PDF reports.',
     ARRAY['export', 'download', 'data', 'report', 'csv', 'pdf'], 6);

END $$;

-- Insert keywords for better matching
INSERT INTO faq_keywords (article_id, keyword, weight)
SELECT 
    a.id,
    keyword,
    1.0
FROM faq_articles a
CROSS JOIN LATERAL unnest(a.keywords) AS keyword
ON CONFLICT (article_id, keyword) DO NOTHING;

