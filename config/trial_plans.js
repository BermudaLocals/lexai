module.exports = {
  free_trial: {
    name: "Free Trial",
    price: 0,
    duration_days: 7,
    seats: 1,
    credits_per_seat: 10,
    total_credits: 10,
    storage_gb: 1,
    features: {
      draft: true,          // ✅
      analyze: true,         // ✅ risk 0-100
      research: false,
      caseLaw: false,
      litigation: false,
      redline: false,
      rag: false,
      workflows: false,
      vault: false,
      teamInvite: false,
      exportDocx: false,
      apiAccess: false
    },
    limits: {
      maxDraftsPerDay: 3,
      maxPagesUpload: 5
    }
  },
  trial_177: {
    name: "$1.77 Trial",
    price: 1.77,
    price_per_seat: true,
    duration_days: 3,
    seats: 5, // max for trial, pay $1.77 x seats = $8.85 for 5
    credits_per_seat: 100,
    total_credits: 500, // 5 x 100 = 500 = your $1500 funnel sample
    storage_gb: 10,
    features: {
      draft: true,
      analyze: true,
      research: true,       // ✅ full 16
      caseLaw: true,
      litigation: true,
      redline: true,
      rag: true,            // ✅ RAG unlocked
      workflows: true,      // ✅ Workflows unlocked
      vault: true,
      teamInvite: true,     // ✅ can invite 5
      exportDocx: true,
      apiAccess: true
    },
    limits: {
      maxDraftsPerDay: 100,
      maxPagesUpload: 100
    },
    converts_to: "solo", // P-5L658710MJ5062539NIX2A7I $300/seat after 3 days
    paypal_plan_id: "P-5L658710MJ5062539NIX2A7I"
  }
};
