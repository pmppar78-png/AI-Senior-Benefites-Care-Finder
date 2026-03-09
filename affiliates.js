/**
 * affiliates.js
 * Client-side affiliate recommendation engine for Senior Benefits Care Finder.
 *
 * - Detects the current page category from the URL path
 * - Dynamically injects contextual affiliate recommendation cards
 * - Places affiliate blocks after the first .content-section and before .cta-section
 * - Uses the site's existing CSS classes (.affiliate-card, .affiliate-grid, etc.)
 */
(function () {
  'use strict';

  /* ===================================================================
     Affiliate Partner Database – organised by page category
     =================================================================== */
  var affiliateDB = {
    medicare: {
      heading: 'Medicare Plan Comparison Tools',
      subtitle: 'Well-known platforms people use to compare Medicare plans. Always review details carefully and speak with licensed agents before making decisions.',
      partners: [
        {
          name: 'eHealth Medicare',
          url: 'https://www.ehealthmedicare.com',
          tagline: 'Compare Medicare Advantage, Medigap & Part D plans side by side'
        },
        {
          name: 'Medicare.gov Plan Finder',
          url: 'https://www.medicare.gov/plan-compare',
          tagline: 'Official government Medicare plan comparison tool'
        },
        {
          name: 'GoHealth Medicare',
          url: 'https://www.gohealth.com/medicare',
          tagline: 'Talk to licensed agents about Medicare options'
        },
        {
          name: 'SelectQuote Medicare',
          url: 'https://www.selectquote.com/medicare',
          tagline: 'Get personalized Medicare plan recommendations'
        },
        {
          name: 'Mutual of Omaha',
          url: 'https://www.mutualofomaha.com/medicare-supplement',
          tagline: 'Trusted Medigap supplement insurance plans'
        }
      ]
    },

    medicaid: {
      heading: 'Medicaid Eligibility & Enrollment Resources',
      subtitle: 'Helpful tools for checking Medicaid eligibility and understanding your options. Verify all details with your state Medicaid office.',
      partners: [
        {
          name: 'Benefits.gov',
          url: 'https://www.benefits.gov/benefit/606',
          tagline: 'Check Medicaid eligibility and apply online'
        },
        {
          name: 'Medicaid.gov',
          url: 'https://www.medicaid.gov',
          tagline: 'Official Medicaid information and resources'
        },
        {
          name: 'eHealth',
          url: 'https://www.ehealthinsurance.com/medicaid',
          tagline: 'Explore Medicaid and health insurance options'
        }
      ]
    },

    'assisted-living': {
      heading: 'Assisted Living Resources',
      subtitle: 'Trusted platforms for researching senior living communities. Always tour facilities in person and verify costs directly.',
      partners: [
        {
          name: 'A Place for Mom',
          url: 'https://www.aplaceformom.com',
          tagline: 'Free assisted living referral service with local advisors'
        },
        {
          name: 'Caring.com',
          url: 'https://www.caring.com',
          tagline: 'Compare assisted living communities and read reviews'
        },
        {
          name: 'SeniorLiving.org',
          url: 'https://www.seniorliving.org',
          tagline: 'Research senior living options and costs'
        },
        {
          name: 'AgingCare',
          url: 'https://www.agingcare.com',
          tagline: 'Caregiver support and senior care resources'
        }
      ]
    },

    'home-care': {
      heading: 'Home Care Resources',
      subtitle: 'Platforms to help you find and compare in-home care services. Always check references and verify caregiver credentials.',
      partners: [
        {
          name: 'Care.com',
          url: 'https://www.care.com/senior-care',
          tagline: 'Find vetted in-home caregivers near you'
        },
        {
          name: 'Home Instead',
          url: 'https://www.homeinstead.com',
          tagline: 'Professional in-home senior care services'
        },
        {
          name: 'Visiting Angels',
          url: 'https://www.visitingangels.com',
          tagline: 'Personalized home care for seniors'
        },
        {
          name: 'Caring.com',
          url: 'https://www.caring.com/senior-care/in-home-care',
          tagline: 'Compare home care agencies and read reviews'
        }
      ]
    },

    'social-security': {
      heading: 'Social Security Resources & Tools',
      subtitle: 'Useful tools for understanding and managing your Social Security benefits. Always verify information at ssa.gov.',
      partners: [
        {
          name: 'SSA.gov',
          url: 'https://www.ssa.gov/myaccount',
          tagline: 'Create your my Social Security account to manage benefits'
        },
        {
          name: 'AARP Social Security Calculator',
          url: 'https://www.aarp.org/retirement/social-security/benefits-calculator',
          tagline: 'Estimate your Social Security retirement benefits'
        },
        {
          name: 'National Council on Aging',
          url: 'https://www.ncoa.org/article/social-security-benefits-for-seniors',
          tagline: 'Expert guidance on maximizing Social Security'
        }
      ]
    },

    'veterans-benefits': {
      heading: 'Veterans Benefits Resources',
      subtitle: 'Trusted resources for veteran seniors and their families. Always confirm eligibility with VA.gov or a Veterans Service Organization.',
      partners: [
        {
          name: 'VA.gov',
          url: 'https://www.va.gov/claim-or-appeal-status',
          tagline: 'Check your VA claim status and apply for benefits'
        },
        {
          name: 'Veterans Aid',
          url: 'https://www.veteranaid.org',
          tagline: 'Free help applying for VA Aid & Attendance benefits'
        },
        {
          name: 'DAV',
          url: 'https://www.dav.org',
          tagline: 'Free assistance with VA benefits claims'
        },
        {
          name: 'AARP Veterans Benefits',
          url: 'https://www.aarp.org/home-family/voices/veterans',
          tagline: 'Resources and advocacy for veteran seniors'
        }
      ]
    },

    'prescription-assistance': {
      heading: 'Prescription Assistance Tools',
      subtitle: 'Resources that may help lower prescription drug costs. Always confirm pricing and program eligibility before making changes to your medications.',
      partners: [
        {
          name: 'GoodRx',
          url: 'https://www.goodrx.com',
          tagline: 'Compare prescription drug prices and get discount coupons'
        },
        {
          name: 'RxAssist',
          url: 'https://www.rxassist.org',
          tagline: 'Find patient assistance programs for your medications'
        },
        {
          name: 'NeedyMeds',
          url: 'https://www.needymeds.org',
          tagline: 'Search for prescription drug assistance programs'
        },
        {
          name: 'Medicare Extra Help',
          url: 'https://www.ssa.gov/medicare/part-d-extra-help',
          tagline: 'Apply for Medicare Part D Extra Help to lower drug costs'
        }
      ]
    },

    'long-term-care': {
      heading: 'Long-Term Care Planning Resources',
      subtitle: 'Tools and guides for understanding long-term care costs and planning options. Speak with a financial advisor for personalized guidance.',
      partners: [
        {
          name: 'Genworth Cost of Care',
          url: 'https://www.genworth.com/aging-and-you/finances/cost-of-care.html',
          tagline: 'Research long-term care costs in your area'
        },
        {
          name: 'LongTermCare.gov',
          url: 'https://www.longtermcare.acl.gov',
          tagline: 'Federal resource for long-term care planning'
        },
        {
          name: 'AARP Long-Term Care Calculator',
          url: 'https://www.aarp.org/caregiving/financial-legal/info-2017/long-term-care-calculator.html',
          tagline: 'Estimate future long-term care costs'
        },
        {
          name: 'American Association for Long-Term Care Insurance',
          url: 'https://www.aaltci.org',
          tagline: 'Compare long-term care insurance quotes'
        }
      ]
    },

    'senior-legal': {
      heading: 'Senior Legal & Estate Planning Resources',
      subtitle: 'Helpful starting points for estate planning and elder law questions. Always consult a qualified attorney for legal advice.',
      partners: [
        {
          name: 'LegalZoom',
          url: 'https://www.legalzoom.com/personal/estate-planning',
          tagline: 'Create wills, trusts, and power of attorney documents online'
        },
        {
          name: 'AARP Legal Services',
          url: 'https://www.aarp.org/money/estate-planning',
          tagline: 'Estate planning resources for seniors'
        },
        {
          name: 'National Academy of Elder Law Attorneys',
          url: 'https://www.naela.org',
          tagline: 'Find a qualified elder law attorney near you'
        },
        {
          name: 'Nolo',
          url: 'https://www.nolo.com/legal-encyclopedia/elder-law',
          tagline: 'Free legal guides for seniors and caregivers'
        }
      ]
    },

    'low-income-programs': {
      heading: 'Low-Income Assistance Resources',
      subtitle: 'Tools to help discover government benefit programs you may qualify for. Eligibility varies, so verify details with the issuing agency.',
      partners: [
        {
          name: 'Benefits.gov',
          url: 'https://www.benefits.gov',
          tagline: 'Check eligibility for 1,000+ government benefit programs'
        },
        {
          name: 'BenefitsCheckUp',
          url: 'https://www.benefitscheckup.org',
          tagline: 'NCOA tool to find benefits you may qualify for'
        },
        {
          name: 'LIHEAP',
          url: 'https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap',
          tagline: 'Apply for energy assistance to lower utility bills'
        },
        {
          name: '211.org',
          url: 'https://www.211.org',
          tagline: 'Connect with local assistance for food, housing, and bills'
        }
      ]
    },

    'disability-benefits': {
      heading: 'Disability Benefits Resources',
      subtitle: 'Resources for understanding and applying for disability benefits. Always confirm eligibility with official program offices.',
      partners: [
        {
          name: 'SSA Disability',
          url: 'https://www.ssa.gov/disability',
          tagline: 'Apply for SSDI and SSI disability benefits'
        },
        {
          name: 'Disability Benefits Center',
          url: 'https://www.disabilitybenefitscenter.org',
          tagline: 'Free evaluation for disability benefit eligibility'
        },
        {
          name: 'National Disability Rights Network',
          url: 'https://www.ndrn.org',
          tagline: 'Legal advocacy for people with disabilities'
        }
      ]
    },

    compare: {
      heading: 'Helpful Resources & Tools',
      subtitle: 'Popular platforms for comparing senior benefits and care options. Review each resource carefully and speak with licensed professionals.',
      partners: [
        {
          name: 'eHealth Medicare',
          url: 'https://www.ehealthmedicare.com',
          tagline: 'Compare Medicare plans side by side'
        },
        {
          name: 'A Place for Mom',
          url: 'https://www.aplaceformom.com',
          tagline: 'Find the right senior care options'
        },
        {
          name: 'GoodRx',
          url: 'https://www.goodrx.com',
          tagline: 'Lower your prescription drug costs'
        },
        {
          name: 'Benefits.gov',
          url: 'https://www.benefits.gov',
          tagline: 'Discover government benefits you qualify for'
        }
      ]
    }
  };

  /* ===================================================================
     Detect the current page category from the URL path
     =================================================================== */
  function detectCategory() {
    var path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');

    // Homepage or empty path -> compare / general
    if (!path || path === 'index.html') {
      return 'compare';
    }

    // First segment of the path is the category
    var firstSegment = path.split('/')[0];

    // Direct match
    if (affiliateDB[firstSegment]) {
      return firstSegment;
    }

    // Fallback to compare / general
    return 'compare';
  }

  /* ===================================================================
     Build a single affiliate recommendation block
     =================================================================== */
  var MAX_CARDS = 4;

  function buildAffiliateBlock(categoryData) {
    var section = document.createElement('section');
    section.className = 'affiliate-reco content-section';

    // Heading
    var heading = document.createElement('h2');
    heading.textContent = categoryData.heading;
    section.appendChild(heading);

    // Subtitle
    var subtitle = document.createElement('p');
    subtitle.style.fontSize = '0.9rem';
    subtitle.style.color = 'var(--text-muted)';
    subtitle.style.marginBottom = '0.6rem';
    subtitle.textContent = categoryData.subtitle;
    section.appendChild(subtitle);

    // Grid of affiliate cards
    var grid = document.createElement('div');
    grid.className = 'affiliate-grid';

    var partners = categoryData.partners.slice(0, MAX_CARDS);
    for (var i = 0; i < partners.length; i++) {
      var p = partners[i];
      var card = document.createElement('a');
      card.className = 'affiliate-card';
      card.href = p.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer sponsored';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'affiliate-name';
      nameSpan.textContent = p.name;
      card.appendChild(nameSpan);

      var tagSpan = document.createElement('span');
      tagSpan.className = 'affiliate-tagline';
      tagSpan.textContent = p.tagline;
      card.appendChild(tagSpan);

      grid.appendChild(card);
    }

    section.appendChild(grid);

    // Disclosure note
    var note = document.createElement('p');
    note.className = 'affiliate-note small';
    note.textContent =
      'Affiliate disclosure: Some links on this page may be affiliate or sponsored links. ' +
      'This site may receive compensation if you click through and take action. ' +
      'This does not influence our editorial content. We only feature resources we believe are genuinely useful for seniors and caregivers. ' +
      'Always verify details with official sources and licensed professionals before making decisions.';
    section.appendChild(note);

    return section;
  }

  /* ===================================================================
     Inject affiliate blocks into the page
     =================================================================== */
  function injectAffiliateBlocks() {
    var category = detectCategory();
    var data = affiliateDB[category];

    if (!data || !data.partners || data.partners.length === 0) {
      return;
    }

    // Placement A: After the first .content-section
    var contentSections = document.querySelectorAll('.content-section');
    if (contentSections.length > 0) {
      var firstSection = contentSections[0];
      var blockA = buildAffiliateBlock(data);
      firstSection.parentNode.insertBefore(blockA, firstSection.nextSibling);
    }

    // Placement B: Before the .cta-section
    var ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
      var blockB = buildAffiliateBlock(data);
      ctaSection.parentNode.insertBefore(blockB, ctaSection);
    }
  }

  /* ===================================================================
     Run on DOMContentLoaded
     =================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAffiliateBlocks);
  } else {
    // DOM is already ready
    injectAffiliateBlocks();
  }
})();
