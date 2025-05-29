# Diet Tracker App - Pricing Strategy

## Current Pricing Model
- **Free Plan**: $0.00/month
  - Basic features with ads
  - Local storage only
  - Limited functionality
  
- **Basic Plan**: $1.25/month
  - Ad-free experience
  - Daily and weekly reports
  - Local storage only
  
- **Premium Plan**: $4.25/month
  - All features (ad-free, reports, cloud sync, etc.)
  - Cross-device synchronization
  - Cloud data backup

## Cost Analysis

### Infrastructure Costs (Monthly Estimates)
- **Firebase Usage**:
  - Authentication: $0.01-0.05 per user (free tier covers first 50K authentications)
  - Firestore: $0.18 per GB storage, $0.06 per 100K reads, $0.18 per 100K writes
  - Cloud Storage: $0.026 per GB for standard storage
  
- **Server Costs**:
  - Basic backend services: $5-20/month depending on scale
  - Database hosting: Covered by Firebase costs
  
- **Third-party Services**:
  - Payment processing fees: ~2.9% + $0.30 per transaction
  - Food database API: $0-50/month depending on usage

- **Advertising Costs**:
  - User acquisition: $1-3 per user acquisition
  - Marketing campaigns: Variable based on strategy

### Per-User Cost Estimate
- **Free Users**: ~$0.05-0.15/month (server costs, occasional database usage)
- **Basic Users**: ~$0.20-0.40/month (server costs, database usage)
- **Premium Users**: ~$0.50-1.00/month (server costs, increased storage, sync features)

## Market Analysis

### Competitor Pricing
- **MyFitnessPal**: 
  - Free tier with ads
  - Premium at $9.99/month or $49.99/year ($4.17/month)
  
- **Lose It!**: 
  - Free tier with limitations
  - Premium at $7.99/month or $39.99/year ($3.33/month)
  
- **Cronometer**:
  - Free tier with ads
  - Gold plan at $7.99/month or $39.99/year ($3.33/month)

- **Noom**:
  - Subscription-only model
  - ~$59/month (premium coaching service)

- **Lifesum**:
  - Free tier with limitations
  - Premium at $4.17-8.33/month depending on subscription length

### Market Positioning
- Most competitors offer yearly plans at significant discounts (40-50% off monthly price)
- Average monthly price for premium features: $5-8/month
- Average yearly price: $40-60/year ($3.33-5.00/month)

## Recommendations

### Revised Pricing Structure

1. **Free Plan**: $0.00
   - Keep as acquisition channel
   - Limited to basic tracking features
   - Ad-supported
   - Local storage only (data lost if app uninstalled)
   - Limited to basic food entries with occasional ad viewing

2. **Basic Plan**: $2.99/month or $24.99/year ($2.08/month)
   - Ad-free experience
   - Unlimited food entries
   - Enhanced reports and analytics
   - Local storage only
   
3. **Premium Plan**: $5.99/month or $49.99/year ($4.17/month)
   - All Basic features
   - Cloud sync across devices
   - Data backup and restore
   - Advanced analytics and insights
   - Priority customer support

### Rationale
- Current basic plan at $1.25/month is below market value and may not cover costs
- Premium plan at $4.25/month is competitive but could be slightly increased
- Adding annual plans can improve retention and cash flow
- Price points are strategic: under $3 for basic (psychological threshold) and under $6 for premium

### Implementation Strategy
1. Grandfather existing subscribers at their current rates for 6 months
2. Introduce annual plans as a value option
3. Highlight the value proposition of each tier clearly in the app
4. Consider promotional pricing for first-time subscribers (first month at 50% off)

## Projected Revenue Analysis

### Assumptions
- Free-to-paid conversion rate: 5-8%
- Basic-to-premium upgrade rate: 25-30%
- Annual plan adoption rate: 40-60% of paid users
- Average user lifetime: 10-12 months

### Monthly Average Revenue Per User (ARPU)
- **Current Model**: ~$0.30-0.45 (across all users)
- **Proposed Model**: ~$0.50-0.75 (across all users)

### Break-Even Analysis
- With infrastructure costs averaging $0.20-1.00 per user per month
- Free users supported by ad revenue: ~$0.10-0.30/month/user
- Need approximately 3,000-5,000 active users to break even on costs

## Next Steps
1. A/B test price points with new users
2. Survey existing users on willingness to pay for specific features
3. Analyze usage patterns to identify most valuable premium features
4. Create compelling upgrade prompts at key moments in user journey 